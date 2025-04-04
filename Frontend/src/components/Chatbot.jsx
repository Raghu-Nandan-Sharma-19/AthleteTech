import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  CircularProgress,
  Avatar,
  Card,
  CardContent,
  Button,
  Chip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import HealingIcon from '@mui/icons-material/Healing';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { getGeminiResponse } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

// Common questions that users might want to ask
const SUGGESTED_QUESTIONS = [
  { text: "Create a running training plan for a beginner", icon: <FitnessCenterIcon /> },
  { text: "What should I eat before a competition?", icon: <RestaurantIcon /> },
  { text: "Best recovery techniques for muscle soreness", icon: <HealingIcon /> },
  { text: "Mental preparation tips for game day", icon: <PsychologyIcon /> }
];

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Show welcome message on load
  useEffect(() => {
    setMessages([{
      text: "Hi there! I'm your AI sports coach assistant. How can I help you today? Feel free to ask me about training plans, nutrition advice, recovery techniques, or performance tips.",
      sender: 'ai'
    }]);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message to chat
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);

    try {
      // Get AI response
      const response = await getGeminiResponse(userMessage);
      
      // Add AI response to chat
      setMessages(prev => [...prev, { text: response, sender: 'ai' }]);
    } catch (error) {
      console.error('Error getting response:', error);
      setMessages(prev => [...prev, {
        text: error.message || 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        error: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedQuestion = (question) => {
    setInput(question);
    // Focus the input field
    document.getElementById('chat-input').focus();
  };

  return (
    <Box sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
      {/* Chat messages area */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          bgcolor: 'background.default',
          borderRadius: 2,
          mb: 2
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
              mb: 2
            }}
          >
            <Card
              sx={{
                maxWidth: '80%',
                bgcolor: message.sender === 'user' ? 'primary.main' : 'background.paper',
                color: message.sender === 'user' ? 'white' : 'text.primary',
                borderRadius: 2,
                boxShadow: 1,
                ...(message.error && {
                  bgcolor: 'error.light',
                  color: 'error.contrastText'
                })
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      bgcolor: message.sender === 'user' ? 'primary.dark' : 'secondary.main'
                    }}
                  >
                    {message.sender === 'user' ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
                  </Avatar>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {message.sender === 'user' ? 'You' : 'AI Coach'}
                  </Typography>
                </Box>
                {message.sender === 'ai' && !message.error ? (
                  <Box sx={{ 
                    color: 'text.primary',
                    '& a': { color: 'primary.main' },
                    '& ul, & ol': { pl: 2, mb: 1 },
                    '& li': { mb: 0.5 },
                    '& p': { mb: 1 },
                    '& h1, & h2, & h3, & h4, & h5, & h6': { mb: 1, mt: 2, fontWeight: 600 },
                    '& code': { 
                      backgroundColor: 'rgba(0, 0, 0, 0.05)', 
                      padding: '2px 4px', 
                      borderRadius: '4px',
                      fontFamily: 'monospace' 
                    },
                    '& blockquote': { 
                      borderLeft: '4px solid', 
                      borderColor: 'primary.light',
                      pl: 2,
                      ml: 0,
                      fontStyle: 'italic'
                    },
                    '& table': {
                      borderCollapse: 'collapse',
                      width: '100%',
                      mb: 2
                    },
                    '& th, & td': {
                      border: '1px solid',
                      borderColor: 'divider',
                      p: 1
                    },
                    '& th': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      fontWeight: 600
                    }
                  }}>
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                  </Box>
                ) : (
                  <Typography 
                    sx={{ 
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.6
                    }}
                  >
                    {message.text}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        ))}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2, ml: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Suggested questions */}
      {messages.length <= 2 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, ml: 1, fontWeight: 500 }}>
            Try asking:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {SUGGESTED_QUESTIONS.map((question, index) => (
              <Chip
                key={index}
                label={question.text}
                icon={question.icon}
                onClick={() => handleSuggestedQuestion(question.text)}
                clickable
                sx={{ 
                  borderRadius: 2, 
                  py: 1.5,
                  bgcolor: 'primary.soft',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.light',
                    color: 'white'
                  }
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Input area */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 2
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            id="chat-input"
            fullWidth
            multiline
            maxRows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask your AI Coach anything..."
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          <IconButton
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            color="primary"
            sx={{
              alignSelf: 'flex-end',
              height: 48,
              width: 48,
              bgcolor: input.trim() && !isLoading ? 'primary.main' : 'action.disabledBackground',
              color: input.trim() && !isLoading ? 'white' : 'action.disabled',
              '&:hover': {
                bgcolor: 'primary.dark'
              }
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default Chatbot; 