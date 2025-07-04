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
} from '@mui/material';
import {
  Email,
  Phone,
  Business,
  Edit,
  Delete,
  ArrowBack,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { fetchContact, deleteContact } from '../store/slices/contactsSlice';
import { contactsAPI } from '../services/api';
import ContactForm from '../components/ContactForm';
import { Activity } from '../types';

const ContactDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentContact } = useAppSelector((state) => state.contacts);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchContact(id));
      fetchActivities();
    }
  }, [id, dispatch]);

  const fetchActivities = async () => {
    try {
      const response = await contactsAPI.getActivities(id!);
      setActivities(response.data);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      await dispatch(deleteContact(id!));
      navigate('/contacts');
    }
  };

  if (!currentContact) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <IconButton onClick={() => navigate('/contacts')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4">
            {currentContact.firstName} {currentContact.lastName}
          </Typography>
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
              Contact Information
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Status"
                  secondary={
                    <Chip
                      label={currentContact.status}
                      size="small"
                      color={
                        currentContact.status === 'customer'
                          ? 'success'
                          : currentContact.status === 'prospect'
                          ? 'primary'
                          : 'default'
                      }
                    />
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Email"
                  secondary={
                    <Box display="flex" alignItems="center">
                      <Email fontSize="small" sx={{ mr: 0.5 }} />
                      {currentContact.email}
                    </Box>
                  }
                />
              </ListItem>
              {currentContact.phone && (
                <ListItem>
                  <ListItemText
                    primary="Phone"
                    secondary={
                      <Box display="flex" alignItems="center">
                        <Phone fontSize="small" sx={{ mr: 0.5 }} />
                        {currentContact.phone}
                      </Box>
                    }
                  />
                </ListItem>
              )}
              {currentContact.title && (
                <ListItem>
                  <ListItemText primary="Title" secondary={currentContact.title} />
                </ListItem>
              )}
              {typeof currentContact.company === 'object' && currentContact.company && (
                <ListItem>
                  <ListItemText
                    primary="Company"
                    secondary={
                      <Box display="flex" alignItems="center">
                        <Business fontSize="small" sx={{ mr: 0.5 }} />
                        {currentContact.company.name}
                      </Box>
                    }
                  />
                </ListItem>
              )}
              <ListItem>
                <ListItemText primary="Source" secondary={currentContact.source} />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Owner"
                  secondary={
                    typeof currentContact.owner === 'object'
                      ? currentContact.owner.name
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
              <Tab label="Activities" />
              <Tab label="Notes" />
            </Tabs>
            <Divider sx={{ mb: 2 }} />

            {tabValue === 0 && (
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

            {tabValue === 1 && (
              <Typography>
                {currentContact.notes || 'No notes available'}
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      <ContactForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSuccess={() => {
          setEditOpen(false);
          if (id) dispatch(fetchContact(id));
        }}
        contact={currentContact}
      />
    </Box>
  );
};

export default ContactDetail;