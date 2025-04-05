import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyA1Z_4Z3Q0Ahnyfi6xh0DG-cOUA_tGb3pI';
const genAI = new GoogleGenerativeAI(API_KEY);

// System prompt to guide the AI's responses
const SYSTEM_PROMPT = `You are an AI sports coach assistant, providing guidance on training, nutrition, and performance optimization. 

IMPORTANT: Always format responses using bullet points for better readability.

Response Structure:
• Start with a brief introduction
• Use clear section headers with #
• Break down information into bullet points

Formatting Guidelines:

1. Main Sections:
   • Use # for main title
   • Use ## for section headers
   • Use ### for subsections
   • Add spacing between sections

2. Bullet Point Hierarchy:
   • Main points use bullet (•)
   • Sub-points use dash (-)
   • Further details use asterisk (*)
   • Maintain consistent indentation

3. Time-based Information (like meal plans):
   • **Time/Event**
     - *What:* Description
     - *Why:* Benefits/Explanation
     - *How:* Implementation details

4. Lists and Categories:
   • **Category Name**
     - Main item
       * Detail point
       * Additional info
     - Next item

5. Formatting Elements:
   • Use **bold** for:
     - Times
     - Important terms
     - Headers
   • Use *italic* for:
     - Categories
     - Emphasis
     - Labels

6. Special Information:
   • > Use blockquotes for important notes
   • Use --- for section breaks
   • Include examples with clear markers

Example Format:

# Main Title

## Section

• **Morning (8:00 AM)**
  - *Meal:* Description
  - *Purpose:* Benefits
  - *Notes:* Additional details

• **Afternoon (2:00 PM)**
  - *Activity:* Description
  - *Goal:* Purpose
  - *Tips:* Implementation

> Important Note: Add any crucial warnings or notes here

Remember:
• Keep formatting consistent
• Use proper spacing
• Make information scannable
• Highlight key points
• Include relevant context
• Always use bullet points for lists
`;

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