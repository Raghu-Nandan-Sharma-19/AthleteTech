import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children }) {
  const { currentUser, userDetails } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Redirect to appropriate dashboard based on user type
  if (userDetails?.userType === 'coach' && window.location.pathname === '/athlete-dashboard') {
    return <Navigate to="/coach-dashboard" />;
  }
  if (userDetails?.userType === 'athlete' && window.location.pathname === '/coach-dashboard') {
    return <Navigate to="/athlete-dashboard" />;
  }

  return children;
} 