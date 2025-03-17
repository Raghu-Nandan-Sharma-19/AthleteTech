const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

// Create a nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Welcome email templates
const getWelcomeEmailTemplate = (firstName, userType) => {
  const isCoach = userType === 'coach';
  
  return {
    subject: `Welcome to AthleteTech - Your ${isCoach ? 'Coaching' : 'Training'} Journey Begins!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1976d2;">Welcome to AthleteTech, ${firstName}! 🎉</h2>
        
        <p>We're excited to have you join our community as a ${isCoach ? 'coach' : 'athlete'}!</p>
        
        ${isCoach ? `
          <h3>What you can do as a coach:</h3>
          <ul>
            <li>Manage your training sessions</li>
            <li>Connect with athletes</li>
            <li>Schedule virtual or in-person sessions</li>
            <li>Track your athletes' progress</li>
          </ul>
        ` : `
          <h3>What you can do as an athlete:</h3>
          <ul>
            <li>Book training sessions</li>
            <li>Connect with expert coaches</li>
            <li>Choose between virtual or in-person training</li>
            <li>Track your progress</li>
          </ul>
        `}
        
        <p>Get started by logging into your dashboard:</p>
        <a href="https://athletetech.com/${userType}-dashboard" 
           style="background-color: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Go to Dashboard
        </a>
        
        <p style="margin-top: 20px;">
          If you have any questions, feel free to reach out to our support team at support@athletetech.com
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This email was sent by AthleteTech. Please do not reply to this email.
          </p>
        </div>
      </div>
    `
  };
};

// Cloud Function to send welcome email
exports.sendWelcomeEmail = functions.https.onCall(async (data, context) => {
  const { to, firstName, userType } = data;
  
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { subject, html } = getWelcomeEmailTemplate(firstName, userType);

  try {
    await transporter.sendMail({
      from: '"AthleteTech" <noreply@athletetech.com>',
      to,
      subject,
      html
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send welcome email');
  }
});

// Cloud Function to send notification email
exports.sendNotificationEmail = functions.https.onCall(async (data, context) => {
  const { to, subject, message } = data;
  
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    await transporter.sendMail({
      from: '"AthleteTech" <noreply@athletetech.com>',
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1976d2;">AthleteTech Notification</h2>
          <div style="padding: 20px; background-color: #f5f5f5; border-radius: 5px;">
            ${message}
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              This email was sent by AthleteTech. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error sending notification email:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send notification email');
  }
}); 