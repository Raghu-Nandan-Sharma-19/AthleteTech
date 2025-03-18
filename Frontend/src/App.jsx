import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { Box, CircularProgress } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import theme from './theme/theme';

// Import Roboto font
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

// Component imports
import Login from './components/Login';
import NewSignup from './components/NewSignup';
import AthleteDashboard from './components/AthleteDashboard';
import PrivateRoute from './components/PrivateRoute';

// Lazy load components
const CoachDashboard = React.lazy(() => import('./components/CoachDashboard'));

// Loading component
const LoadingFallback = () => (
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

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by error boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          flexDirection="column"
          gap={2}
        >
          <h1>Something went wrong.</h1>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </Box>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<NewSignup />} />
                <Route
                  path="/athlete-dashboard"
                  element={
                    <PrivateRoute userType="athlete">
                      <AthleteDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/coach-dashboard"
                  element={
                    <PrivateRoute userType="coach">
                      <CoachDashboard />
                    </PrivateRoute>
                  }
                />
                {/* Catch all route for unknown paths */}
                <Route path="*" element={<Navigate to="/login" />} />
              </Routes>
            </Suspense>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
