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
import { useTheme } from '@mui/material/styles';

const CareerRoadmapGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [roadmap, setRoadmap] = useState(null);

  const [formData, setFormData] = useState({
    sport: '',
    currentLevel: '',
    age: '',
    yearsOfExperience: '',
    careerGoals: '',
    strengths: '',
    areasToImprove: '',
  });

  const theme = useTheme();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateRoadmap = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Here you would typically call your AI service/API
      // For now, we'll create a mock response
      const mockRoadmap = {
        plan: `**Athlete Profile:**
        - Sport: ${formData.sport}
        - Current Level: ${formData.currentLevel}
        - Age: ${formData.age}
        - Years of Experience: ${formData.yearsOfExperience}
        - Career Goals: ${formData.careerGoals}
        
        **Your Personalized Career Roadmap**

        **Short-term Goals (Next 6 months):**
        - Focus on ${formData.areasToImprove.split(',').slice(0, 2).join(' and ')}
        - Build a strong foundation in ${formData.strengths.split(',').slice(0, 1)}
        - Participate in local competitions to gain experience
        
        **Medium-term Goals (1-2 years):**
        - Develop advanced skills in ${formData.sport}
        - Compete at regional/national level
        - Work on mental toughness and game strategy
        - Build a professional network in the sports industry
        
        **Long-term Goals (3-5 years):**
        - Achieve professional status in ${formData.sport}
        - Represent at international competitions
        - Establish a strong personal brand
        - Consider coaching/mentoring opportunities
        
        **Key Milestones:**
        1. Next 3 months: Focus on skill development
        2. 6 months: First major competition
        3. 1 year: Regional championship qualification
        4. 2 years: National level competition
        5. 3 years: International exposure
        
        **Action Items:**
        - Daily practice routine
        - Weekly skill assessment
        - Monthly performance review
        - Quarterly goal setting
        - Annual career planning
        
        **Your Strengths:**
        ${formData.strengths.split(',').map(strength => `- ${strength.trim()}`).join('\n')}
        
        **Areas for Improvement:**
        ${formData.areasToImprove.split(',').map(area => `- ${area.trim()}`).join('\n')}
        
        **Note:** This roadmap is a general guideline. Adjust based on your progress and changing circumstances.`,
        generatedAt: new Date().toISOString()
      };

      // Save to Firestore
      await addDoc(collection(db, 'careerRoadmaps'), {
        ...formData,
        plan: mockRoadmap.plan,
        generatedAt: mockRoadmap.generatedAt,
        userId: 'current-user-id' // You'll need to get this from your auth context
      });

      setRoadmap(mockRoadmap);
      setSuccess('Career roadmap generated successfully!');
    } catch (err) {
      setError('Failed to generate career roadmap. Please try again.');
      console.error('Error generating career roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          AI Career Roadmap Generator
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
              <InputLabel>Current Level</InputLabel>
              <Select
                name="currentLevel"
                value={formData.currentLevel}
                onChange={handleChange}
                label="Current Level"
              >
                <MenuItem value="beginner">Beginner</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
                <MenuItem value="professional">Professional</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="age"
              label="Age"
              type="number"
              value={formData.age}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="yearsOfExperience"
              label="Years of Experience"
              type="number"
              value={formData.yearsOfExperience}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              name="careerGoals"
              label="Career Goals"
              multiline
              rows={2}
              value={formData.careerGoals}
              onChange={handleChange}
              placeholder="e.g., Become a professional athlete, Win national championships, etc."
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              name="strengths"
              label="Your Strengths"
              multiline
              rows={2}
              value={formData.strengths}
              onChange={handleChange}
              placeholder="e.g., Speed, Agility, Teamwork, etc. (comma separated)"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              name="areasToImprove"
              label="Areas to Improve"
              multiline
              rows={2}
              value={formData.areasToImprove}
              onChange={handleChange}
              placeholder="e.g., Endurance, Technical skills, Mental toughness, etc. (comma separated)"
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={generateRoadmap}
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Generate Career Roadmap'}
            </Button>
          </Grid>
        </Grid>

        {roadmap && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Your Personalized Career Roadmap
            </Typography>
            <Typography 
              variant="body1" 
              style={{ 
                whiteSpace: 'pre-line',
                '& strong': {
                  fontWeight: 600,
                  color: theme.palette.primary.main
                }
              }}
              dangerouslySetInnerHTML={{
                __html: roadmap.plan
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\n/g, '<br />')
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default CareerRoadmapGenerator; 