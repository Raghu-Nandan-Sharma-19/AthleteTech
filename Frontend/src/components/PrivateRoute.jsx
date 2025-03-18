import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

export default function PrivateRoute({ children, userType }) {
  const { currentUser, userDetails } = useAuth();

  // Show loading state while userDetails is being fetched
  if (!currentUser || !userDetails) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          zIndex: 9999
        }}
      >
        <CircularProgress 
          size={60}
          thickness={4}
          sx={{
            color: theme => theme.palette.primary.main
          }}
        />
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