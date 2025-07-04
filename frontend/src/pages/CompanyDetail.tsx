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
  Avatar,
  Card,
  CardContent,
} from '@mui/material';
import {
  Edit,
  Delete,
  ArrowBack,
  Business,
  Phone,
  Language,
  People,
  AttachMoney,
  LocationOn,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { fetchCompany, deleteCompany } from '../store/slices/companiesSlice';
import { companiesAPI } from '../services/api';
import CompanyForm from '../components/CompanyForm';
import { Contact, Deal, Activity } from '../types';

const CompanyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentCompany } = useAppSelector((state) => state.companies);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchCompany(id));
      fetchRelatedData();
    }
  }, [id, dispatch]);

  const fetchRelatedData = async () => {
    if (!id) return;
    try {
      const [contactsRes, dealsRes, activitiesRes] = await Promise.all([
        companiesAPI.getContacts(id),
        companiesAPI.getDeals(id),
        companiesAPI.getActivities(id),
      ]);
      setContacts(contactsRes.data);
      setDeals(dealsRes.data);
      setActivities(activitiesRes.data);
    } catch (error) {
      console.error('Failed to fetch related data:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      await dispatch(deleteCompany(id!));
      navigate('/companies');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      default: return 'warning';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'customer': return 'success';
      case 'prospect': return 'primary';
      case 'partner': return 'info';
      default: return 'default';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const totalDealValue = deals.reduce((sum, deal) => sum + deal.value, 0);

  if (!currentCompany) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <IconButton onClick={() => navigate('/companies')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4">{currentCompany.name}</Typography>
            <Box display="flex" alignItems="center" gap={2} mt={1}>
              <Chip
                label={currentCompany.type}
                size="small"
                color={getTypeColor(currentCompany.type)}
              />
              <Chip
                label={currentCompany.status}
                size="small"
                color={getStatusColor(currentCompany.status)}
              />
              {currentCompany.industry && (
                <Typography variant="body2" color="textSecondary">
                  {currentCompany.industry}
                </Typography>
              )}
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
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Company Information
            </Typography>
            <List>
              {currentCompany.phone && (
                <ListItem>
                  <ListItemText
                    primary="Phone"
                    secondary={
                      <Box display="flex" alignItems="center">
                        <Phone fontSize="small" sx={{ mr: 0.5 }} />
                        {currentCompany.phone}
                      </Box>
                    }
                  />
                </ListItem>
              )}
              {currentCompany.website && (
                <ListItem>
                  <ListItemText
                    primary="Website"
                    secondary={
                      <Box display="flex" alignItems="center">
                        <Language fontSize="small" sx={{ mr: 0.5 }} />
                        <a href={currentCompany.website} target="_blank" rel="noopener noreferrer">
                          {currentCompany.website}
                        </a>
                      </Box>
                    }
                  />
                </ListItem>
              )}
              {currentCompany.size && (
                <ListItem>
                  <ListItemText
                    primary="Company Size"
                    secondary={currentCompany.size + ' employees'}
                  />
                </ListItem>
              )}
              {currentCompany.revenue && (
                <ListItem>
                  <ListItemText
                    primary="Annual Revenue"
                    secondary={formatCurrency(currentCompany.revenue)}
                  />
                </ListItem>
              )}
              <ListItem>
                <ListItemText
                  primary="Owner"
                  secondary={
                    typeof currentCompany.owner === 'object'
                      ? currentCompany.owner.name
                      : 'Unknown'
                  }
                />
              </ListItem>
            </List>
          </Paper>

          {currentCompany.address && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
                Address
              </Typography>
              <Typography variant="body2">
                {currentCompany.address.street}
                {currentCompany.address.street && <br />}
                {currentCompany.address.city}
                {currentCompany.address.city && currentCompany.address.state && ', '}
                {currentCompany.address.state} {currentCompany.address.zipCode}
                {(currentCompany.address.city || currentCompany.address.state) && <br />}
                {currentCompany.address.country}
              </Typography>
            </Paper>
          )}
        </Grid>

        <Grid item xs={12} md={8}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <People />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Contacts
                      </Typography>
                      <Typography variant="h5">{contacts.length}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                      <AttachMoney />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Deals
                      </Typography>
                      <Typography variant="h5">{deals.length}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                      <AttachMoney />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Total Value
                      </Typography>
                      <Typography variant="h5">
                        {formatCurrency(totalDealValue)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Paper sx={{ p: 3 }}>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
              <Tab label="Overview" />
              <Tab label={`Contacts (${contacts.length})`} />
              <Tab label={`Deals (${deals.length})`} />
              <Tab label="Activities" />
            </Tabs>
            <Divider sx={{ mb: 2 }} />

            {tabValue === 0 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Description
                </Typography>
                <Typography paragraph>
                  {currentCompany.description || 'No description available'}
                </Typography>

                {currentCompany.tags && currentCompany.tags.length > 0 && (
                  <>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                      Tags
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {currentCompany.tags.map((tag, index) => (
                        <Chip key={index} label={tag} size="small" />
                      ))}
                    </Box>
                  </>
                )}
              </Box>
            )}

            {tabValue === 1 && (
              <List>
                {contacts.length === 0 ? (
                  <Typography color="textSecondary">No contacts yet</Typography>
                ) : (
                  contacts.map((contact) => (
                    <ListItem
                      key={contact._id}
                      button
                      onClick={() => navigate(`/contacts/${contact._id}`)}
                    >
                      <ListItemText
                        primary={`${contact.firstName} ${contact.lastName}`}
                        secondary={
                          <>
                            {contact.title && <Typography variant="body2">{contact.title}</Typography>}
                            <Typography variant="body2" color="textSecondary">
                              {contact.email} • {contact.phone}
                            </Typography>
                          </>
                        }
                      />
                      <Chip
                        label={contact.status}
                        size="small"
                        color={contact.status === 'customer' ? 'success' : 'default'}
                      />
                    </ListItem>
                  ))
                )}
              </List>
            )}

            {tabValue === 2 && (
              <List>
                {deals.length === 0 ? (
                  <Typography color="textSecondary">No deals yet</Typography>
                ) : (
                  deals.map((deal) => (
                    <ListItem
                      key={deal._id}
                      button
                      onClick={() => navigate(`/deals/${deal._id}`)}
                    >
                      <ListItemText
                        primary={deal.title}
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              {formatCurrency(deal.value)} • {deal.stage.replace('_', ' ')}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Expected close: {format(new Date(deal.expectedCloseDate), 'MMM d, yyyy')}
                            </Typography>
                          </Box>
                        }
                      />
                      <Chip
                        label={`${deal.probability}%`}
                        size="small"
                        color={deal.probability >= 75 ? 'success' : 'default'}
                      />
                    </ListItem>
                  ))
                )}
              </List>
            )}

            {tabValue === 3 && (
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

      <CompanyForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSuccess={() => {
          setEditOpen(false);
          if (id) {
            dispatch(fetchCompany(id));
            fetchRelatedData();
          }
        }}
        company={currentCompany}
      />
    </Box>
  );
};

export default CompanyDetail;