import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Add, Search, Email, Phone } from '@mui/icons-material';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { fetchContacts } from '../store/slices/contactsSlice';
import ContactForm from '../components/ContactForm';

const Contacts: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { contacts, isLoading, totalPages, total } = useAppSelector(
    (state) => state.contacts
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    dispatch(fetchContacts({ page: page + 1, limit: pageSize, search: searchTerm }));
  }, [dispatch, page, pageSize, searchTerm]);

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      renderCell: (params) => (
        <Typography
          sx={{ cursor: 'pointer', color: 'primary.main' }}
          onClick={() => navigate(`/contacts/${params.row._id}`)}
        >
          {params.row.firstName} {params.row.lastName}
        </Typography>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          <Email fontSize="small" sx={{ mr: 0.5 }} />
          {params.value}
        </Box>
      ),
    },
    {
      field: 'phone',
      headerName: 'Phone',
      flex: 1,
      renderCell: (params) =>
        params.value && (
          <Box display="flex" alignItems="center">
            <Phone fontSize="small" sx={{ mr: 0.5 }} />
            {params.value}
          </Box>
        ),
    },
    {
      field: 'company',
      headerName: 'Company',
      flex: 1,
      renderCell: (params) => params.row.company?.name || '-',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={
            params.value === 'customer'
              ? 'success'
              : params.value === 'prospect'
              ? 'primary'
              : 'default'
          }
        />
      ),
    },
    {
      field: 'owner',
      headerName: 'Owner',
      flex: 1,
      renderCell: (params) => params.row.owner?.name || '-',
    },
  ];

  const rows = contacts.map((contact) => ({
    ...contact,
    id: contact._id,
  }));

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Contacts</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenForm(true)}
        >
          Add Contact
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={isLoading}
          rowCount={total}
          pageSizeOptions={[10, 25, 50]}
          paginationModel={{ page, pageSize }}
          paginationMode="server"
          onPaginationModelChange={(model) => {
            setPage(model.page);
            setPageSize(model.pageSize);
          }}
        />
      </Paper>

      <ContactForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={() => {
          setOpenForm(false);
          dispatch(fetchContacts({ page: 1, limit: pageSize }));
        }}
      />
    </Box>
  );
};

export default Contacts;