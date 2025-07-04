import React, { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  People,
  Business,
  AttachMoney,
  Assignment,
  TrendingUp,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { dashboardAPI } from '../services/api';
import { DashboardStats } from '../types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await dashboardAPI.getStats();
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LinearProgress />;
  }

  if (!stats) {
    return <Typography>Failed to load dashboard data</Typography>;
  }

  const statCards = [
    {
      title: 'Total Contacts',
      value: stats.overview.totalContacts,
      icon: <People fontSize="large" />,
      color: '#1976d2',
    },
    {
      title: 'Total Companies',
      value: stats.overview.totalCompanies,
      icon: <Business fontSize="large" />,
      color: '#388e3c',
    },
    {
      title: 'Active Deals',
      value: stats.overview.totalDeals,
      icon: <AttachMoney fontSize="large" />,
      color: '#f57c00',
    },
    {
      title: 'Pending Tasks',
      value: stats.overview.pendingTasks,
      icon: <Assignment fontSize="large" />,
      color: '#d32f2f',
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {statCards.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: stat.color, mr: 2 }}>
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h5">{stat.value}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Revenue Overview
            </Typography>
            <Box display="flex" alignItems="center" mb={2}>
              <TrendingUp color="success" sx={{ mr: 1 }} />
              <Typography variant="h4">
                {formatCurrency(stats.overview.totalRevenue)}
              </Typography>
            </Box>
            <Typography variant="body2" color="textSecondary">
              Total Revenue (Closed Won Deals)
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Deal Pipeline
            </Typography>
            {stats.dealsByStage.map((stage) => (
              <Box key={stage._id} mb={1}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2">{stage._id}</Typography>
                  <Typography variant="body2">
                    {stage.count} deals - {formatCurrency(stage.totalValue)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(stage.count / stats.overview.totalDeals) * 100}
                />
              </Box>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <List>
              {stats.recentActivities.slice(0, 5).map((activity) => (
                <ListItem key={activity._id}>
                  <ListItemAvatar>
                    <Avatar>
                      {(activity.user as any)?.name?.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={activity.title}
                    secondary={
                      <>
                        {(activity.user as any)?.name} •{' '}
                        {format(new Date(activity.createdAt), 'MMM d, h:mm a')}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Tasks
            </Typography>
            <List>
              {stats.upcomingTasks.map((task) => (
                <ListItem key={task._id}>
                  <ListItemText
                    primary={task.title}
                    secondary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={task.priority}
                          size="small"
                          color={
                            task.priority === 'urgent'
                              ? 'error'
                              : task.priority === 'high'
                              ? 'warning'
                              : 'default'
                          }
                        />
                        <Typography variant="body2">
                          Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;