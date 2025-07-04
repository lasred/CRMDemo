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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useForm, Controller } from 'react-hook-form';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { createDeal, updateDeal } from '../store/slices/dealsSlice';
import { fetchContacts } from '../store/slices/contactsSlice';
import { fetchCompanies } from '../store/slices/companiesSlice';
import { Deal } from '../types';

interface DealFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  deal?: Deal;
}

const DealForm: React.FC<DealFormProps> = ({
  open,
  onClose,
  onSuccess,
  deal,
}) => {
  const dispatch = useAppDispatch();
  const { contacts } = useAppSelector((state) => state.contacts);
  const { companies } = useAppSelector((state) => state.companies);
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      value: 0,
      currency: 'USD',
      stage: 'qualification',
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      contact: '',
      company: '',
      description: '',
      nextStep: '',
    },
  });

  useEffect(() => {
    if (open) {
      dispatch(fetchContacts({ limit: 100 }));
      dispatch(fetchCompanies({ limit: 100 }));
      if (deal) {
        reset({
          ...deal,
          contact: typeof deal.contact === 'object' ? deal.contact._id : deal.contact,
          company: typeof deal.company === 'object' ? deal.company._id : deal.company,
          expectedCloseDate: new Date(deal.expectedCloseDate),
        });
      }
    }
  }, [open, deal, reset, dispatch]);

  const onSubmit = async (data: any) => {
    try {
      if (deal) {
        await dispatch(updateDeal({ id: deal._id, data })).unwrap();
      } else {
        await dispatch(createDeal(data)).unwrap();
      }
      reset();
      onSuccess();
    } catch (error) {
      console.error('Failed to save deal:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{deal ? 'Edit Deal' : 'Add New Deal'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: 'Title is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Deal Title"
                      fullWidth
                      error={!!errors.title}
                      helperText={errors.title?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="value"
                  control={control}
                  rules={{ required: 'Value is required', min: 0 }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Deal Value"
                      type="number"
                      fullWidth
                      error={!!errors.value}
                      helperText={errors.value?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="stage"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Stage" fullWidth>
                      <MenuItem value="qualification">Qualification</MenuItem>
                      <MenuItem value="needs_analysis">Needs Analysis</MenuItem>
                      <MenuItem value="proposal">Proposal</MenuItem>
                      <MenuItem value="negotiation">Negotiation</MenuItem>
                      <MenuItem value="closed_won">Closed Won</MenuItem>
                      <MenuItem value="closed_lost">Closed Lost</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="contact"
                  control={control}
                  rules={{ required: 'Contact is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Contact"
                      fullWidth
                      error={!!errors.contact}
                      helperText={errors.contact?.message}
                    >
                      <MenuItem value="">Select Contact</MenuItem>
                      {contacts.map((contact) => (
                        <MenuItem key={contact._id} value={contact._id}>
                          {contact.firstName} {contact.lastName}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="company"
                  control={control}
                  rules={{ required: 'Company is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Company"
                      fullWidth
                      error={!!errors.company}
                      helperText={errors.company?.message}
                    >
                      <MenuItem value="">Select Company</MenuItem>
                      {companies.map((company) => (
                        <MenuItem key={company._id} value={company._id}>
                          {company.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="expectedCloseDate"
                  control={control}
                  rules={{ required: 'Expected close date is required' }}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="Expected Close Date"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.expectedCloseDate,
                          helperText: errors.expectedCloseDate?.message,
                        },
                      }}
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
                <Controller
                  name="nextStep"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Next Step"
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
            {deal ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DealForm;