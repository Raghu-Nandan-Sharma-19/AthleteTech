import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const WorkoutPlanGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [workoutPlan, setWorkoutPlan] = useState(null);

  const [formData, setFormData] = useState({
    sport: '',
    experienceLevel: '',
    trainingDays: '',
    goals: '',
    injuries: '',
    equipment: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateWorkoutPlan = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Here you would typically call your AI service/API
      // For now, we'll create a mock response
      const numDays = parseInt(formData.trainingDays);
      const workoutDays = [];

      // Define different types of workouts
      const workoutTypes = [
        {
          name: 'Strength Training',
          description: 'Focus on compound movements and strength building exercises'
        },
        {
          name: 'Skill Development',
          description: 'Sport-specific drills and technique refinement'
        },
        {
          name: 'Endurance Training',
          description: 'Cardiovascular and stamina building exercises'
        },
        {
          name: 'Agility & Speed',
          description: 'Speed drills and agility exercises'
        },
        {
          name: 'Recovery & Mobility',
          description: 'Active recovery and mobility work'
        },
        {
          name: 'Power Training',
          description: 'Explosive movements and power development'
        }
      ];

      // Generate workout days based on the number of training days
      for (let i = 0; i < numDays; i++) {
        const workoutType = workoutTypes[i % workoutTypes.length];
        workoutDays.push({
          day: i + 1,
          type: workoutType.name,
          description: workoutType.description,
          exercises: [
            'Warm-up: 10 minutes dynamic stretching',
            'Main exercises: ' + workoutType.description,
            'Cool-down: 5 minutes stretching'
          ]
        });
      }

      const mockWorkoutPlan = {
        plan: `Based on your inputs:
        - Sport: ${formData.sport}
        - Experience: ${formData.experienceLevel}
        - Training Days: ${formData.trainingDays}
        - Goals: ${formData.goals}
        
        Here's your personalized ${numDays}-day workout plan:
        
        ${workoutDays.map(day => `
        Day ${day.day}: ${day.type}
        - ${day.exercises.join('\n        - ')}
        `).join('\n')}
        
        Note: ${formData.injuries ? `Be cautious with ${formData.injuries}` : 'No injury concerns noted'}
        Equipment needed: ${formData.equipment || 'Standard gym equipment'}`,
        generatedAt: new Date().toISOString()
      };

      // Save to Firestore
      await addDoc(collection(db, 'workoutPlans'), {
        ...formData,
        plan: mockWorkoutPlan.plan,
        generatedAt: mockWorkoutPlan.generatedAt,
        userId: 'current-user-id' // You'll need to get this from your auth context
      });

      setWorkoutPlan(mockWorkoutPlan);
      setSuccess('Workout plan generated successfully!');
    } catch (err) {
      setError('Failed to generate workout plan. Please try again.');
      console.error('Error generating workout plan:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          AI Workout Plan Generator
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Sport</InputLabel>
              <Select
                name="sport"
                value={formData.sport}
                onChange={handleChange}
                label="Sport"
              >
                <MenuItem value="basketball">Basketball</MenuItem>
                <MenuItem value="football">Football</MenuItem>
                <MenuItem value="soccer">Soccer</MenuItem>
                <MenuItem value="tennis">Tennis</MenuItem>
                <MenuItem value="swimming">Swimming</MenuItem>
                <MenuItem value="track">Track & Field</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Experience Level</InputLabel>
              <Select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                label="Experience Level"
              >
                <MenuItem value="beginner">Beginner</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
                <MenuItem value="professional">Professional</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Training Days per Week</InputLabel>
              <Select
                name="trainingDays"
                value={formData.trainingDays}
                onChange={handleChange}
                label="Training Days per Week"
              >
                <MenuItem value="2">2 days</MenuItem>
                <MenuItem value="3">3 days</MenuItem>
                <MenuItem value="4">4 days</MenuItem>
                <MenuItem value="5">5 days</MenuItem>
                <MenuItem value="6">6 days</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              name="goals"
              label="Training Goals"
              multiline
              rows={2}
              value={formData.goals}
              onChange={handleChange}
              placeholder="e.g., Improve speed, Build strength, Enhance endurance"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              name="injuries"
              label="Previous Injuries or Limitations"
              multiline
              rows={2}
              value={formData.injuries}
              onChange={handleChange}
              placeholder="e.g., Knee injury, Back pain, etc."
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              name="equipment"
              label="Available Equipment"
              multiline
              rows={2}
              value={formData.equipment}
              onChange={handleChange}
              placeholder="e.g., Dumbbells, Resistance bands, etc."
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={generateWorkoutPlan}
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Generate Workout Plan'}
            </Button>
          </Grid>
        </Grid>

        {workoutPlan && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Your Personalized Workout Plan
            </Typography>
            <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
              {workoutPlan.plan}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkoutPlanGenerator; 