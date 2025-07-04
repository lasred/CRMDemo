import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Tab,
  Tabs,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  Edit,
  Delete,
  ArrowBack,
  AttachMoney,
  Business,
  Person,
  CalendarToday,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { fetchDeal, deleteDeal } from '../store/slices/dealsSlice';
import { dealsAPI } from '../services/api';
import DealForm from '../components/DealForm';
import { Activity } from '../types';

const DealDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentDeal } = useAppSelector((state) => state.deals);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchDeal(id));
      fetchActivities();
    }
  }, [id, dispatch]);

  const fetchActivities = async () => {
    if (!id) return;
    try {
      const response = await dealsAPI.getActivities(id);
      setActivities(response.data);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this deal?')) {
      await dispatch(deleteDeal(id!));
      navigate('/deals');
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'closed_won': return 'success';
      case 'closed_lost': return 'error';
      case 'negotiation': return 'warning';
      case 'proposal': return 'info';
      default: return 'default';
    }
  };

  if (!currentDeal) {
    return <Typography>Loading...</Typography>;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currentDeal.currency || 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <IconButton onClick={() => navigate('/deals')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4">{currentDeal.title}</Typography>
            <Box display="flex" alignItems="center" gap={2} mt={1}>
              <Chip
                label={currentDeal.stage.replace('_', ' ')}
                color={getStageColor(currentDeal.stage)}
              />
              <Typography variant="h5" color="primary">
                {formatCurrency(currentDeal.value)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {currentDeal.probability}% probability
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => setEditOpen(true)}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Deal Information
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Deal Value"
                  secondary={
                    <Box display="flex" alignItems="center">
                      <AttachMoney fontSize="small" sx={{ mr: 0.5 }} />
                      {formatCurrency(currentDeal.value)}
                    </Box>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Stage"
                  secondary={
                    <Chip
                      label={currentDeal.stage.replace('_', ' ')}
                      size="small"
                      color={getStageColor(currentDeal.stage)}
                    />
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Expected Close Date"
                  secondary={
                    <Box display="flex" alignItems="center">
                      <CalendarToday fontSize="small" sx={{ mr: 0.5 }} />
                      {format(new Date(currentDeal.expectedCloseDate), 'MMM d, yyyy')}
                    </Box>
                  }
                />
              </ListItem>
              {currentDeal.actualCloseDate && (
                <ListItem>
                  <ListItemText
                    primary="Actual Close Date"
                    secondary={format(new Date(currentDeal.actualCloseDate), 'MMM d, yyyy')}
                  />
                </ListItem>
              )}
              <ListItem>
                <ListItemText
                  primary="Contact"
                  secondary={
                    <Box display="flex" alignItems="center">
                      <Person fontSize="small" sx={{ mr: 0.5 }} />
                      {typeof currentDeal.contact === 'object' && currentDeal.contact
                        ? `${currentDeal.contact.firstName} ${currentDeal.contact.lastName}`
                        : 'Unknown'}
                    </Box>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Company"
                  secondary={
                    <Box display="flex" alignItems="center">
                      <Business fontSize="small" sx={{ mr: 0.5 }} />
                      {typeof currentDeal.company === 'object' && currentDeal.company
                        ? currentDeal.company.name
                        : 'Unknown'}
                    </Box>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Owner"
                  secondary={
                    typeof currentDeal.owner === 'object'
                      ? currentDeal.owner.name
                      : 'Unknown'
                  }
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
              <Tab label="Details" />
              <Tab label="Activities" />
            </Tabs>
            <Divider sx={{ mb: 2 }} />

            {tabValue === 0 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Description
                </Typography>
                <Typography paragraph>
                  {currentDeal.description || 'No description available'}
                </Typography>

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                  Next Step
                </Typography>
                <Typography paragraph>
                  {currentDeal.nextStep || 'No next step defined'}
                </Typography>

                {currentDeal.stage === 'closed_lost' && currentDeal.lostReason && (
                  <>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                      Lost Reason
                    </Typography>
                    <Typography paragraph>{currentDeal.lostReason}</Typography>
                  </>
                )}

                {currentDeal.stage === 'closed_won' && currentDeal.wonDetails && (
                  <>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                      Won Details
                    </Typography>
                    <Typography paragraph>{currentDeal.wonDetails}</Typography>
                  </>
                )}
              </Box>
            )}

            {tabValue === 1 && (
              <List>
                {activities.length === 0 ? (
                  <Typography color="textSecondary">No activities yet</Typography>
                ) : (
                  activities.map((activity) => (
                    <ListItem key={activity._id}>
                      <ListItemText
                        primary={activity.title}
                        secondary={
                          <>
                            {activity.description && (
                              <Typography variant="body2">
                                {activity.description}
                              </Typography>
                            )}
                            <Typography variant="caption" color="textSecondary">
                              {typeof activity.user === 'object'
                                ? activity.user.name
                                : 'Unknown'}{' '}
                              •{' '}
                              {format(
                                new Date(activity.createdAt),
                                'MMM d, yyyy h:mm a'
                              )}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))
                )}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      <DealForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSuccess={() => {
          setEditOpen(false);
          if (id) dispatch(fetchDeal(id));
        }}
        deal={currentDeal}
      />
    </Box>
  );
};

export default DealDetail;