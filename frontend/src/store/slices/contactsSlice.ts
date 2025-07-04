import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { contactsAPI } from '../../services/api';
import { Contact } from '../../types';

interface ContactsState {
  contacts: Contact[];
  currentContact: Contact | null;
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  total: number;
}

const initialState: ContactsState = {
  contacts: [],
  currentContact: null,
  isLoading: false,
  error: null,
  totalPages: 0,
  currentPage: 1,
  total: 0,
};

export const fetchContacts = createAsyncThunk(
  'contacts/fetchAll',
  async (params?: any) => {
    const response = await contactsAPI.getAll(params);
    return response.data;
  }
);

export const fetchContact = createAsyncThunk(
  'contacts/fetchOne',
  async (id: string) => {
    const response = await contactsAPI.getOne(id);
    return response.data;
  }
);

export const createContact = createAsyncThunk(
  'contacts/create',
  async (data: any) => {
    const response = await contactsAPI.create(data);
    return response.data;
  }
);

export const updateContact = createAsyncThunk(
  'contacts/update',
  async ({ id, data }: { id: string; data: any }) => {
    const response = await contactsAPI.update(id, data);
    return response.data;
  }
);

export const deleteContact = createAsyncThunk(
  'contacts/delete',
  async (id: string) => {
    await contactsAPI.delete(id);
    return id;
  }
);

const contactsSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    clearCurrentContact: (state) => {
      state.currentContact = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContacts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contacts = action.payload.contacts;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.total = action.payload.total;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch contacts';
      })
      .addCase(fetchContact.fulfilled, (state, action) => {
        state.currentContact = action.payload;
      })
      .addCase(createContact.fulfilled, (state, action) => {
        state.contacts.unshift(action.payload);
      })
      .addCase(updateContact.fulfilled, (state, action) => {
        const index = state.contacts.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.contacts[index] = action.payload;
        }
        if (state.currentContact?._id === action.payload._id) {
          state.currentContact = action.payload;
        }
      })
      .addCase(deleteContact.fulfilled, (state, action) => {
        state.contacts = state.contacts.filter(c => c._id !== action.payload);
      });
  },
});

export const { clearCurrentContact } = contactsSlice.actions;
export default contactsSlice.reducer;