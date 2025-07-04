import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Add,
  Search,
  CheckCircle,
  RadioButtonUnchecked,
  Delete,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { fetchTasks, updateTask, deleteTask } from '../store/slices/tasksSlice';
import TaskForm from '../components/TaskForm';

const Tasks: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tasks, isLoading, total } = useAppSelector((state) => state.tasks);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [openForm, setOpenForm] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);

  useEffect(() => {
    dispatch(fetchTasks({ page: page + 1, limit: pageSize, search: searchTerm }));
  }, [dispatch, page, pageSize, searchTerm]);

  const handleToggleComplete = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'todo' : 'completed';
    await dispatch(updateTask({ id: taskId, data: { status: newStatus } }));
    dispatch(fetchTasks({ page: page + 1, limit: pageSize, search: searchTerm }));
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this completed task?')) {
      await dispatch(deleteTask(taskId));
      dispatch(fetchTasks({ page: page + 1, limit: pageSize, search: searchTerm }));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'primary';
      default:
        return 'default';
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'status',
      headerName: '',
      width: 50,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={() => handleToggleComplete(params.row._id, params.value)}
        >
          {params.value === 'completed' ? (
            <CheckCircle color="success" />
          ) : (
            <RadioButtonUnchecked />
          )}
        </IconButton>
      ),
    },
    {
      field: 'title',
      headerName: 'Task',
      flex: 1,
      renderCell: (params) => (
        <Typography
          sx={{
            textDecoration:
              params.row.status === 'completed' ? 'line-through' : 'none',
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => (
        <Chip label={params.value} size="small" variant="outlined" />
      ),
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={getPriorityColor(params.value)}
        />
      ),
    },
    {
      field: 'dueDate',
      headerName: 'Due Date',
      width: 150,
      renderCell: (params) => format(new Date(params.value), 'MMM d, yyyy'),
    },
    {
      field: 'assignedTo',
      headerName: 'Assigned To',
      flex: 1,
      renderCell: (params) => params.row.assignedTo?.name || '-',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <>
          {params.row.status === 'completed' && (
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteTask(params.row._id)}
              title="Delete completed task"
            >
              <Delete />
            </IconButton>
          )}
        </>
      ),
    },
  ];

  const filteredTasks = showCompleted 
    ? tasks 
    : tasks.filter(task => task.status !== 'completed');
    
  const rows = filteredTasks.map((task) => ({
    ...task,
    id: task._id,
  }));

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Tasks</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenForm(true)}>
          Add Task
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            fullWidth
            placeholder="Search tasks..."
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
          <FormControlLabel
            control={
              <Checkbox
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
              />
            }
            label="Show completed"
          />
        </Box>
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

      <TaskForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={() => {
          setOpenForm(false);
          dispatch(fetchTasks({ page: 1, limit: pageSize }));
        }}
      />
    </Box>
  );
};

export default Tasks;