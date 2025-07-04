import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  Box,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { createContact, updateContact } from '../store/slices/contactsSlice';
import { fetchCompanies } from '../store/slices/companiesSlice';
import { Contact } from '../types';

interface ContactFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  contact?: Contact;
}

const ContactForm: React.FC<ContactFormProps> = ({
  open,
  onClose,
  onSuccess,
  contact,
}) => {
  const dispatch = useAppDispatch();
  const { companies } = useAppSelector((state) => state.companies);
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      mobile: '',
      title: '',
      company: '',
      department: '',
      status: 'lead',
      source: 'website',
      notes: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
    },
  });

  useEffect(() => {
    if (open) {
      dispatch(fetchCompanies({ limit: 100 }));
      if (contact) {
        reset({
          ...contact,
          company: typeof contact.company === 'object' ? contact.company._id : contact.company,
        });
      }
    }
  }, [open, contact, reset, dispatch]);

  const onSubmit = async (data: any) => {
    try {
      if (contact) {
        await dispatch(updateContact({ id: contact._id, data })).unwrap();
      } else {
        await dispatch(createContact(data)).unwrap();
      }
      reset();
      onSuccess();
    } catch (error) {
      console.error('Failed to save contact:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{contact ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="firstName"
                  control={control}
                  rules={{ required: 'First name is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="First Name"
                      fullWidth
                      error={!!errors.firstName}
                      helperText={errors.firstName?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="lastName"
                  control={control}
                  rules={{ required: 'Last name is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Last Name"
                      fullWidth
                      error={!!errors.lastName}
                      helperText={errors.lastName?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email"
                      fullWidth
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Phone" fullWidth />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="mobile"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Mobile" fullWidth />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Job Title" fullWidth />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="company"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Company"
                      fullWidth
                    >
                      <MenuItem value="">None</MenuItem>
                      {companies.map((company) => (
                        <MenuItem key={company._id} value={company._id}>
                          {company.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="department"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Department" fullWidth />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Status" fullWidth>
                      <MenuItem value="lead">Lead</MenuItem>
                      <MenuItem value="prospect">Prospect</MenuItem>
                      <MenuItem value="customer">Customer</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="source"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Source" fullWidth>
                      <MenuItem value="website">Website</MenuItem>
                      <MenuItem value="referral">Referral</MenuItem>
                      <MenuItem value="social">Social Media</MenuItem>
                      <MenuItem value="email">Email</MenuItem>
                      <MenuItem value="phone">Phone</MenuItem>
                      <MenuItem value="event">Event</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Notes"
                      fullWidth
                      multiline
                      rows={3}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {contact ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ContactForm;