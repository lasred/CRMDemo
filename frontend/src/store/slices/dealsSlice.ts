import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dealsAPI } from '../../services/api';
import { Deal } from '../../types';

interface DealsState {
  deals: Deal[];
  pipeline: any[];
  currentDeal: Deal | null;
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  total: number;
  stageStats: any[];
}

const initialState: DealsState = {
  deals: [],
  pipeline: [],
  currentDeal: null,
  isLoading: false,
  error: null,
  totalPages: 0,
  currentPage: 1,
  total: 0,
  stageStats: [],
};

export const fetchDeals = createAsyncThunk(
  'deals/fetchAll',
  async (params?: any) => {
    const response = await dealsAPI.getAll(params);
    return response.data;
  }
);

export const fetchPipeline = createAsyncThunk(
  'deals/fetchPipeline',
  async () => {
    const response = await dealsAPI.getPipeline();
    return response.data;
  }
);

export const fetchDeal = createAsyncThunk(
  'deals/fetchOne',
  async (id: string) => {
    const response = await dealsAPI.getOne(id);
    return response.data;
  }
);

export const createDeal = createAsyncThunk(
  'deals/create',
  async (data: any) => {
    const response = await dealsAPI.create(data);
    return response.data;
  }
);

export const updateDeal = createAsyncThunk(
  'deals/update',
  async ({ id, data }: { id: string; data: any }) => {
    const response = await dealsAPI.update(id, data);
    return response.data;
  }
);

export const deleteDeal = createAsyncThunk(
  'deals/delete',
  async (id: string) => {
    await dealsAPI.delete(id);
    return id;
  }
);

const dealsSlice = createSlice({
  name: 'deals',
  initialState,
  reducers: {
    clearCurrentDeal: (state) => {
      state.currentDeal = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeals.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDeals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.deals = action.payload.deals;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.total = action.payload.total;
        state.stageStats = action.payload.stageStats;
      })
      .addCase(fetchDeals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch deals';
      })
      .addCase(fetchPipeline.fulfilled, (state, action) => {
        state.pipeline = action.payload;
      })
      .addCase(fetchDeal.fulfilled, (state, action) => {
        state.currentDeal = action.payload;
      })
      .addCase(createDeal.fulfilled, (state, action) => {
        state.deals.unshift(action.payload);
      })
      .addCase(updateDeal.fulfilled, (state, action) => {
        const index = state.deals.findIndex(d => d._id === action.payload._id);
        if (index !== -1) {
          state.deals[index] = action.payload;
        }
        if (state.currentDeal?._id === action.payload._id) {
          state.currentDeal = action.payload;
        }
      })
      .addCase(deleteDeal.fulfilled, (state, action) => {
        state.deals = state.deals.filter(d => d._id !== action.payload);
      });
  },
});

export const { clearCurrentDeal } = dealsSlice.actions;
export default dealsSlice.reducer;