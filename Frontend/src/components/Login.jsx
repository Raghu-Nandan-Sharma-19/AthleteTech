import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Tabs,
  Tab,
  Alert,
  Divider,
  useTheme,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export default function Login() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
  };

  async function handleSubmit(e) {
    e.preventDefault();

    // Basic validation
    if (!email.trim() || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      setLoading(true);

      // Ensure email is lowercase and trimmed
      const trimmedEmail = email.trim().toLowerCase();
      
      // Login with the selected account type
      await login(trimmedEmail, password, tabValue === 0 ? 'coach' : 'athlete');
      navigate(tabValue === 0 ? '/coach-dashboard' : '/athlete-dashboard');
    } catch (error) {
      console.error('Login error:', error);
      if (error.message === 'Please use the correct login type for your account') {
        setError('Please select the correct account type (Coach/Athlete) for this email');
      } else if (error.code === 'auth/user-not-found') {
        setError('No account found with this email');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email format');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later');
      } else {
        setError(error.message || 'Failed to sign in');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        backgroundColor: '#f5f5f5',
        position: 'relative'
      }}
    >
      {/* Left side - Main content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            width: '100%',
            maxWidth: '400px',
            p: { xs: 2, sm: 3 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: 'white',
            borderRadius: 2
          }}
        >
          <Typography 
            component="h1" 
            variant="h5" 
            align="center" 
            gutterBottom
            sx={{ 
              mb: 3,
              fontWeight: 'bold',
              color: theme.palette.primary.main 
            }}
          >
            Welcome to AthleteTech
          </Typography>

          <Box sx={{ width: '100%', mb: 2 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Coach Login" />
              <Tab label="Athlete Login" />
            </Tabs>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 2, width: '100%' }}
            >
              {error}
            </Alert>
          )}

          <Box 
            component="form" 
            onSubmit={handleSubmit}
            sx={{ width: '100%' }}
          >
            <TextField
              required
              fullWidth
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              size="small"
              sx={{ mb: 2 }}
            />
            <TextField
              required
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="small"
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mb: 2 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                New to AthleteTech?
              </Typography>
            </Divider>

            <Button
              component={Link}
              to="/signup"
              fullWidth
              variant="outlined"
              size="small"
            >
              Create an Account
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Right side - Test credentials */}
      <Box
        sx={{
          width: '300px',
          backgroundColor: '#fff',
          borderLeft: '1px solid #e0e0e0',
          p: 3,
          display: { xs: 'none', md: 'block' },
          overflowY: 'auto'
        }}
      >
        <Typography variant="h6" gutterBottom color="primary">
          Test Credentials
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            Coach Login:
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Email: coach.test@athletetech.com
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Password: Coach@123
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            Athlete Login:
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Email: athlete.test@athletetech.com
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Password: Athlete@123
          </Typography>
        </Box>

        <Typography variant="subtitle2" color="text.secondary">
          Instructions:
        </Typography>
        <ol style={{ margin: '8px 0', paddingLeft: '20px' }}>
          <li>Choose account type (Coach/Athlete)</li>
          <li>Copy & paste credentials exactly</li>
          <li>Click Sign In</li>
        </ol>
      </Box>

      {/* Mobile Instructions */}
      <Paper
        elevation={2}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          display: { xs: 'block', md: 'none' },
          backgroundColor: '#f8f9fa',
          borderTop: '1px solid #e0e0e0'
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Test Credentials - Copy & Paste to Login
        </Typography>
        <Typography variant="caption" display="block">
          Coach: coach.test@athletetech.com / Coach@123
        </Typography>
        <Typography variant="caption" display="block">
          Athlete: athlete.test@athletetech.com / Athlete@123
        </Typography>
      </Paper>
    </Box>
  );
} 