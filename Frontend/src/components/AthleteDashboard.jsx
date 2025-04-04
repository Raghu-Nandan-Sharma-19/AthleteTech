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
  IconButton,
  Link,
  FormControlLabel,
  Switch
} from '@mui/material';
import { collection, getDocs, addDoc, query, where, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import SportsIcon from '@mui/icons-material/Sports';
import WorkIcon from '@mui/icons-material/Work';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import LogoutIcon from '@mui/icons-material/Logout';
import VideocamIcon from '@mui/icons-material/Videocam';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PendingIcon from '@mui/icons-material/Pending';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import Rating from '@mui/material/Rating';
import StarIcon from '@mui/icons-material/Star';
import DeleteIcon from '@mui/icons-material/Delete';
import Chatbot from './Chatbot';
import SmartToyIcon from '@mui/icons-material/SmartToy';

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
    notes: '',
    isVirtual: false
  });
  const [completionDialog, setCompletionDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');

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

  // Function to get upcoming sessions
  const getUpcomingSessions = (bookings) => {
    const now = new Date();

    return bookings.filter(booking => {
      // Include both confirmed and pending_completion sessions
      if (booking.status !== 'confirmed' && booking.status !== 'pending_completion') return false;

      const [year, month, day] = booking.date.split('-').map(Number);
      const [hours, minutes] = booking.time.split(':').map(Number);
      const sessionDate = new Date(year, month - 1, day, hours, minutes);
      const sessionEndTime = new Date(sessionDate.getTime() + booking.duration * 60000);

      // For pending_completion sessions, always show them
      if (booking.status === 'pending_completion') return true;

      // For confirmed sessions, show if they haven't ended
      return sessionEndTime > now;
    }).sort((a, b) => {
      const dateA = new Date(a.date + ' ' + a.time);
      const dateB = new Date(b.date + ' ' + b.time);
      return dateA - dateB;
    });
  };

  // Function to get confirmed sessions
  const getConfirmedSessions = (bookings) => {
    return bookings.filter(booking => booking.status === 'confirmed')
      .sort((a, b) => {
        const dateA = new Date(a.date + ' ' + a.time);
        const dateB = new Date(b.date + ' ' + b.time);
        return dateA - dateB;
      });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <PendingIcon />;
      case 'confirmed':
        return <CheckCircleIcon />;
      case 'cancelled':
        return <CancelIcon />;
      default:
        return <AccessTimeIcon />;
    }
  };

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
      notes: '',
      isVirtual: false
    });
  };

  const copyMeetLink = (link) => {
    navigator.clipboard.writeText(link)
      .then(() => {
        console.log('Link copied to clipboard');
      })
      .catch((err) => {
        console.error('Failed to copy link:', err);
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
      await fetchBookings();
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

  const handleCompletionConfirm = async () => {
    if (!selectedBooking) return;

    try {
      const updateData = {
        status: 'pending_completion',
        completedByAthlete: true,
        completedByAthleteAt: new Date().toISOString(),
        rating: rating,
        feedback: feedback
      };

      // If coach has already marked it complete, set it to completed
      if (selectedBooking.completedByCoach) {
        updateData.status = 'completed';
        updateData.completedAt = new Date().toISOString();
      }

      await updateDoc(doc(db, 'bookings', selectedBooking.id), updateData);

      setCompletionDialog(false);
      setSelectedBooking(null);
      setRating(5);
      setFeedback('');
      await fetchBookings();
    } catch (error) {
      console.error('Error confirming completion:', error);
      setError('Failed to confirm session completion');
    }
  };

  const getCompletedSessions = (bookings) => {
    return bookings.filter(booking => booking.status === 'completed')
      .sort((a, b) => {
        const dateA = new Date(a.date + ' ' + a.time);
        const dateB = new Date(b.date + ' ' + b.time);
        return dateB - dateA; // Sort by most recent first
      });
  };

  const isSessionFinished = (booking) => {
    const now = new Date();
    const [year, month, day] = booking.date.split('-').map(Number);
    const [hours, minutes] = booking.time.split(':').map(Number);
    const sessionDate = new Date(year, month - 1, day, hours, minutes);
    const sessionEndTime = new Date(sessionDate.getTime() + booking.duration * 60000);
    return now > sessionEndTime;
  };

  const handleMarkAsCompleted = async (booking) => {
    try {
      setSelectedBooking(booking);
      setCompletionDialog(true);
    } catch (error) {
      console.error('Error marking session as completed:', error);
      setError('Failed to mark session as completed');
    }
  };

  const handleDeleteSession = async (booking) => {
    try {
      await deleteDoc(doc(db, 'bookings', booking.id));
      await fetchBookings();
    } catch (error) {
      console.error('Error deleting session:', error);
      setError('Failed to delete session');
    }
  };

  // Add the SessionStatusAlert component
  const SessionStatusAlert = ({ booking }) => {
    const isOngoing = () => {
      const now = new Date();
      const sessionStart = new Date(booking.date + ' ' + booking.time);
      const sessionEnd = new Date(sessionStart.getTime() + booking.duration * 60000);
      return now >= sessionStart && now <= sessionEnd;
    };

    const isFinished = () => {
      const now = new Date();
      const sessionStart = new Date(booking.date + ' ' + booking.time);
      const sessionEnd = new Date(sessionStart.getTime() + booking.duration * 60000);
      return now > sessionEnd;
    };

    const isUpcoming = () => {
      const now = new Date();
      const sessionStart = new Date(booking.date + ' ' + booking.time);
      return now < sessionStart;
    };

    if (booking.status === 'pending') {
      return (
        <Alert severity="warning" icon={<PendingIcon />}>
          Waiting for coach to confirm this session
        </Alert>
      );
    }

    if (booking.status === 'pending_completion') {
      if (!booking.completedByAthlete) {
        return (
          <Alert 
            severity="info"
            action={
              <Button
                color="primary"
                variant="contained"
                onClick={() => handleMarkAsCompleted(booking)}
                startIcon={<DoneAllIcon />}
                size="small"
              >
                Confirm Completion
              </Button>
            }
          >
            Coach has marked this session as completed. Please confirm and provide feedback.
          </Alert>
        );
      } else {
        return (
          <Alert severity="warning" icon={<PendingIcon />}>
            Waiting for coach to confirm completion
          </Alert>
        );
      }
    }

    if (booking.status === 'confirmed') {
      if (isFinished()) {
        return (
          <Alert 
            severity="info"
            action={
              <Button
                color="primary"
                variant="contained"
                onClick={() => handleMarkAsCompleted(booking)}
                startIcon={<DoneAllIcon />}
                size="small"
              >
                Mark as Completed
              </Button>
            }
          >
            This session has finished. Please mark it as completed.
          </Alert>
        );
      }

      if (isOngoing()) {
        return (
          <Alert 
            severity="warning"
            icon={<AccessTimeIcon />}
          >
            Session is currently in progress
          </Alert>
        );
      }

      if (isUpcoming()) {
        return (
          <Alert severity="success">
            Session is confirmed and scheduled
          </Alert>
        );
      }
    }

    if (booking.status === 'completed') {
      return (
        <Alert 
          icon={<DoneAllIcon />}
          severity="success"
        >
          Session completed successfully
        </Alert>
      );
    }

    if (booking.status === 'cancelled') {
      return (
        <Alert severity="error">
          Session cancelled
          {booking.cancellationType === 'emergency' && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                Emergency Cancellation Reason:
              </Typography>
              <Typography variant="body2">
                {booking.cancellationReason}
              </Typography>
            </>
          )}
        </Alert>
      );
    }

    return null;
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
              <Tab 
                icon={<SmartToyIcon sx={{ mr: 1 }} />}
                iconPosition="start"
                label="AI Coach"
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
            ) : tabValue === 1 ? (
              <Stack spacing={4}>
                {/* Upcoming Sessions Section */}
                <Box>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      mb: 3,
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <CheckCircleIcon color="success" />
                    Upcoming Sessions
                    {getUpcomingSessions(bookings).length > 0 && (
                      <Chip 
                        label={getUpcomingSessions(bookings).length} 
                        color="success" 
                        size="small" 
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Typography>

                  <Grid container spacing={3}>
                    {getUpcomingSessions(bookings).length > 0 ? (
                      getUpcomingSessions(bookings).map((booking) => (
                        <Grid item xs={12} sm={6} key={booking.id}>
                          <Card 
                            elevation={1}
                            sx={{ 
                              height: '100%',
                              borderRadius: 2,
                              transition: 'all 0.2s ease',
                              position: 'relative',
                              overflow: 'visible',
                              border: `1px solid ${theme.palette.success.light}`,
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 3
                              }
                            }}
                          >
                            <CardContent sx={{ p: 3 }}>
                              <Stack spacing={3}>
                                {/* Session Header */}
                                <Box>
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
                                  
                                  {booking.isVirtual && (
                                    <Chip
                                      icon={<VideocamIcon />}
                                      label="Virtual Session"
                                      color="info"
                                      size="small"
                                      sx={{ borderRadius: '12px', fontSize: '0.875rem' }}
                                    />
                                  )}
                                </Box>

                                {/* Session Details */}
                                <Paper 
                                  variant="outlined" 
                                  sx={{ 
                                    p: 2,
                                    backgroundColor: theme.palette.grey[50],
                                    borderRadius: 2
                                  }}
                                >
                                  <Stack spacing={2}>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                      <CalendarMonthIcon color="primary" />
                                      <Typography sx={{ fontSize: '1rem' }}>
                                        {new Date(booking.date).toLocaleDateString(undefined, {
                                          weekday: 'long',
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric'
                                        })}
                                      </Typography>
                                    </Stack>

                                    <Stack direction="row" alignItems="center" spacing={2}>
                                      <AccessTimeIcon color="primary" />
                                      <Typography sx={{ fontSize: '1rem' }}>
                                        {booking.time} • {booking.duration} minutes
                                      </Typography>
                                    </Stack>
                                  </Stack>
                                </Paper>

                                {/* Meet Link Section for Virtual Sessions */}
                                {booking.isVirtual && booking.meetLink && (
                                  <Paper 
                                    variant="outlined" 
                                    sx={{ 
                                      p: 2,
                                      backgroundColor: theme.palette.primary[50],
                                      borderRadius: 2,
                                      borderColor: theme.palette.primary[200]
                                    }}
                                  >
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                      <VideocamIcon color="primary" />
                                      <Link 
                                        href={booking.meetLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        sx={{ 
                                          flexGrow: 1,
                                          color: theme.palette.primary.main,
                                          textDecoration: 'none',
                                          '&:hover': { textDecoration: 'underline' }
                                        }}
                                      >
                                        Join Google Meet
                                      </Link>
                                      <IconButton
                                        size="small"
                                        onClick={() => copyMeetLink(booking.meetLink)}
                                        title="Copy link"
                                        sx={{ 
                                          backgroundColor: 'white',
                                          '&:hover': { backgroundColor: theme.palette.grey[100] }
                                        }}
                                      >
                                        <ContentCopyIcon fontSize="small" />
                                      </IconButton>
                                    </Stack>
                                  </Paper>
                                )}

                                {/* Notes Section */}
                                {booking.notes && (
                                  <Paper 
                                    variant="outlined" 
                                    sx={{ 
                                      p: 2,
                                      backgroundColor: 'white',
                                      borderRadius: 2,
                                      borderColor: theme.palette.grey[200]
                                    }}
                                  >
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                      Session Notes
                                    </Typography>
                                    <Typography>{booking.notes}</Typography>
                                  </Paper>
                                )}

                                {/* Session Status */}
                                <SessionStatusAlert booking={booking} />
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))
                    ) : (
                      <Grid item xs={12}>
                        <Paper 
                          sx={{ 
                            p: 4,
                            textAlign: 'center',
                            borderRadius: 2,
                            backgroundColor: 'white',
                            borderStyle: 'dashed',
                            borderColor: theme.palette.success.light
                          }}
                        >
                          <Typography variant="h6" color="text.secondary">
                            No upcoming sessions
                          </Typography>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </Box>

                {/* All Confirmed Sessions Section */}
                <Box>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      mb: 3,
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <DoneAllIcon color="info" />
                    All Confirmed Sessions
                    {getConfirmedSessions(bookings).length > 0 && (
                      <Chip 
                        label={getConfirmedSessions(bookings).length} 
                        color="info" 
                        size="small" 
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Typography>

                  <Grid container spacing={3}>
                    {getConfirmedSessions(bookings).length > 0 ? (
                      getConfirmedSessions(bookings).map((booking) => (
                        <Grid item xs={12} sm={6} key={booking.id}>
                          <Card 
                            elevation={1}
                            sx={{ 
                              height: '100%',
                              borderRadius: 2,
                              border: `1px solid ${theme.palette.info.light}`
                            }}
                          >
                            <CardContent sx={{ p: 3 }}>
                              {/* Same content structure as Upcoming Sessions */}
                              <Stack spacing={3}>
                                <Box>
                                  <Typography variant="h5" sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 1 }}>
                                    Session with {booking.coachName}
                                  </Typography>
                                  {booking.isVirtual && (
                                    <Chip icon={<VideocamIcon />} label="Virtual Session" color="info" size="small" />
                                  )}
                                </Box>

                                <Paper variant="outlined" sx={{ p: 2, backgroundColor: theme.palette.grey[50], borderRadius: 2 }}>
                                  <Stack spacing={2}>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                      <CalendarMonthIcon color="primary" />
                                      <Typography>
                                        {new Date(booking.date).toLocaleDateString(undefined, {
                                          weekday: 'long',
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric'
                                        })}
                                      </Typography>
                                    </Stack>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                      <AccessTimeIcon color="primary" />
                                      <Typography>{booking.time} • {booking.duration} minutes</Typography>
                                    </Stack>
                                  </Stack>
                                </Paper>

                                {booking.isVirtual && booking.meetLink && (
                                  <Paper variant="outlined" sx={{ p: 2, backgroundColor: theme.palette.primary[50], borderRadius: 2 }}>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                      <VideocamIcon color="primary" />
                                      <Link 
                                        href={booking.meetLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        sx={{ flexGrow: 1, color: theme.palette.primary.main }}
                                      >
                                        Join Google Meet
                                      </Link>
                                      <IconButton
                                        size="small"
                                        onClick={() => copyMeetLink(booking.meetLink)}
                                        sx={{ backgroundColor: 'white' }}
                                      >
                                        <ContentCopyIcon fontSize="small" />
                                      </IconButton>
                                    </Stack>
                                  </Paper>
                                )}
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))
                    ) : (
                      <Grid item xs={12}>
                        <Paper 
                          sx={{ 
                            p: 4,
                            textAlign: 'center',
                            borderRadius: 2,
                            backgroundColor: 'white',
                            borderStyle: 'dashed',
                            borderColor: theme.palette.info.light
                          }}
                        >
                          <Typography variant="h6" color="text.secondary">
                            No confirmed sessions
                          </Typography>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </Box>

                {/* Completed Sessions Section */}
                <Box>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      mb: 3,
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <DoneAllIcon color="info" />
                    Completed Sessions
                    {getCompletedSessions(bookings).length > 0 && (
                      <Chip 
                        label={getCompletedSessions(bookings).length} 
                        color="info" 
                        size="small" 
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Typography>

                  <Grid container spacing={3}>
                    {getCompletedSessions(bookings).length > 0 ? (
                      getCompletedSessions(bookings).map((booking) => (
                        <Grid item xs={12} sm={6} key={booking.id}>
                          <Card 
                            elevation={1}
                            sx={{ 
                              height: '100%',
                              borderRadius: 2,
                              border: `1px solid ${theme.palette.info.light}`
                            }}
                          >
                            <CardContent sx={{ p: 3 }}>
                              <Stack spacing={3}>
                                <Box>
                                  <Typography variant="h5" sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 1 }}>
                                    Session with {booking.coachName}
                                  </Typography>
                                  {booking.isVirtual && (
                                    <Chip icon={<VideocamIcon />} label="Virtual Session" color="info" size="small" />
                                  )}
                                </Box>

                                <Paper variant="outlined" sx={{ p: 2, backgroundColor: theme.palette.grey[50], borderRadius: 2 }}>
                                  <Stack spacing={2}>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                      <CalendarMonthIcon color="primary" />
                                      <Typography>
                                        {new Date(booking.date).toLocaleDateString(undefined, {
                                          weekday: 'long',
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric'
                                        })}
                                      </Typography>
                                    </Stack>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                      <AccessTimeIcon color="primary" />
                                      <Typography>{booking.time} • {booking.duration} minutes</Typography>
                                    </Stack>
                                  </Stack>
                                </Paper>

                                {booking.rating && (
                                  <Paper variant="outlined" sx={{ p: 2, backgroundColor: theme.palette.success[50], borderRadius: 2 }}>
                                    <Stack spacing={1}>
                                      <Typography variant="subtitle2" color="text.secondary">
                                        Your Feedback
                                      </Typography>
                                      <Stack direction="row" alignItems="center" spacing={1}>
                                        <Typography variant="h6" color="success.main">
                                          {booking.rating}/5
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                          Rating
                                        </Typography>
                                      </Stack>
                                      {booking.feedback && (
                                        <Typography variant="body2">
                                          "{booking.feedback}"
                                        </Typography>
                                      )}
                                    </Stack>
                                  </Paper>
                                )}

                                <Alert 
                                  icon={<DoneAllIcon />}
                                  severity="success"
                                >
                                  Session completed on {new Date(booking.completedAt).toLocaleDateString()}
                                </Alert>

                                {booking.status === 'completed' && (
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Typography variant="h6">{booking.coachName}</Typography>
                                    <IconButton 
                                      onClick={() => {
                                        if (window.confirm('Are you sure you want to delete this completed session? This action cannot be undone.')) {
                                          handleDeleteSession(booking);
                                        }
                                      }}
                                      color="error"
                                      size="small"
                                      sx={{ 
                                        '&:hover': { 
                                          backgroundColor: theme.palette.error.light 
                                        }
                                      }}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Box>
                                )}
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))
                    ) : (
                      <Grid item xs={12}>
                        <Paper 
                          sx={{ 
                            p: 4,
                            textAlign: 'center',
                            borderRadius: 2,
                            backgroundColor: 'white',
                            borderStyle: 'dashed',
                            borderColor: theme.palette.info.light
                          }}
                        >
                          <Typography variant="h6" color="text.secondary">
                            No completed sessions
                          </Typography>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </Stack>
            ) : (
              <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    mb: 3,
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <SmartToyIcon color="primary" />
                  AI Sports Coach Assistant
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 4, 
                    color: theme.palette.text.secondary,
                    fontSize: { xs: '1rem', sm: '1.1rem' }
                  }}
                >
                  Get instant answers to your training, nutrition, and performance questions. Your AI coach is here to help 24/7.
                </Typography>
                <Paper 
                  elevation={2} 
                  sx={{ 
                    borderRadius: 2, 
                    overflow: 'hidden',
                    height: '70vh'
                  }}
                >
                  <Chatbot />
                </Paper>
              </Box>
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

              <FormControlLabel
                control={
                  <Switch
                    checked={bookingDetails.isVirtual}
                    onChange={(e) => setBookingDetails({ ...bookingDetails, isVirtual: e.target.checked })}
                  />
                }
                label="Virtual Session"
              />

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

        {/* Completion Confirmation Dialog */}
        <Dialog 
          open={completionDialog} 
          onClose={() => {
            setCompletionDialog(false);
            setSelectedBooking(null);
            setRating(5);
            setFeedback('');
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ pb: 2 }}>
            Session Completion
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3}>
              <Alert severity="info">
                Please rate your session and provide any feedback before confirming completion.
              </Alert>
              
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Rate your session (1-5 stars)
                </Typography>
                <Rating
                  value={rating}
                  onChange={(event, newValue) => {
                    setRating(newValue);
                  }}
                  size="large"
                />
              </Box>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Session Feedback (Optional)"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your thoughts about the session..."
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2 }}>
            <Button 
              onClick={() => {
                setCompletionDialog(false);
                setSelectedBooking(null);
                setRating(5);
                setFeedback('');
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleCompletionConfirm}
            >
              Confirm & Submit Feedback
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
} 