import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotifProvider } from './context/NotifContext';
import Layout from './components/shared/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ComplaintsPage from './pages/ComplaintsPage';
import ComplaintDetailPage from './pages/ComplaintDetailPage';
import SubmitComplaintPage from './pages/SubmitComplaintPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import UsersPage from './pages/UsersPage';
import Spinner from './components/shared/Spinner';
import "leaflet/dist/leaflet.css";
const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner fullScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner fullScreen />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <NotifProvider>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="complaints" element={<ComplaintsPage />} />
            <Route path="complaints/new" element={<SubmitComplaintPage />} />
            <Route path="complaints/:id" element={<ComplaintDetailPage />} />
            <Route path="admin" element={<PrivateRoute adminOnly><AdminDashboardPage /></PrivateRoute>} />
            <Route path="users" element={<PrivateRoute adminOnly><UsersPage /></PrivateRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </NotifProvider>
    </AuthProvider>
  );
}



