import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { companiesAPI } from '../../services/api';
import { Company } from '../../types';

interface CompaniesState {
  companies: Company[];
  currentCompany: Company | null;
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  total: number;
}

const initialState: CompaniesState = {
  companies: [],
  currentCompany: null,
  isLoading: false,
  error: null,
  totalPages: 0,
  currentPage: 1,
  total: 0,
};

export const fetchCompanies = createAsyncThunk(
  'companies/fetchAll',
  async (params?: any) => {
    const response = await companiesAPI.getAll(params);
    return response.data;
  }
);

export const fetchCompany = createAsyncThunk(
  'companies/fetchOne',
  async (id: string) => {
    const response = await companiesAPI.getOne(id);
    return response.data;
  }
);

export const createCompany = createAsyncThunk(
  'companies/create',
  async (data: any) => {
    const response = await companiesAPI.create(data);
    return response.data;
  }
);

export const updateCompany = createAsyncThunk(
  'companies/update',
  async ({ id, data }: { id: string; data: any }) => {
    const response = await companiesAPI.update(id, data);
    return response.data;
  }
);

export const deleteCompany = createAsyncThunk(
  'companies/delete',
  async (id: string) => {
    await companiesAPI.delete(id);
    return id;
  }
);

const companiesSlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {
    clearCurrentCompany: (state) => {
      state.currentCompany = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanies.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.isLoading = false;
        state.companies = action.payload.companies;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.total = action.payload.total;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch companies';
      })
      .addCase(fetchCompany.fulfilled, (state, action) => {
        state.currentCompany = action.payload;
      })
      .addCase(createCompany.fulfilled, (state, action) => {
        state.companies.unshift(action.payload);
      })
      .addCase(updateCompany.fulfilled, (state, action) => {
        const index = state.companies.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.companies[index] = action.payload;
        }
        if (state.currentCompany?._id === action.payload._id) {
          state.currentCompany = action.payload;
        }
      })
      .addCase(deleteCompany.fulfilled, (state, action) => {
        state.companies = state.companies.filter(c => c._id !== action.payload);
      });
  },
});

export const { clearCurrentCompany } = companiesSlice.actions;
export default companiesSlice.reducer;