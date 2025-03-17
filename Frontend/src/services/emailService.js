import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseConfig } from '../config/firebase';

// Initialize Firebase app if not already initialized
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

// Function to send welcome email
export const sendWelcomeEmail = async (userData) => {
  try {
    const sendEmail = httpsCallable(functions, 'sendWelcomeEmail');
    await sendEmail({
      to: userData.email,
      firstName: userData.firstName,
      userType: userData.userType
    });
    console.log('Welcome email sent successfully');
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

// Function to send notification email
export const sendNotificationEmail = async (to, subject, message) => {
  try {
    const sendEmail = httpsCallable(functions, 'sendNotificationEmail');
    await sendEmail({
      to,
      subject,
      message
    });
    console.log('Notification email sent successfully');
  } catch (error) {
    console.error('Error sending notification email:', error);
    throw error;
  }
}; 