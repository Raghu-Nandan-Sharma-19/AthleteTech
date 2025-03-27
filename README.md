# AthleteTech

AthleteTech is a comprehensive platform connecting athletes with professional coaches, featuring AI-powered training assistance and real-time session management.

## Features

- User Authentication (Athletes & Coaches)
- Real-time Session Booking
- Virtual Training Support
- AI Sports Mentor
- Progress Tracking
- Performance Analytics

## Prerequisites

Before you begin, ensure you have installed:
- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/Raghu-Nandan-Sharma-19/AthleteTech.git
cd AthleteTech
```

2. Install dependencies:
```bash
# Install Frontend dependencies
cd Frontend
npm install

# Install Backend dependencies
cd ../Backend
npm install
```

3. Firebase Configuration:

a. Create a Firebase project:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add Project" and follow the setup wizard
   - Enable Authentication, Firestore, and Analytics

b. Get your Firebase configuration:
   - In Firebase Console, go to Project Settings
   - Under "Your apps", click the web icon (</>)
   - Register your app and copy the configuration object

c. Set up environment variables:
   - In the Frontend directory, create a `.env` file
   - Copy the contents from `.env.example`
   - Replace the placeholder values with your Firebase configuration:
     ```
     VITE_FIREBASE_API_KEY=your_api_key_here
     VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
     VITE_FIREBASE_PROJECT_ID=your_project_id_here
     VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
     VITE_FIREBASE_APP_ID=your_app_id_here
     VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
     ```

4. Start the development servers:

```bash
# Start Frontend (from Frontend directory)
npm run dev

# Start Backend (from Backend directory)
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Project Structure

```
AthleteTech/
├── Frontend/           # React frontend application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/    # Context providers
│   │   ├── config/     # Configuration files
│   │   └── services/   # Service integrations
│   └── public/         # Static assets
└── Backend/           # Node.js backend application
    ├── src/
    │   ├── routes/     # API routes
    │   ├── controllers/# Route controllers
    │   └── models/     # Data models
    └── config/        # Backend configuration
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Security

- Never commit your `.env` file
- Don't share your Firebase configuration keys publicly
- Use environment variables for all sensitive information

## License

This project is licensed under the MIT License - see the LICENSE file for details 