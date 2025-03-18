# AthleteTech

AthleteTech is a modern web application designed to connect coaches and athletes, facilitating training session management, virtual coaching, and performance tracking.

## Features

### For Athletes
- Book training sessions with expert coaches
- Choose between virtual and in-person sessions
- Track session history and progress
- Provide feedback and ratings for completed sessions
- View upcoming sessions and their status
- Confirm session completion and submit feedback
- Receive real-time session status updates

### For Coaches
- Accept or decline training requests
- Manage virtual sessions with Google Meet integration
- Track upcoming and completed sessions
- View new booking requests with notification badges
- Mark sessions as completed
- Emergency session cancellation with reason
- Monitor athlete feedback and ratings

## Tech Stack

### Frontend
- React.js with Vite
- Material-UI for modern UI components
- React Router for navigation
- Context API for state management
- Firebase SDK for authentication and database operations

### Backend Services
- Firebase Authentication for user management
- Firebase Firestore for data storage
- Firebase Cloud Functions for email notifications
- Google Meet integration for virtual sessions

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase account
- Google Cloud account (for Meet integration)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/AthleteTech.git
cd AthleteTech
```

2. Install dependencies
```bash
# Install Frontend dependencies
cd Frontend
npm install

# Install Cloud Functions dependencies
cd ../functions
npm install
```

3. Firebase Setup
- Create a new Firebase project
- Enable Email/Password authentication
- Create a Firestore database
- Update Firebase config in `Frontend/src/config/firebase.js`:

```javascript
export const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

4. Environment Variables
Create a `.env` file in the Frontend directory:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

5. Start the development server
```bash
cd Frontend
npm run dev
```

## Project Structure

```
AthleteTech/
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AthleteDashboard.jsx
│   │   │   ├── CoachDashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── NewSignup.jsx
│   │   │   └── PrivateRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── emailService.js
│   │   ├── config/
│   │   │   └── firebase.js
│   │   ├── theme/
│   │   │   └── theme.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   │   └── assets/
│   └── package.json
├── Backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── bookingController.js
│   │   │   └── userController.js
│   │   ├── models/
│   │   │   ├── Booking.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── bookings.js
│   │   │   └── users.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── validation.js
│   │   ├── utils/
│   │   │   ├── email.js
│   │   │   └── helpers.js
│   │   └── app.js
│   ├── config/
│   │   └── firebase-admin.js
│   └── package.json
├── functions/
│   ├── src/
│   │   ├── auth/
│   │   │   └── onUserCreated.js
│   │   ├── bookings/
│   │   │   ├── onBookingCreated.js
│   │   │   ├── onBookingUpdated.js
│   │   │   └── onBookingCancelled.js
│   │   ├── notifications/
│   │   │   ├── emailTemplates.js
│   │   │   └── sendEmail.js
│   │   └── index.js
│   ├── config/
│   │   └── serviceAccount.json
│   └── package.json
└── README.md
```

## Session Management

### Session States
- **Pending**: Initial state when athlete requests a session
- **Confirmed**: Coach has accepted the booking
- **Pending Completion**: Either coach or athlete has marked as completed
- **Completed**: Both parties have marked the session as complete
- **Cancelled**: Session was cancelled (includes emergency cancellations)

### Session Types
- **In-Person**: Traditional face-to-face training sessions
- **Virtual**: Online sessions conducted via Google Meet

## Test Accounts

### Coach Account
```
Email: coach.test@athletetech.com
Password: Coach@123
```

### Athlete Account
```
Email: athlete.test@athletetech.com
Password: Athlete@123
```

## Key Features Implementation

### Authentication Flow
1. **Signup Process**
   - Multi-step registration form
   - Account type selection (Coach/Athlete)
   - Email verification
   - Welcome email notification

2. **Login Process**
   - Role-based authentication
   - Protected routes
   - Persistent session management

### Dashboard Features
1. **Coach Dashboard**
   - New booking requests section
   - Upcoming sessions management
   - Session completion workflow
   - Virtual session link management
   - Emergency cancellation capability

2. **Athlete Dashboard**
   - Session booking interface
   - Session status tracking
   - Feedback and rating system
   - Virtual session access
   - Session history view

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add YourFeature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, please create an issue in the repository or contact support@athletetech.com. 