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
  Stack
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

export default function CoachDashboard() {
  const { currentUser, userDetails, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

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
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: newStatus
      });
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

  const filterBookings = (bookings, status) => {
    if (status === 'all') return bookings;
    return bookings.filter(booking => booking.status === status);
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
                minHeight: { xs: 48, sm: 56 },
                '& .MuiTab-root': {
                  minHeight: { xs: 48, sm: 56 },
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }
              }}
            >
              <Tab 
                icon={<AllInboxIcon sx={{ mr: 1 }} />}
                iconPosition="start"
                label="All Bookings"
                sx={{ 
                  borderRadius: '4px 4px 0 0',
                  '&.Mui-selected': {
                    color: theme.palette.primary.main,
                    fontWeight: 600
                  }
                }}
              />
              <Tab 
                icon={<PendingIcon sx={{ mr: 1 }} />}
                iconPosition="start"
                label="Pending"
                sx={{ 
                  borderRadius: '4px 4px 0 0',
                  '&.Mui-selected': {
                    color: theme.palette.primary.main,
                    fontWeight: 600
                  }
                }}
              />
              <Tab 
                icon={<CheckCircleIcon sx={{ mr: 1 }} />}
                iconPosition="start"
                label="Confirmed"
                sx={{ 
                  borderRadius: '4px 4px 0 0',
                  '&.Mui-selected': {
                    color: theme.palette.primary.main,
                    fontWeight: 600
                  }
                }}
              />
              <Tab 
                icon={<CancelIcon sx={{ mr: 1 }} />}
                iconPosition="start"
                label="Cancelled"
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

          {/* Bookings Grid */}
          <Box sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 3, sm: 4 } }}>
            <Grid 
              container 
              spacing={3}
              columns={12}
            >
              {filterBookings(bookings, ['all', 'pending', 'confirmed', 'cancelled'][tabValue]).map((booking) => (
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
                        {/* Booking Header */}
                        <Stack 
                          direction="row" 
                          justifyContent="space-between" 
                          alignItems="flex-start"
                          spacing={2}
                        >
                          <Typography 
                            variant="h5"
                            sx={{ 
                              fontSize: { xs: '1.5rem', sm: '1.75rem' },
                              fontWeight: 600
                            }}
                          >
                            Session with {booking.athleteName}
                          </Typography>
                          <Chip
                            icon={getStatusIcon(booking.status)}
                            label={booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            color={getStatusColor(booking.status)}
                            sx={{ 
                              borderRadius: 1,
                              fontSize: { xs: '0.875rem', sm: '1rem' },
                              py: 1.5
                            }}
                          />
                        </Stack>

                        {/* Booking Details */}
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

                    {booking.status === 'pending' && (
                      <CardActions sx={{ p: 3, pt: 0, gap: 2 }}>
                        <Button 
                          color="primary" 
                          variant="contained"
                          fullWidth
                          onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                          sx={{ 
                            borderRadius: 1,
                            py: 1.5,
                            fontSize: { xs: '1rem', sm: '1.1rem' }
                          }}
                        >
                          Accept
                        </Button>
                        <Button 
                          color="error"
                          variant="outlined"
                          fullWidth
                          onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                          sx={{ 
                            borderRadius: 1,
                            py: 1.5,
                            fontSize: { xs: '1rem', sm: '1.1rem' }
                          }}
                        >
                          Decline
                        </Button>
                      </CardActions>
                    )}
                  </Card>
                </Grid>
              ))}

              {filterBookings(bookings, ['all', 'pending', 'confirmed', 'cancelled'][tabValue]).length === 0 && (
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
                      No {['all', 'pending', 'confirmed', 'cancelled'][tabValue]} bookings found
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
} 