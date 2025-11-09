import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { GuestRoute } from './components/GuestRoute';
import { DashboardLayout } from './layouts/DashboardLayout';
import { UserLayout } from './layouts/UserLayout';
import { theme } from './theme/theme';

// Admin Pages
import { Login } from './pages/admin/Login';
import { Register } from './pages/admin/Register';
import { EventsList } from './pages/admin/EventsList';
import { CreateEvent } from './pages/admin/CreateEvent';
import { EditEvent } from './pages/admin/EditEvent';

// User Pages
import { EventsGallery } from './pages/user/EventsGallery';
import { EventDetails } from './pages/user/EventDetails';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* User Portal Routes (Public) */}
              <Route path="/" element={<UserLayout />}>
                <Route index element={<EventsGallery />} />
                <Route path="events/:id" element={<EventDetails />} />
              </Route>

              {/* Admin Authentication Routes (Guest Only) */}
              <Route element={<GuestRoute />}>
                <Route path="/admin/login" element={<Login />} />
                <Route path="/admin/register" element={<Register />} />
              </Route>

              {/* Admin Dashboard Routes (Protected) */}
              <Route path="/admin/dashboard" element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route index element={<Navigate to="/admin/dashboard/events" replace />} />
                  <Route path="events" element={<EventsList />} />
                  <Route path="events/create" element={<CreateEvent />} />
                  <Route path="events/:id/edit" element={<EditEvent />} />
                </Route>
              </Route>

              {/* Fallback Routes */}
              <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
