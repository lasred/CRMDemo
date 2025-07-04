import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAppSelector } from './hooks/useAppSelector';
import { useAppDispatch } from './hooks/useAppDispatch';
import { setUser } from './store/slices/authSlice';
import { usersAPI } from './services/api';

import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import ContactDetail from './pages/ContactDetail';
import Companies from './pages/Companies';
import CompanyDetail from './pages/CompanyDetail';
import Deals from './pages/Deals';
import DealDetail from './pages/DealDetail';
import Pipeline from './pages/Pipeline';
import Tasks from './pages/Tasks';
import Reports from './pages/Reports';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAppSelector((state) => state.auth);
  return token ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      usersAPI.getMe()
        .then((response) => {
          dispatch(setUser(response.data));
        })
        .catch(() => {
          localStorage.removeItem('token');
        });
    }
  }, [token, dispatch]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/contacts" element={<Contacts />} />
                  <Route path="/contacts/:id" element={<ContactDetail />} />
                  <Route path="/companies" element={<Companies />} />
                  <Route path="/companies/:id" element={<CompanyDetail />} />
                  <Route path="/deals" element={<Deals />} />
                  <Route path="/deals/:id" element={<DealDetail />} />
                  <Route path="/pipeline" element={<Pipeline />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/reports" element={<Reports />} />
                </Routes>
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Box>
  );
}

export default App;