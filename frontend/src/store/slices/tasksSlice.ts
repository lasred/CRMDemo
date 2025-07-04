import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tasksAPI } from '../../services/api';
import { Task } from '../../types';

interface TasksState {
  tasks: Task[];
  myTasks: Task[];
  currentTask: Task | null;
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  total: number;
}

const initialState: TasksState = {
  tasks: [],
  myTasks: [],
  currentTask: null,
  isLoading: false,
  error: null,
  totalPages: 0,
  currentPage: 1,
  total: 0,
};

export const fetchTasks = createAsyncThunk(
  'tasks/fetchAll',
  async (params?: any) => {
    const response = await tasksAPI.getAll(params);
    return response.data;
  }
);

export const fetchMyTasks = createAsyncThunk(
  'tasks/fetchMy',
  async (params?: any) => {
    const response = await tasksAPI.getMyTasks(params);
    return response.data;
  }
);

export const fetchTask = createAsyncThunk(
  'tasks/fetchOne',
  async (id: string) => {
    const response = await tasksAPI.getOne(id);
    return response.data;
  }
);

export const createTask = createAsyncThunk(
  'tasks/create',
  async (data: any) => {
    const response = await tasksAPI.create(data);
    return response.data;
  }
);

export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ id, data }: { id: string; data: any }) => {
    const response = await tasksAPI.update(id, data);
    return response.data;
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (id: string) => {
    await tasksAPI.delete(id);
    return id;
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload.tasks;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.total = action.payload.total;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch tasks';
      })
      .addCase(fetchMyTasks.fulfilled, (state, action) => {
        state.myTasks = action.payload;
      })
      .addCase(fetchTask.fulfilled, (state, action) => {
        state.currentTask = action.payload;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?._id === action.payload._id) {
          state.currentTask = action.payload;
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(t => t._id !== action.payload);
      });
  },
});

export const { clearCurrentTask } = tasksSlice.actions;
export default tasksSlice.reducer;