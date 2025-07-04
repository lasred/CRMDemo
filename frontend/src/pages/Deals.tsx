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
import { Add, Search, AttachMoney } from '@mui/icons-material';
import { format } from 'date-fns';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { fetchDeals } from '../store/slices/dealsSlice';
import DealForm from '../components/DealForm';

const Deals: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { deals, isLoading, total } = useAppSelector((state) => state.deals);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [openForm, setOpenForm] = useState(false);

  useEffect(() => {
    dispatch(fetchDeals({ page: page + 1, limit: pageSize, search: searchTerm }));
  }, [dispatch, page, pageSize, searchTerm]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'closed_won':
        return 'success';
      case 'closed_lost':
        return 'error';
      case 'negotiation':
        return 'warning';
      case 'proposal':
        return 'info';
      default:
        return 'default';
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'Deal Name',
      flex: 1,
      renderCell: (params) => (
        <Typography
          sx={{ cursor: 'pointer', color: 'primary.main' }}
          onClick={() => navigate(`/deals/${params.row._id}`)}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'value',
      headerName: 'Value',
      width: 150,
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          <AttachMoney fontSize="small" />
          {formatCurrency(params.value)}
        </Box>
      ),
    },
    {
      field: 'stage',
      headerName: 'Stage',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value.replace('_', ' ')}
          size="small"
          color={getStageColor(params.value)}
        />
      ),
    },
    {
      field: 'company',
      headerName: 'Company',
      flex: 1,
      renderCell: (params) => params.row.company?.name || '-',
    },
    {
      field: 'contact',
      headerName: 'Contact',
      flex: 1,
      renderCell: (params) =>
        params.row.contact
          ? `${params.row.contact.firstName} ${params.row.contact.lastName}`
          : '-',
    },
    {
      field: 'expectedCloseDate',
      headerName: 'Expected Close',
      width: 150,
      renderCell: (params) =>
        format(new Date(params.value), 'MMM d, yyyy'),
    },
    {
      field: 'probability',
      headerName: 'Probability',
      width: 100,
      renderCell: (params) => `${params.value}%`,
    },
  ];

  const rows = deals.map((deal) => ({
    ...deal,
    id: deal._id,
  }));

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Deals</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenForm(true)}
        >
          Add Deal
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search deals..."
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

      <DealForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={() => {
          setOpenForm(false);
          dispatch(fetchDeals({ page: 1, limit: pageSize }));
        }}
      />
    </Box>
  );
};

export default Deals;