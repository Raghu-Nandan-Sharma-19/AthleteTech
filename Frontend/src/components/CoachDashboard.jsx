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
  IconButton,
  LinearProgress,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Divider
} from '@mui/material';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc, orderBy, limit } from 'firebase/firestore';
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
import DeleteIcon from '@mui/icons-material/Delete';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import StarIcon from '@mui/icons-material/Star';

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
  const [athletes, setAthletes] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalSessions: 0,
    completionRate: 0,
    averageRating: 0,
    activeAthletes: 0
  });

  // New states for analytics
  const [performanceData, setPerformanceData] = useState([]);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [completedSessions, setCompletedSessions] = useState([]);

  useEffect(() => {
    fetchBookings();
    fetchAthletes();
    fetchAnalytics();
    fetchCompletedSessions();
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

  const fetchAthletes = async () => {
    try {
      const athletesQuery = query(
        collection(db, 'athletes'),
        where('coachId', '==', currentUser.uid)
      );
      const snapshot = await getDocs(athletesQuery);
      const athletesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAthletes(athletesData);
    } catch (error) {
      console.error('Error fetching athletes:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      // Fetch last 6 months of performance data
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const sessionsQuery = query(
        collection(db, 'bookings'),
        where('coachId', '==', currentUser.uid),
        where('date', '>=', sixMonthsAgo.toISOString()),
        orderBy('date', 'desc')
      );

      const snapshot = await getDocs(sessionsQuery);
      const sessions = snapshot.docs.map(doc => doc.data());

      // Calculate analytics
      const totalSessions = sessions.length;
      const completedSessions = sessions.filter(s => s.status === 'completed').length;
      const completionRate = (completedSessions / totalSessions) * 100;
      const ratings = sessions.filter(s => s.rating).map(s => s.rating);
      const averageRating = ratings.length > 0 
        ? ratings.reduce((acc, curr) => acc + curr, 0) / ratings.length 
        : 0;

      setAnalytics({
        totalSessions,
        completionRate,
        averageRating,
        activeAthletes: athletes.length
      });

      // Prepare performance data for chart
      const performanceByMonth = sessions.reduce((acc, session) => {
        const month = new Date(session.date).toLocaleString('default', { month: 'short' });
        if (!acc[month]) {
          acc[month] = {
            month,
            sessions: 0,
            completedSessions: 0
          };
        }
        acc[month].sessions++;
        if (session.status === 'completed') {
          acc[month].completedSessions++;
        }
        return acc;
      }, {});

      setPerformanceData(Object.values(performanceByMonth));
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchCompletedSessions = async () => {
    try {
      const completedQuery = query(
        collection(db, 'bookings'),
        where('coachId', '==', currentUser.uid),
        where('status', '==', 'completed'),
        limit(10)
      );
      const snapshot = await getDocs(completedQuery);
      const completedData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort the data on the client side instead
      const sortedData = completedData.sort((a, b) => {
        const dateA = new Date(a.completedAt || a.date);
        const dateB = new Date(b.completedAt || b.date);
        return dateB - dateA; // Sort in descending order (most recent first)
      });
      
      setCompletedSessions(sortedData);
      setError(''); // Clear any existing errors
    } catch (error) {
      console.error('Error fetching completed sessions:', error);
      setError('Failed to fetch completed sessions');
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
        // Show sessions that are either marked as completed or pending_completion with both parties confirming
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
      // Include confirmed sessions that haven't been completed yet
      if (booking.status !== 'confirmed') return false;

      // Don't filter out sessions by time - keep them visible until completed
      return true;
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
          Session is scheduled and confirmed
        </Alert>
      );
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

  // Analytics Dashboard Component
  const AnalyticsDashboard = () => (
    <Box sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        {/* Analytics Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <BarChartIcon color="primary" />
                <Box>
                  <Typography variant="h6">{analytics.totalSessions}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Sessions</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <DoneAllIcon color="success" />
                <Box>
                  <Typography variant="h6">{analytics.completionRate.toFixed(1)}%</Typography>
                  <Typography variant="body2" color="text.secondary">Completion Rate</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <PeopleIcon color="info" />
                <Box>
                  <Typography variant="h6">{analytics.activeAthletes}</Typography>
                  <Typography variant="body2" color="text.secondary">Active Athletes</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <TrendingUpIcon color="secondary" />
                <Box>
                  <Typography variant="h6">{analytics.averageRating.toFixed(1)}/5</Typography>
                  <Typography variant="body2" color="text.secondary">Average Rating</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Performance Overview</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Line type="monotone" dataKey="sessions" stroke="#8884d8" name="Total Sessions" />
                <Line type="monotone" dataKey="completedSessions" stroke="#82ca9d" name="Completed Sessions" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  // Athletes List Component
  const AthletesList = () => (
    <Box sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        {athletes.map((athlete) => (
          <Grid item xs={12} sm={6} md={4} key={athlete.id}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar src={athlete.photoURL} alt={athlete.name}>
                    {athlete.name?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{athlete.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {athlete.sport || 'Sport not specified'}
                    </Typography>
                  </Box>
                </Stack>
                <Box sx={{ mt: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={athlete.progressPercentage || 0} 
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Progress: {athlete.progressPercentage || 0}%
                  </Typography>
                </Box>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  startIcon={<FitnessCenterIcon />}
                  onClick={() => navigate(`/athlete/${athlete.id}`)}
                >
                  View Progress
                </Button>
                <Button 
                  size="small" 
                  startIcon={<CalendarMonthIcon />}
                  onClick={() => navigate(`/schedule/${athlete.id}`)}
                >
                  Schedule Session
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  // Completed Sessions Component
  const CompletedSessions = () => {
    useEffect(() => {
      fetchCompletedSessions();
    }, []);

    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Recently Completed Sessions
        </Typography>
        <Grid container spacing={3}>
          {completedSessions && completedSessions.length > 0 ? (
            completedSessions.map((session) => (
              <Grid item xs={12} sm={6} md={4} key={session.id}>
                <Card 
                  elevation={1}
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative'
                  }}
                >
                  <CardContent>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" component="div">
                        {session.athleteName}
                      </Typography>
                      <Chip
                        icon={<DoneAllIcon />}
                        label="Completed"
                        color="success"
                        size="small"
                      />
                    </Box>
                    
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarMonthIcon color="primary" fontSize="small" />
                        <Typography variant="body2">
                          {new Date(session.date).toLocaleDateString()}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTimeIcon color="primary" fontSize="small" />
                        <Typography variant="body2">
                          {session.time} ({session.duration} mins)
                        </Typography>
                      </Box>

                      {session.isVirtual && (
                        <Chip
                          icon={<VideocamIcon />}
                          label="Virtual Session"
                          size="small"
                          color="info"
                          sx={{ alignSelf: 'flex-start' }}
                        />
                      )}

                      {session.rating && (
                        <Paper 
                          elevation={0}
                          sx={{ 
                            p: 1.5,
                            bgcolor: 'success.light',
                            color: 'success.contrastText',
                            borderRadius: 1,
                            mt: 1
                          }}
                        >
                          <Stack spacing={1}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <StarIcon color="inherit" fontSize="small" />
                              <Typography variant="body2" fontWeight="medium">
                                Rating: {session.rating}/5
                              </Typography>
                            </Box>
                            {session.feedback && (
                              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                "{session.feedback}"
                              </Typography>
                            )}
                          </Stack>
                        </Paper>
                      )}
                    </Stack>
                  </CardContent>
                  <CardActions sx={{ mt: 'auto', p: 2, pt: 0 }}>
                    <Button 
                      size="small"
                      startIcon={<FitnessCenterIcon />}
                      onClick={() => navigate(`/session-details/${session.id}`)}
                    >
                      View Details
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
                  bgcolor: 'grey.50',
                  border: '1px dashed',
                  borderColor: 'grey.300'
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  No completed sessions yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Completed sessions will appear here
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    );
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
              variant={isSmallScreen ? "scrollable" : "fullWidth"}
              scrollButtons={isSmallScreen ? "auto" : false}
              sx={{ mb: 3 }}
            >
              <Tab icon={<BarChartIcon />} label="Analytics" />
              <Tab icon={<PeopleIcon />} label="Athletes" />
              <Tab icon={<CalendarMonthIcon />} label="Sessions" />
              <Tab icon={<DoneAllIcon />} label="Completed" />
            </Tabs>
          </Box>

          {/* Bookings Grid */}
          <Box sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 3, sm: 4 } }}>
            {tabValue === 0 && <AnalyticsDashboard />}
            {tabValue === 1 && <AthletesList />}
            {tabValue === 2 && (
              <>
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

                                {/* Virtual Session Link */}
                                {booking.isVirtual && booking.meetLink && (
                                  <Paper 
                                    variant="outlined" 
                                    sx={{ 
                                      p: 2,
                                      backgroundColor: theme.palette.info[50],
                                      borderRadius: 2,
                                      borderColor: theme.palette.info[200]
                                    }}
                                  >
                                    <Stack spacing={2}>
                                      <Typography variant="subtitle2" color="text.secondary">
                                        Virtual Session Link
                                      </Typography>
                                      <Link href={booking.meetLink} target="_blank" rel="noopener">
                                        {booking.meetLink}
                                      </Link>
                                    </Stack>
                                  </Paper>
                                )}

                                {/* Session Status */}
                                <SessionStatusAlert booking={booking} />
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
              </>
            )}
            {tabValue === 3 && <CompletedSessions />}
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