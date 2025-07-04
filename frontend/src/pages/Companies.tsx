import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Chip,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Add, Search, Business } from '@mui/icons-material';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { fetchCompanies } from '../store/slices/companiesSlice';
import CompanyForm from '../components/CompanyForm';

const Companies: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { companies, isLoading, total } = useAppSelector(
    (state) => state.companies
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [openForm, setOpenForm] = useState(false);

  useEffect(() => {
    dispatch(fetchCompanies({ page: page + 1, limit: pageSize, search: searchTerm }));
  }, [dispatch, page, pageSize, searchTerm]);

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Company Name',
      flex: 1,
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          <Business fontSize="small" sx={{ mr: 1 }} />
          <Typography
            sx={{ cursor: 'pointer', color: 'primary.main' }}
            onClick={() => navigate(`/companies/${params.row._id}`)}
          >
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'industry',
      headerName: 'Industry',
      flex: 1,
    },
    {
      field: 'type',
      headerName: 'Type',
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
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'active' ? 'success' : 'default'}
        />
      ),
    },
    {
      field: 'owner',
      headerName: 'Owner',
      flex: 1,
      renderCell: (params) => params.row.owner?.name || '-',
    },
    {
      field: 'revenue',
      headerName: 'Revenue',
      width: 150,
      renderCell: (params) =>
        params.value
          ? new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
            }).format(params.value)
          : '-',
    },
  ];

  const rows = companies.map((company) => ({
    ...company,
    id: company._id,
  }));

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Companies</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenForm(true)}
        >
          Add Company
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search companies..."
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

      <CompanyForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={() => {
          setOpenForm(false);
          dispatch(fetchCompanies({ page: 1, limit: pageSize }));
        }}
      />
    </Box>
  );
};

export default Companies;