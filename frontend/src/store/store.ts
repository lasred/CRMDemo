import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import contactsReducer from './slices/contactsSlice';
import companiesReducer from './slices/companiesSlice';
import dealsReducer from './slices/dealsSlice';
import tasksReducer from './slices/tasksSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    contacts: contactsReducer,
    companies: companiesReducer,
    deals: dealsReducer,
    tasks: tasksReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;