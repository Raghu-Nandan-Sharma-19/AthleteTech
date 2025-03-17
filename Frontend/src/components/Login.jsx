import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
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
  );
} 