import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

export default function PrivateRoute({ children, userType }) {
  const { currentUser, userDetails } = useAuth();

  // Show loading state while userDetails is being fetched
  if (!currentUser || !userDetails) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/" />;
  }

  // Redirect if user type doesn't match
  if (userDetails.userType !== userType) {
    return <Navigate to={`/${userDetails.userType}-dashboard`} />;
  }

  return children;
} 