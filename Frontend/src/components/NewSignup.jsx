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
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  InputAdornment,
  FormHelperText,
  Divider
} from '@mui/material';
import { Visibility, VisibilityOff, SportsSoccer, FitnessCenter, DirectionsRun } from '@mui/icons-material';

export default function NewSignup() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [activeStep, setActiveStep] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [userDetails, setUserDetails] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    sport: '',
    experience: '',
    goals: ''
  });

  const { signup } = useAuth();
  const navigate = useNavigate();

  const steps = ['Account Setup', 'Personal Info', 'Sport Details'];

  const validateStep = (step) => {
    setError('');
    switch (step) {
      case 0:
        if (!email || !password || !confirmPassword) {
          setError('Please fill in all fields');
          return false;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters long');
          return false;
        }
        return true;
      case 1:
        if (!userDetails.firstName || !userDetails.lastName || !userDetails.age || !userDetails.gender) {
          setError('Please fill in all required fields');
          return false;
        }
        if (isNaN(userDetails.age) || userDetails.age < 13 || userDetails.age > 100) {
          setError('Please enter a valid age between 13 and 100');
          return false;
        }
        return true;
      case 2:
        if (!userDetails.sport || !userDetails.experience) {
          setError('Please select your sport and experience level');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleUserDetailsChange = (field) => (event) => {
    setUserDetails(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (activeStep < steps.length - 1) {
      handleNext();
      return;
    }

    if (!validateStep(activeStep)) {
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      await signup(
        email.trim().toLowerCase(), 
        password,
        tabValue === 0 ? 'coach' : 'athlete',
        {
          firstName: userDetails.firstName.trim(),
          lastName: userDetails.lastName.trim(),
          age: parseInt(userDetails.age),
          gender: userDetails.gender,
          sport: userDetails.sport,
          experience: userDetails.experience,
          goals: userDetails.goals.trim(),
          accountType: tabValue === 0 ? 'coach' : 'athlete'
        }
      );
      
      navigate(tabValue === 0 ? '/coach-dashboard' : '/athlete-dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists');
      } else if (error.code === 'auth/invalid-email') {
        setError('Please enter a valid email address');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 6 characters');
      } else {
        setError(error.message || 'Failed to create account');
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
            maxWidth: '500px',
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
            Create Your Account
          </Typography>

          <Stepper 
            activeStep={activeStep} 
            alternativeLabel
            sx={{ 
              width: '100%', 
              mb: 3,
              '& .MuiStepLabel-label': {
                fontSize: '0.875rem',
              }
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

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
            {activeStep === 0 && (
              <>
                <Box sx={{ mb: 3 }}>
                  <Tabs
                    value={tabValue}
                    onChange={(e, newValue) => {
                      setTabValue(newValue);
                      setError('');
                    }}
                    variant={isMobile ? "fullWidth" : "standard"}
                    centered
                  >
                    <Tab 
                      icon={<FitnessCenter sx={{ fontSize: '1.2rem' }} />} 
                      label="Coach" 
                      iconPosition="start"
                    />
                    <Tab 
                      icon={<DirectionsRun sx={{ fontSize: '1.2rem' }} />} 
                      label="Athlete" 
                      iconPosition="start"
                    />
                  </Tabs>
                </Box>

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

                <TextField
                  required
                  fullWidth
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  size="small"
                  error={confirmPassword !== '' && password !== confirmPassword}
                  helperText={confirmPassword !== '' && password !== confirmPassword ? "Passwords don't match" : ""}
                />
              </>
            )}

            {activeStep === 1 && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="First Name"
                    value={userDetails.firstName}
                    onChange={handleUserDetailsChange('firstName')}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Last Name"
                    value={userDetails.lastName}
                    onChange={handleUserDetailsChange('lastName')}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Age"
                    type="number"
                    value={userDetails.age}
                    onChange={handleUserDetailsChange('age')}
                    size="small"
                    inputProps={{ min: 13, max: 100 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required size="small">
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={userDetails.gender}
                      onChange={handleUserDetailsChange('gender')}
                      label="Gender"
                    >
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}

            {activeStep === 2 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth required size="small">
                    <InputLabel>Primary Sport</InputLabel>
                    <Select
                      value={userDetails.sport}
                      onChange={handleUserDetailsChange('sport')}
                      label="Primary Sport"
                    >
                      <MenuItem value="football">Football</MenuItem>
                      <MenuItem value="basketball">Basketball</MenuItem>
                      <MenuItem value="tennis">Tennis</MenuItem>
                      <MenuItem value="swimming">Swimming</MenuItem>
                      <MenuItem value="athletics">Athletics</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth required size="small">
                    <InputLabel>Experience Level</InputLabel>
                    <Select
                      value={userDetails.experience}
                      onChange={handleUserDetailsChange('experience')}
                      label="Experience Level"
                    >
                      <MenuItem value="beginner">Beginner</MenuItem>
                      <MenuItem value="intermediate">Intermediate</MenuItem>
                      <MenuItem value="advanced">Advanced</MenuItem>
                      <MenuItem value="professional">Professional</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Training Goals"
                    value={userDetails.goals}
                    onChange={handleUserDetailsChange('goals')}
                    size="small"
                    helperText="Briefly describe your training goals"
                  />
                </Grid>
              </Grid>
            )}

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              mt: 3,
              pt: 2,
              borderTop: '1px solid #e0e0e0'
            }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
                variant="outlined"
                size="small"
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                size="small"
              >
                {loading 
                  ? 'Creating Account...' 
                  : activeStep === steps.length - 1 
                    ? 'Create Account' 
                    : 'Next'
                }
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Button
              component={Link}
              to="/login"
              fullWidth
              variant="text"
              size="small"
            >
              Already have an account? Sign In
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
} 