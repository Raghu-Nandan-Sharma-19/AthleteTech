import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Paper,
  useTheme,
  useMediaQuery,
  CardActions,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Link,
  Switch,
  FormControlLabel,
  IconButton
} from '@mui/material';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AllInboxIcon from '@mui/icons-material/AllInbox';
import LogoutIcon from '@mui/icons-material/Logout';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import VideocamIcon from '@mui/icons-material/Videocam';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DoneAllIcon from '@mui/icons-material/DoneAll';

export default function CoachDashboard() {
  const { currentUser, userDetails, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [emergencyCancelDialog, setEmergencyCancelDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [emergencyReason, setEmergencyReason] = useState('');
  const [isVirtualSession, setIsVirtualSession] = useState(false);
  const [meetLink, setMeetLink] = useState('');
  const [meetLinkDialog, setMeetLinkDialog] = useState(false);
  const [meetLinkInput, setMeetLinkInput] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('coachId', '==', currentUser.uid)
      );
      const querySnapshot = await getDocs(bookingsQuery);
      const bookingsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort bookings by date and time
      const sortedBookings = bookingsData.sort((a, b) => {
        const dateA = new Date(a.date + ' ' + a.time);
        const dateB = new Date(b.date + ' ' + b.time);
        return dateA - dateB;
      });

      setBookings(sortedBookings);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings');
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (booking, newStatus) => {
    try {
      const updateData = {
        status: newStatus,
        updatedAt: new Date().toISOString()
      };

      // If confirming a virtual session, prompt for meet link
      if (newStatus === 'confirmed' && booking.isVirtual) {
        setSelectedBooking(booking);
        setMeetLinkDialog(true);
        return;
      }

      // If marking as completed
      if (newStatus === 'pending_completion') {
        updateData.completedByCoach = true;
        updateData.completedByCoachAt = new Date().toISOString();
        updateData.completionRequestedAt = new Date().toISOString();
        updateData.completionRequestedBy = 'coach';
      }

      // If session is completed by both parties
      if (booking.status === 'pending_completion' && booking.completedByAthlete && booking.completedByCoach) {
        updateData.status = 'completed';
        updateData.completedAt = new Date().toISOString();
      }

      await updateDoc(doc(db, 'bookings', booking.id), updateData);
      await fetchBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
      setError('Failed to update booking status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'completed':
        return 'info';
      case 'pending_completion':
        return 'secondary';
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
      case 'completed':
        return <DoneAllIcon />;
      case 'pending_completion':
        return <AccessTimeIcon />;
      default:
        return <AccessTimeIcon />;
    }
  };

  const filterBookings = (bookings, status) => {
    if (status === 'all') return bookings;
    
    return bookings.filter(booking => {
      if (status === 'completed') {
        // Only show sessions that are marked as completed by both coach and athlete
        return booking.status === 'completed' || 
               (booking.status === 'pending_completion' && booking.completedByAthlete && booking.completedByCoach);
      }
      if (status === 'cancelled') {
        // Only show explicitly cancelled sessions
        return booking.status === 'cancelled';
      }
      if (status === 'confirmed') {
        // Show confirmed sessions that haven't started yet
        if (booking.status !== 'confirmed') return false;
        const sessionDate = new Date(booking.date + ' ' + booking.time);
        return sessionDate > new Date();
      }
      if (status === 'pending') {
        // Show only pending sessions
        return booking.status === 'pending';
      }
      return booking.status === status;
    });
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

  const handleEmergencyCancel = (booking) => {
    setSelectedBooking(booking);
    setEmergencyCancelDialog(true);
  };

  const handleEmergencyCancelConfirm = async () => {
    if (!emergencyReason.trim()) {
      setError('Please provide a reason for emergency cancellation');
      return;
    }

    try {
      await updateDoc(doc(db, 'bookings', selectedBooking.id), {
        status: 'cancelled',
        cancellationType: 'emergency',
        cancellationReason: emergencyReason,
        cancelledAt: new Date().toISOString(),
        cancelledBy: 'coach'
      });

      setEmergencyCancelDialog(false);
      setSelectedBooking(null);
      setEmergencyReason('');
      await fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setError('Failed to cancel booking');
    }
  };

  const copyMeetLink = (link) => {
    navigator.clipboard.writeText(link)
      .then(() => {
        // You could add a temporary success message here
        console.log('Link copied to clipboard');
      })
      .catch((err) => {
        console.error('Failed to copy link:', err);
      });
  };

  const isSessionPast = (booking) => {
    const now = new Date();
    const sessionDate = new Date(booking.date);
    const [hours, minutes] = booking.time.split(':');
    sessionDate.setHours(parseInt(hours), parseInt(minutes));
    sessionDate.setMinutes(sessionDate.getMinutes() + parseInt(booking.duration));
    return now > sessionDate;
  };

  const handleMarkAsCompleted = async (booking) => {
    try {
      const updateData = {
        status: 'pending_completion',
        completedByCoach: true,
        completedByCoachAt: new Date().toISOString(),
        completionRequestedAt: new Date().toISOString(),
        completionRequestedBy: 'coach'
      };

      // If athlete has already marked it as completed
      if (booking.completedByAthlete) {
        updateData.status = 'completed';
        updateData.completedAt = new Date().toISOString();
      }

      await updateDoc(doc(db, 'bookings', booking.id), updateData);
      await fetchBookings();
    } catch (error) {
      console.error('Error marking session as completed:', error);
      setError('Failed to mark session as completed');
    }
  };

  const getUpcomingSessions = (bookings) => {
    const now = new Date();

    return bookings.filter(booking => {
      // Only include confirmed sessions that haven't started yet
      if (booking.status !== 'confirmed') return false;

      const sessionDate = new Date(booking.date + ' ' + booking.time);
      return sessionDate > now;
    }).sort((a, b) => {
      const dateA = new Date(a.date + ' ' + a.time);
      const dateB = new Date(b.date + ' ' + b.time);
      return dateA - dateB;
    });
  };

  const getNewBookings = (bookings) => {
    return bookings.filter(booking => booking.status === 'pending')
      .sort((a, b) => {
        const dateA = new Date(a.date + ' ' + a.time);
        const dateB = new Date(b.date + ' ' + b.time);
        return dateA - dateB;
      });
  };

  const handleMeetLinkSubmit = async () => {
    if (!selectedBooking || !meetLinkInput.trim()) {
      setError('Please provide a valid Google Meet link');
      return;
    }

    try {
      const updateData = {
        status: 'confirmed',
        meetLink: meetLinkInput.trim(),
        updatedAt: new Date().toISOString()
      };

      await updateDoc(doc(db, 'bookings', selectedBooking.id), updateData);
      setMeetLinkDialog(false);
      setSelectedBooking(null);
      setMeetLinkInput('');
      await fetchBookings();
    } catch (error) {
      console.error('Error updating meet link:', error);
      setError('Failed to update meet link');
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
    const sessionDate = new Date(booking.date + ' ' + booking.time);
    const sessionEndTime = new Date(sessionDate.getTime() + booking.duration * 60000);
    return now > sessionEndTime;
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
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab 
                icon={<AllInboxIcon />} 
                label="ALL BOOKINGS" 
                iconPosition="start"
              />
              <Tab 
                icon={<PendingIcon />} 
                label="PENDING" 
                iconPosition="start"
              />
              <Tab 
                icon={<CheckCircleIcon />} 
                label="CONFIRMED" 
                iconPosition="start"
              />
              <Tab 
                icon={<DoneAllIcon />} 
                label="COMPLETED" 
                iconPosition="start"
              />
              <Tab 
                icon={<CancelIcon />} 
                label="CANCELLED" 
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {/* Bookings Grid */}
          <Box sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 3, sm: 4 } }}>
            {tabValue === 0 ? (
              <Stack spacing={4}>
                {/* New Bookings Section */}
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
                    <PendingIcon color="warning" />
                    New Bookings
                    {getNewBookings(bookings).length > 0 && (
                      <Chip 
                        label={getNewBookings(bookings).length} 
                        color="warning" 
                        size="small" 
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Typography>

                  <Grid container spacing={3} columns={12}>
                    {getNewBookings(bookings).length > 0 ? (
                      getNewBookings(bookings).map((booking) => (
                        <Grid item xs={12} sm={6} key={booking.id}>
                          <Card 
                            elevation={1}
                            sx={{ 
                              height: '100%',
                              borderRadius: 2,
                              transition: 'all 0.2s ease',
                              position: 'relative',
                              overflow: 'visible',
                              border: `1px solid ${theme.palette.warning.light}`,
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 3
                              }
                            }}
                          >
                            {/* Existing Card Content */}
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
                                    Session with {booking.athleteName}
                                  </Typography>
                                  
                                  {booking.isVirtual && (
                                    <Chip
                                      icon={<VideocamIcon />}
                                      label="Virtual Session"
                                      color="info"
                                      size="small"
                                      sx={{ 
                                        borderRadius: '12px',
                                        fontSize: '0.875rem'
                                      }}
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
                                    <Typography 
                                      variant="subtitle2" 
                                      color="text.secondary" 
                                      gutterBottom
                                      sx={{ fontSize: '0.875rem' }}
                                    >
                                      Session Notes
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.875rem' }}>
                                      {booking.notes}
                                    </Typography>
                                  </Paper>
                                )}

                                {/* Emergency Cancellation Alert */}
                                {booking.cancellationType === 'emergency' && (
                                  <Alert 
                                    severity="error"
                                    icon={<ErrorOutlineIcon />}
                                    sx={{ borderRadius: 2 }}
                                  >
                                    <Typography variant="subtitle2" gutterBottom>
                                      Emergency Cancellation
                                    </Typography>
                                    <Typography variant="body2">
                                      {booking.cancellationReason}
                                    </Typography>
                                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                      Cancelled on: {new Date(booking.cancelledAt).toLocaleString()}
                                    </Typography>
                                  </Alert>
                                )}

                                {/* Meet Link - only show for confirmed virtual sessions */}
                                {booking.isVirtual && booking.meetLink && booking.status === 'confirmed' && (
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
                                          '&:hover': {
                                            textDecoration: 'underline'
                                          }
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
                                          '&:hover': {
                                            backgroundColor: theme.palette.grey[100]
                                          }
                                        }}
                                      >
                                        <ContentCopyIcon fontSize="small" />
                                      </IconButton>
                                    </Stack>
                                  </Paper>
                                )}

                                {/* Completion Status */}
                                {booking.status === 'pending_completion' && !booking.completedByAthlete && (
                                  <Box sx={{ mt: 2 }}>
                                    <Alert 
                                      severity="warning"
                                      icon={<PendingIcon />}
                                    >
                                      Waiting for athlete to confirm completion and provide feedback
                                    </Alert>
                                  </Box>
                                )}
                              </Stack>
                            </CardContent>

                            {/* Action Buttons */}
                            <CardActions sx={{ p: 3, pt: 0, gap: 2 }}>
                              <Button
                                color="primary" 
                                variant="contained"
                                fullWidth
                                onClick={() => handleStatusUpdate(booking, 'confirmed')}
                                sx={{ 
                                  borderRadius: 2,
                                  py: 1.5,
                                  fontSize: '1rem'
                                }}
                              >
                                Accept
                              </Button>
                              <Button 
                                color="error"
                                variant="outlined"
                                fullWidth
                                onClick={() => handleStatusUpdate(booking, 'cancelled')}
                                sx={{ 
                                  borderRadius: 2,
                                  py: 1.5,
                                  fontSize: '1rem'
                                }}
                              >
                                Decline
                              </Button>
                            </CardActions>
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
                            borderWidth: 1,
                            borderColor: theme.palette.warning.light
                          }}
                        >
                          <Typography 
                            variant="h6" 
                            color="text.secondary"
                            sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                          >
                            No new booking requests
                          </Typography>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </Box>

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

                  <Grid container spacing={3} columns={12}>
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
                            {/* Card Content */}
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
                                    Session with {booking.athleteName}
                                  </Typography>
                                  
                                  {booking.isVirtual && (
                                    <Chip
                                      icon={<VideocamIcon />}
                                      label="Virtual Session"
                                      color="info"
                                      size="small"
                                      sx={{ 
                                        borderRadius: '12px',
                                        fontSize: '0.875rem'
                                      }}
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

                                {/* Meet Link Section */}
                                {booking.isVirtual && (
                                  <Paper 
                                    variant="outlined" 
                                    sx={{ 
                                      p: 2,
                                      backgroundColor: theme.palette.primary[50],
                                      borderRadius: 2,
                                      borderColor: theme.palette.primary[200]
                                    }}
                                  >
                                    <Stack spacing={2}>
                                      <Stack direction="row" alignItems="center" spacing={2}>
                                        <VideocamIcon color="primary" />
                                        <Typography sx={{ flexGrow: 1 }}>
                                          Virtual Session
                                        </Typography>
                                      </Stack>

                                      {booking.meetLink ? (
                                        <Stack direction="row" alignItems="center" spacing={2}>
                                          <Link 
                                            href={booking.meetLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            sx={{ 
                                              flexGrow: 1,
                                              color: theme.palette.primary.main,
                                              textDecoration: 'none',
                                              '&:hover': {
                                                textDecoration: 'underline'
                                              }
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
                                              '&:hover': {
                                                backgroundColor: theme.palette.grey[100]
                                              }
                                            }}
                                          >
                                            <ContentCopyIcon fontSize="small" />
                                          </IconButton>
                                        </Stack>
                                      ) : (
                                        <Button
                                          variant="contained"
                                          color="primary"
                                          fullWidth
                                          onClick={() => {
                                            setSelectedBooking(booking);
                                            setMeetLinkDialog(true);
                                          }}
                                          sx={{ 
                                            borderRadius: 1,
                                            py: 1
                                          }}
                                        >
                                          Add Meet Link
                                        </Button>
                                      )}
                                    </Stack>
                                  </Paper>
                                )}

                                {/* Session Status and Actions */}
                                {booking.status === 'confirmed' && (
                                  <Box sx={{ mt: 2 }}>
                                    {isSessionFinished(booking) ? (
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
                                    ) : (
                                      <Alert severity="success">
                                        Session is scheduled and confirmed
                                      </Alert>
                                    )}
                                  </Box>
                                )}

                                {booking.status === 'pending_completion' && !booking.completedByAthlete && (
                                  <Box sx={{ mt: 2 }}>
                                    <Alert 
                                      severity="warning"
                                      icon={<PendingIcon />}
                                    >
                                      Waiting for athlete to confirm completion and provide feedback
                                    </Alert>
                                  </Box>
                                )}
                              </Stack>
                            </CardContent>

                            {/* Action Buttons */}
                            <CardActions sx={{ p: 3, pt: 0 }}>
                              <Button
                                fullWidth
                                variant="outlined"
                                color="error"
                                startIcon={<ErrorOutlineIcon />}
                                onClick={() => handleEmergencyCancel(booking)}
                                sx={{ 
                                  borderRadius: 2,
                                  py: 1.5,
                                  fontSize: '1rem'
                                }}
                              >
                                Emergency Cancel
                              </Button>
                            </CardActions>
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
                            borderWidth: 1,
                            borderColor: theme.palette.success.light
                          }}
                        >
                          <Typography 
                            variant="h6" 
                            color="text.secondary"
                            sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                          >
                            No upcoming sessions
                          </Typography>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </Stack>
            ) : (
              <Grid container spacing={3}>
                {filterBookings(bookings, ['all', 'pending', 'confirmed', 'completed', 'cancelled'][tabValue]).map((booking) => (
                  <Grid item xs={12} sm={6} key={booking.id}>
                    <Card elevation={1} sx={{ height: '100%', borderRadius: 2 }}>
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
                              Session with {booking.athleteName}
                            </Typography>
                            
                            {booking.isVirtual && (
                              <Chip
                                icon={<VideocamIcon />}
                                label="Virtual Session"
                                color="info"
                                size="small"
                                sx={{ 
                                  borderRadius: '12px',
                                  fontSize: '0.875rem'
                                }}
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

                          {/* Rating and Feedback - Only show for completed sessions */}
                          {booking.status === 'completed' && (
                            <Paper 
                              variant="outlined" 
                              sx={{ 
                                p: 2,
                                backgroundColor: theme.palette.success[50],
                                borderRadius: 2,
                                borderColor: theme.palette.success[200]
                              }}
                            >
                              <Stack spacing={2}>
                                <Typography 
                                  variant="subtitle2" 
                                  color="text.secondary"
                                  sx={{ fontSize: '0.875rem' }}
                                >
                                  Athlete Feedback
                                </Typography>
                                
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <Typography 
                                    variant="h6" 
                                    color="success.main"
                                    sx={{ fontSize: '1.25rem' }}
                                  >
                                    {booking.rating}/5
                                  </Typography>
                                  <Typography 
                                    variant="body2" 
                                    color="text.secondary"
                                    sx={{ fontSize: '0.875rem' }}
                                  >
                                    Rating
                                  </Typography>
                                </Stack>

                                {booking.feedback && (
                                  <Typography 
                                    variant="body2"
                                    sx={{ 
                                      fontSize: '0.875rem',
                                      fontStyle: 'italic',
                                      color: theme.palette.text.secondary
                                    }}
                                  >
                                    "{booking.feedback}"
                                  </Typography>
                                )}

                                <Typography 
                                  variant="caption" 
                                  color="text.secondary"
                                  sx={{ fontSize: '0.75rem' }}
                                >
                                  Completed on: {new Date(booking.completedAt).toLocaleDateString()}
                                </Typography>
                              </Stack>
                            </Paper>
                          )}

                          {/* Completion Status Alert */}
                          <Alert 
                            icon={<DoneAllIcon />}
                            severity="success"
                          >
                            Session completed successfully
                          </Alert>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
                {filterBookings(bookings, ['all', 'pending', 'confirmed', 'completed', 'cancelled'][tabValue]).length === 0 && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2, backgroundColor: 'white', borderStyle: 'dashed' }}>
                      <Typography variant="h6" color="text.secondary">
                        No {['all', 'pending', 'confirmed', 'completed', 'cancelled'][tabValue]} sessions
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            )}
          </Box>
        </Stack>
      </Container>

      {/* Emergency Cancellation Dialog */}
      <Dialog 
        open={emergencyCancelDialog} 
        onClose={() => {
          setEmergencyCancelDialog(false);
          setSelectedBooking(null);
          setEmergencyReason('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 2 }}>
          Emergency Session Cancellation
        </DialogTitle>
        <DialogContent>
          <Alert 
            severity="warning" 
            sx={{ mb: 3 }}
          >
            Please note that emergency cancellations should only be used for genuine emergencies.
          </Alert>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Reason for Emergency Cancellation"
            value={emergencyReason}
            onChange={(e) => setEmergencyReason(e.target.value)}
            error={Boolean(error && !emergencyReason)}
            helperText={error && !emergencyReason ? 'Please provide a reason' : ''}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={() => {
              setEmergencyCancelDialog(false);
              setSelectedBooking(null);
              setEmergencyReason('');
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={handleEmergencyCancelConfirm}
          >
            Confirm Cancellation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Meet Link Dialog */}
      <Dialog 
        open={meetLinkDialog} 
        onClose={() => {
          setMeetLinkDialog(false);
          setSelectedBooking(null);
          setMeetLinkInput('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 2 }}>
          Add Google Meet Link
        </DialogTitle>
        <DialogContent>
          <Alert 
            severity="info" 
            sx={{ mb: 3 }}
          >
            Please create a Google Meet session and paste the link here. The athlete will be notified via email.
          </Alert>
          <TextField
            fullWidth
            label="Google Meet Link"
            placeholder="https://meet.google.com/xxx-xxxx-xxx"
            value={meetLinkInput}
            onChange={(e) => setMeetLinkInput(e.target.value)}
            error={Boolean(error && !meetLinkInput)}
            helperText={error && !meetLinkInput ? 'Please provide a valid Google Meet link' : ''}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={() => {
              setMeetLinkDialog(false);
              setSelectedBooking(null);
              setMeetLinkInput('');
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleMeetLinkSubmit}
          >
            Add Link & Send Notification
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 