import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import theme from './theme/theme';
import Login from './components/Login';
import NewSignup from './components/NewSignup';
import AthleteDashboard from './components/AthleteDashboard';
import PrivateRoute from './components/PrivateRoute';
import CoachDashboard from './components/CoachDashboard';

// Lazy load components
const CoachDashboardLazy = React.lazy(() => import('./components/CoachDashboard'));

// Loading component
const LoadingFallback = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
  >
    <CircularProgress />
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

// Import Roboto font
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Login />} />
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
                      <CoachDashboardLazy />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </Suspense>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
