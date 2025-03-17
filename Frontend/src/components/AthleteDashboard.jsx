import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  Paper,
  Tabs,
  Tab,
  Stack,
  IconButton
} from '@mui/material';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import SportsIcon from '@mui/icons-material/Sports';
import WorkIcon from '@mui/icons-material/Work';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import LogoutIcon from '@mui/icons-material/Logout';

export default function AthleteDashboard() {
  const { currentUser, userDetails, logout } = useAuth();
  const navigate = useNavigate();
  const [coaches, setCoaches] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  const [bookingDetails, setBookingDetails] = useState({
    date: '',
    time: '',
    duration: '60',
    notes: ''
  });

  // Time slots for the booking
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  // Duration options (in minutes)
  const durationOptions = [
    { value: '30', label: '30 minutes' },
    { value: '60', label: '1 hour' },
    { value: '90', label: '1.5 hours' },
    { value: '120', label: '2 hours' }
  ];

  useEffect(() => {
    fetchCoaches();
    fetchBookings();
  }, []);

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      const coachesQuery = query(
        collection(db, 'users'),
        where('userType', '==', 'coach')
      );
      const querySnapshot = await getDocs(coachesQuery);
      const coachesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCoaches(coachesData);
    } catch (error) {
      console.error('Error fetching coaches:', error);
      setError('Failed to load coaches');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('athleteId', '==', currentUser.uid)
      );
      const querySnapshot = await getDocs(bookingsQuery);
      const bookingsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingOpen = (coach) => {
    setSelectedCoach(coach);
    setBookingDialog(true);
  };

  const handleBookingClose = () => {
    setBookingDialog(false);
    setSelectedCoach(null);
    setBookingDetails({
      date: '',
      time: '',
      duration: '60',
      notes: ''
    });
  };

  const handleBookingSubmit = async () => {
    if (!bookingDetails.date || !bookingDetails.time) {
      setError('Please select both date and time');
      return;
    }

    try {
      const bookingData = {
        coachId: selectedCoach.id,
        coachName: `${selectedCoach.firstName} ${selectedCoach.lastName}`,
        athleteId: currentUser.uid,
        athleteName: `${userDetails.firstName} ${userDetails.lastName}`,
        ...bookingDetails,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'bookings'), bookingData);
      handleBookingClose();
      // You might want to show a success message or update the UI
    } catch (error) {
      console.error('Error creating booking:', error);
      setError('Failed to create booking');
    }
  };

  const handleLogout = async () => {
    try {
      setError('');
      setLoading(true);
      await logout();
      setLoading(false);
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to logout:', error);
      setError('Failed to logout');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: theme.palette.grey[50],
        overflowX: 'hidden'
      }}
    >
      <Container 
        maxWidth={false} 
        disableGutters
      >
        <Stack spacing={2}>
          {/* Header Section */}
          <Box 
            sx={{ 
              pt: { xs: 2, sm: 3 },
              px: { xs: 2, sm: 3 },
              backgroundColor: 'white',
              borderBottom: 1,
              borderColor: 'divider'
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 3
            }}>
              <Typography 
                variant={isSmallScreen ? "h5" : "h4"} 
                sx={{ 
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                }}
              >
                Welcome, {userDetails?.firstName}!
              </Typography>
              
              <Button
                variant="outlined"
                color="primary"
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
                sx={{ 
                  borderRadius: 1,
                  py: 1,
                  px: 2,
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                Logout
              </Button>
            </Box>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  borderRadius: 1,
                  mb: 3
                }}
              >
                {error}
              </Alert>
            )}

            {/* Navigation Tabs */}
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              variant="standard"
              sx={{
                minHeight: { xs: 48, sm: 56, md: 64 },
                '& .MuiTab-root': {
                  minHeight: { xs: 48, sm: 56, md: 64 },
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }
              }}
            >
              <Tab 
                icon={<SportsIcon sx={{ mr: 1 }} />}
                iconPosition="start"
                label="Available Coaches" 
                sx={{ 
                  borderRadius: '4px 4px 0 0',
                  '&.Mui-selected': {
                    color: theme.palette.primary.main,
                    fontWeight: 600
                  }
                }}
              />
              <Tab 
                icon={<CalendarMonthIcon sx={{ mr: 1 }} />}
                iconPosition="start"
                label="My Bookings"
                sx={{ 
                  borderRadius: '4px 4px 0 0',
                  '&.Mui-selected': {
                    color: theme.palette.primary.main,
                    fontWeight: 600
                  }
                }}
              />
            </Tabs>
          </Box>

          {/* Content Section */}
          <Box sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 3, sm: 4 } }}>
            {tabValue === 0 ? (
              <Grid 
                container 
                spacing={3}
                columns={12}
              >
                {coaches.map((coach) => (
                  <Grid item xs={12} sm={6} key={coach.id}>
                    <Card 
                      elevation={1}
                      sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 2,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 3
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3, flexGrow: 1 }}>
                        <Stack spacing={3}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Avatar 
                              sx={{ 
                                width: { xs: 80, sm: 100 },
                                height: { xs: 80, sm: 100 }
                              }}
                            >
                              {coach.firstName?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography 
                                variant="h5" 
                                sx={{ 
                                  fontSize: { xs: '1.5rem', sm: '1.75rem' },
                                  fontWeight: 600,
                                  mb: 1
                                }}
                              >
                                {coach.firstName} {coach.lastName}
                              </Typography>
                              <Typography 
                                color="text.secondary"
                                sx={{ 
                                  fontSize: { xs: '1rem', sm: '1.1rem' }
                                }}
                              >
                                {coach.experience} experience
                              </Typography>
                            </Box>
                          </Box>

                          <Typography 
                            variant="body1"
                            sx={{ 
                              fontSize: { xs: '1rem', sm: '1.1rem' }
                            }}
                          >
                            Specializes in {coach.sport}
                          </Typography>

                          <Stack direction="row" spacing={2}>
                            <Chip 
                              label={coach.sport}
                              icon={<SportsIcon />}
                              sx={{ 
                                borderRadius: 1,
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                py: 1.5
                              }}
                            />
                            <Chip 
                              label={coach.experience}
                              icon={<WorkIcon />}
                              sx={{ 
                                borderRadius: 1,
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                py: 1.5
                              }}
                            />
                          </Stack>
                        </Stack>
                      </CardContent>
                      <CardActions sx={{ p: 3, pt: 0 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() => handleBookingOpen(coach)}
                          startIcon={<EventIcon />}
                          sx={{ 
                            borderRadius: 1,
                            py: 1.5,
                            fontSize: { xs: '1rem', sm: '1.1rem' }
                          }}
                        >
                          Book Session
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Grid 
                container 
                spacing={3}
                columns={12}
              >
                {bookings.map((booking) => (
                  <Grid item xs={12} sm={6} key={booking.id}>
                    <Card 
                      elevation={1}
                      sx={{ 
                        height: '100%',
                        borderRadius: 2,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 3
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Stack spacing={3}>
                          <Typography 
                            variant="h5"
                            sx={{ 
                              fontSize: { xs: '1.5rem', sm: '1.75rem' },
                              fontWeight: 600,
                              mb: 1
                            }}
                          >
                            Session with {booking.coachName}
                          </Typography>

                          <Stack spacing={2}>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <CalendarMonthIcon sx={{ fontSize: '1.5rem' }} />
                              <Typography sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                                {new Date(booking.date).toLocaleDateString()}
                              </Typography>
                            </Stack>

                            <Stack direction="row" alignItems="center" spacing={2}>
                              <AccessTimeIcon sx={{ fontSize: '1.5rem' }} />
                              <Typography sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                                {booking.time} ({booking.duration} min)
                              </Typography>
                            </Stack>
                          </Stack>

                          {booking.notes && (
                            <Paper 
                              variant="outlined" 
                              sx={{ 
                                p: 3,
                                backgroundColor: theme.palette.grey[50],
                                borderRadius: 1
                              }}
                            >
                              <Typography 
                                sx={{ 
                                  fontSize: { xs: '0.875rem', sm: '1rem' }
                                }}
                              >
                                {booking.notes}
                              </Typography>
                            </Paper>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}

                {bookings.length === 0 && (
                  <Grid item xs={12}>
                    <Paper 
                      sx={{ 
                        p: 4,
                        textAlign: 'center',
                        borderRadius: 2,
                        backgroundColor: 'white'
                      }}
                    >
                      <Typography 
                        variant="h5" 
                        color="text.secondary"
                        sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
                      >
                        No bookings found
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            )}
          </Box>
        </Stack>

        {/* Booking Dialog */}
        <Dialog 
          open={bookingDialog} 
          onClose={handleBookingClose} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              p: { xs: 2, sm: 3 }
            }
          }}
        >
          <DialogTitle sx={{ pb: 2 }}>
            Book a Session with {selectedCoach ? `${selectedCoach.firstName} ${selectedCoach.lastName}` : ''}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Select Date"
                  value={bookingDetails.date ? new Date(bookingDetails.date) : null}
                  onChange={(newDate) => {
                    if (newDate) {
                      const formattedDate = newDate.toISOString().split('T')[0];
                      setBookingDetails({ ...bookingDetails, date: formattedDate });
                    }
                  }}
                  disablePast
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: Boolean(error && !bookingDetails.date),
                      helperText: error && !bookingDetails.date ? 'Please select a date' : ''
                    }
                  }}
                />
              </LocalizationProvider>
              <TextField
                select
                label="Select Time"
                value={bookingDetails.time}
                onChange={(e) => setBookingDetails({ ...bookingDetails, time: e.target.value })}
                fullWidth
              >
                {timeSlots.map((time) => (
                  <MenuItem key={time} value={time}>
                    {time}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Session Duration"
                value={bookingDetails.duration}
                onChange={(e) => setBookingDetails({ ...bookingDetails, duration: e.target.value })}
                fullWidth
              >
                {durationOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                multiline
                rows={4}
                label="Notes (Optional)"
                value={bookingDetails.notes}
                onChange={(e) => setBookingDetails({ ...bookingDetails, notes: e.target.value })}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2 }}>
            <Button 
              onClick={handleBookingClose}
              variant="outlined"
              sx={{ minWidth: 100 }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleBookingSubmit} 
              variant="contained"
              sx={{ minWidth: 100 }}
            >
              Book Session
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
} 