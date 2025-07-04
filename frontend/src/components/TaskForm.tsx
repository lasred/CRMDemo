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
import { createTask, updateTask } from '../store/slices/tasksSlice';
import { Task } from '../types';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  task?: Task;
}

const TaskForm: React.FC<TaskFormProps> = ({
  open,
  onClose,
  onSuccess,
  task,
}) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      type: 'other',
      priority: 'medium',
      status: 'todo',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      assignedTo: user?._id || '',
      notes: '',
    },
  });

  useEffect(() => {
    if (open && task) {
      reset({
        ...task,
        dueDate: new Date(task.dueDate),
        assignedTo: typeof task.assignedTo === 'object' ? task.assignedTo._id : task.assignedTo,
      });
    }
  }, [open, task, reset]);

  const onSubmit = async (data: any) => {
    try {
      if (task) {
        await dispatch(updateTask({ id: task._id, data })).unwrap();
      } else {
        await dispatch(createTask(data)).unwrap();
      }
      reset();
      onSuccess();
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{task ? 'Edit Task' : 'Add New Task'}</DialogTitle>
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
                      label="Task Title"
                      fullWidth
                      error={!!errors.title}
                      helperText={errors.title?.message}
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
                      <MenuItem value="call">Call</MenuItem>
                      <MenuItem value="email">Email</MenuItem>
                      <MenuItem value="meeting">Meeting</MenuItem>
                      <MenuItem value="demo">Demo</MenuItem>
                      <MenuItem value="follow_up">Follow Up</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Priority" fullWidth>
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="urgent">Urgent</MenuItem>
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
                      <MenuItem value="todo">To Do</MenuItem>
                      <MenuItem value="in_progress">In Progress</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="dueDate"
                  control={control}
                  rules={{ required: 'Due date is required' }}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="Due Date"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.dueDate,
                          helperText: errors.dueDate?.message,
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
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Notes"
                      fullWidth
                      multiline
                      rows={2}
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
            {task ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TaskForm;