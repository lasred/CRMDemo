import React, { useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
} from '@mui/material';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { fetchPipeline } from '../store/slices/dealsSlice';
import { useNavigate } from 'react-router-dom';

const stageOrder = [
  'qualification',
  'needs_analysis',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost',
];

const stageTitles: { [key: string]: string } = {
  qualification: 'Qualification',
  needs_analysis: 'Needs Analysis',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
};

const Pipeline: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { pipeline } = useAppSelector((state) => state.deals);

  useEffect(() => {
    dispatch(fetchPipeline());
  }, [dispatch]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStageData = (stage: string) => {
    return pipeline.find((p) => p._id === stage) || { deals: [], totalValue: 0, count: 0 };
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Deal Pipeline
      </Typography>

      <Grid container spacing={2}>
        {stageOrder.map((stage) => {
          const stageData = getStageData(stage);
          return (
            <Grid item xs={12} md={2} key={stage}>
              <Paper
                sx={{
                  p: 2,
                  bgcolor:
                    stage === 'closed_won'
                      ? 'success.light'
                      : stage === 'closed_lost'
                      ? 'error.light'
                      : 'background.paper',
                  minHeight: 400,
                }}
              >
                <Typography variant="h6" gutterBottom>
                  {stageTitles[stage]}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {stageData.count} deals
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {formatCurrency(stageData.totalValue)}
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  {stageData.deals?.map((deal: any) => (
                    <Card
                      key={deal._id}
                      sx={{ mb: 1, cursor: 'pointer' }}
                      onClick={() => navigate(`/deals/${deal._id}`)}
                    >
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>
                          {deal.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {deal.company?.name}
                        </Typography>
                        <Chip
                          label={formatCurrency(deal.value)}
                          size="small"
                          color="primary"
                          sx={{ mt: 1 }}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default Pipeline;