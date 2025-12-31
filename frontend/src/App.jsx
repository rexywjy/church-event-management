import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './lib/auth';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';

import AdminDashboard from './pages/admin/Dashboard';
import Approvals from './pages/admin/Approvals';
import ManageUsers from './pages/admin/ManageUsers';
import CreateUser from './pages/admin/CreateUser';
import EditUser from './pages/admin/EditUser';
import ManageEvents from './pages/admin/ManageEvents';
import EventForm from './pages/admin/EventForm';
import EventRegistrations from './pages/admin/EventRegistrations';
import Attendance from './pages/admin/Attendance';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function Home() {
  const { isAdmin } = useAuth();
  return <Navigate to={isAdmin ? '/admin' : '/events'} replace />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            <Route path="/events" element={
              <ProtectedRoute>
                <Events />
              </ProtectedRoute>
            } />
            
            <Route path="/events/:id" element={
              <ProtectedRoute>
                <EventDetail />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/approvals" element={
              <ProtectedRoute requireAdmin>
                <Approvals />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/users" element={
              <ProtectedRoute requireAdmin>
                <ManageUsers />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/users/create" element={
              <ProtectedRoute requireSuperadmin>
                <CreateUser />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/users/:id/edit" element={
              <ProtectedRoute requireSuperadmin>
                <EditUser />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/events" element={
              <ProtectedRoute requireAdmin>
                <ManageEvents />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/events/new" element={
              <ProtectedRoute requireAdmin>
                <EventForm />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/events/:id/edit" element={
              <ProtectedRoute requireAdmin>
                <EventForm />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/events/:id/registrations" element={
              <ProtectedRoute requireAdmin>
                <EventRegistrations />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/attendance/:sessionId" element={
              <ProtectedRoute requireAdmin>
                <Attendance />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
