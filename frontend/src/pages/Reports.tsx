import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  MenuItem,
  TextField,
  LinearProgress,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { dashboardAPI } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Reports: React.FC = () => {
  const [period, setPeriod] = useState('30days');
  const [analytics, setAnalytics] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, statsRes] = await Promise.all([
          dashboardAPI.getAnalytics(period),
          dashboardAPI.getStats(),
        ]);
        setAnalytics(analyticsRes.data);
        setStats(statsRes.data);
      } catch (error) {
        console.error('Failed to fetch report data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  if (loading) {
    return <LinearProgress />;
  }

  const monthlyRevenueData = {
    labels: stats?.monthlyRevenue.map((item: any) => 
      `${item._id.month}/${item._id.year}`
    ) || [],
    datasets: [
      {
        label: 'Monthly Revenue',
        data: stats?.monthlyRevenue.map((item: any) => item.revenue) || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  const dealStageData = {
    labels: stats?.dealsByStage.map((item: any) => item._id) || [],
    datasets: [
      {
        label: 'Deals by Stage',
        data: stats?.dealsByStage.map((item: any) => item.count) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)',
        ],
      },
    ],
  };

  const taskCompletionData = {
    labels: analytics?.taskCompletion.map((item: any) => item._id) || [],
    datasets: [
      {
        label: 'Tasks',
        data: analytics?.taskCompletion.map((item: any) => item.count) || [],
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(255, 99, 132, 0.5)',
        ],
      },
    ],
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Reports & Analytics</Typography>
        <TextField
          select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          size="small"
          sx={{ width: 200 }}
        >
          <MenuItem value="7days">Last 7 Days</MenuItem>
          <MenuItem value="30days">Last 30 Days</MenuItem>
          <MenuItem value="90days">Last 90 Days</MenuItem>
          <MenuItem value="1year">Last Year</MenuItem>
        </TextField>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                New Contacts
              </Typography>
              <Typography variant="h3">
                {analytics?.metrics.newContacts || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Closed Deals
              </Typography>
              <Typography variant="h3">
                {analytics?.metrics.closedDeals || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Conversion Rate
              </Typography>
              <Typography variant="h3">
                {analytics?.metrics.conversionRate || 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Revenue Trend
            </Typography>
            <Line data={monthlyRevenueData} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Deal Pipeline
            </Typography>
            <Doughnut data={dealStageData} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Task Completion
            </Typography>
            <Bar data={taskCompletionData} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Performers
            </Typography>
            {analytics?.topPerformers?.map((performer: any) => (
              <Box key={performer._id} mb={2}>
                <Box display="flex" justifyContent="space-between">
                  <Typography>{performer.user.name}</Typography>
                  <Typography fontWeight="bold">
                    ${performer.totalRevenue.toLocaleString()}
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {performer.dealCount} deals closed
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;