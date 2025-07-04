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
  Typography,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { createCompany, updateCompany } from '../store/slices/companiesSlice';
import { Company } from '../types';

interface CompanyFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  company?: Company;
}

const CompanyForm: React.FC<CompanyFormProps> = ({
  open,
  onClose,
  onSuccess,
  company,
}) => {
  const dispatch = useAppDispatch();
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      domain: '',
      industry: '',
      size: '',
      revenue: 0,
      phone: '',
      website: '',
      type: 'prospect',
      status: 'active',
      description: '',
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
    if (open && company) {
      reset(company);
    }
  }, [open, company, reset]);

  const onSubmit = async (data: any) => {
    try {
      if (company) {
        await dispatch(updateCompany({ id: company._id, data })).unwrap();
      } else {
        await dispatch(createCompany(data)).unwrap();
      }
      reset();
      onSuccess();
    } catch (error) {
      console.error('Failed to save company:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{company ? 'Edit Company' : 'Add New Company'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: 'Company name is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Company Name"
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="industry"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Industry"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Type" fullWidth>
                      <MenuItem value="prospect">Prospect</MenuItem>
                      <MenuItem value="customer">Customer</MenuItem>
                      <MenuItem value="partner">Partner</MenuItem>
                      <MenuItem value="vendor">Vendor</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Status" fullWidth>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="size"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Company Size" fullWidth>
                      <MenuItem value="">Not specified</MenuItem>
                      <MenuItem value="1-10">1-10</MenuItem>
                      <MenuItem value="11-50">11-50</MenuItem>
                      <MenuItem value="51-200">51-200</MenuItem>
                      <MenuItem value="201-500">201-500</MenuItem>
                      <MenuItem value="501-1000">501-1000</MenuItem>
                      <MenuItem value="1001-5000">1001-5000</MenuItem>
                      <MenuItem value="5000+">5000+</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="revenue"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Annual Revenue"
                      type="number"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Phone"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="website"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Website"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Description"
                      fullWidth
                      multiline
                      rows={3}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Address
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="address.street"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Street"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="address.city"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="City"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name="address.state"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="State"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name="address.zipCode"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Zip Code"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name="address.country"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Country"
                      fullWidth
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
            {company ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CompanyForm;