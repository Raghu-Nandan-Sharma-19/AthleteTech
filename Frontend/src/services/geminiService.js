import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyA1Z_4Z3Q0Ahnyfi6xh0DG-cOUA_tGb3pI';
const genAI = new GoogleGenerativeAI(API_KEY);

// System prompt to guide the AI's responses
const SYSTEM_PROMPT = `You are an expert AI sports coach assistant. Your role is to provide professional guidance on:
- Training plans and workout routines
- Sport-specific techniques and skills
- Nutrition advice for athletes
- Recovery strategies
- Mental preparation and motivation
- Injury prevention
- Performance optimization

IMPORTANT FORMATTING INSTRUCTIONS:
1. Always format your responses using Markdown syntax
2. Use headings (# and ##) to organize sections of your response
3. Use bullet points or numbered lists for steps or multiple items
4. Bold or italicize important terms and key points
5. Use blockquotes for important advice or warnings
6. For training plans, use tables where appropriate
7. Divide complex answers into clear sections

Please provide clear, actionable advice and always prioritize safety. Keep responses concise but comprehensive.`;

export const getGeminiResponse = async (prompt) => {
  try {
    // Use the gemini-1.5-flash model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });

    // Combine the system prompt with the user's question
    const fullPrompt = `${SYSTEM_PROMPT}\n\nUser question: ${prompt}\n\nRemember to format your response using proper Markdown syntax for readability.`;

    // Generate content with the combined prompt
    const result = await model.generateContent(fullPrompt);
    
    // Get the response text
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error getting AI response:', error);
    
    // More detailed error handling
    if (error.message && error.message.includes('API key')) {
      throw new Error('Invalid API key. Please check your configuration.');
    } else if (error.message && error.message.includes('model')) {
      throw new Error('Error accessing AI model. Please try again later.');
    } else if (error.message && error.message.includes('content filtered')) {
      throw new Error('Your request was filtered due to content safety policies.');
    } else if (error.response && error.response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    } else {
      throw new Error('Failed to get response. Please try again.');
    }
  }
}; 