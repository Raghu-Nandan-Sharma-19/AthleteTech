# AthleteTech

AthleteTech is a modern web application designed to connect coaches and athletes, providing a platform for training management, performance tracking, and communication.

## Features

- **Dual User System**
  - Coach Portal
  - Athlete Portal
- **Authentication System**
  - Secure login/signup
  - Role-based access control
  - Protected routes
- **Modern UI/UX**
  - Material-UI components
  - Responsive design
  - Clean and intuitive interface

## Tech Stack

- **Frontend**
  - React.js
  - Vite
  - Material-UI
  - React Router
  - Firebase Authentication
  - Firebase Firestore

- **Backend**
  - Node.js
  - Express.js
  - MongoDB
  - Firebase

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account
- MongoDB installed locally or MongoDB Atlas account

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/AthleteTech.git
cd AthleteTech
```

### 2. Install Dependencies

```bash
# Install Frontend dependencies
cd Frontend
npm install

# Install Backend dependencies
cd ../Backend
npm install
```

### 3. Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Email/Password authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password provider
3. Create a Firestore database:
   - Go to Firestore Database
   - Create database in test mode
4. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll down to "Your apps"
   - Click the web icon (</>)
   - Register app and copy the config
5. Update the Firebase config in `Frontend/src/config/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

### 4. Environment Variables

Create a `.env` file in the Backend directory:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/athleteTech
```

### 5. Start the Application

```bash
# Start Frontend (from Frontend directory)
npm run dev

# Start Backend (from Backend directory)
npm start
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## How to Sign Up

1. **Access the Signup Page**
   - Navigate to http://localhost:5173/signup
   - You'll see a multi-step signup form

2. **Step 1: Account Type & Credentials**
   - Choose between Coach or Athlete
   - Enter your email address
   - Create a strong password
   - Confirm your password

3. **Step 2: Basic Information**
   - Enter your first name
   - Enter your last name
   - Provide your age
   - Select your gender

4. **Step 3: Sport Details**
   - Select your primary sport
   - Choose your experience level
   - Describe your training goals

5. **Complete Registration**
   - Review your information
   - Click "Sign Up" to create your account
   - You'll be redirected to your dashboard

## Test Credentials

### Coach Accounts

```
1. Football Coach
Email: coach.test@athletetech.com
Password: Coach@123

Profile:
- First Name: John
- Last Name: Smith
- Age: 35
- Gender: Male
- Sport: Football
- Experience: Professional
- Goals: Train professional athletes and develop winning strategies

2. Basketball Coach
Email: basketball.coach@athletetech.com
Password: Coach@123

Profile:
- First Name: Michael
- Last Name: Brown
- Age: 40
- Gender: Male
- Sport: Basketball
- Experience: Professional
- Goals: Develop elite basketball players and championship teams

3. Tennis Coach
Email: tennis.coach@athletetech.com
Password: Coach@123

Profile:
- First Name: Emma
- Last Name: Wilson
- Age: 32
- Gender: Female
- Sport: Tennis
- Experience: Advanced
- Goals: Train junior players and prepare them for professional tournaments
```

### Athlete Accounts

```
1. Swimming Athlete
Email: athlete.test@athletetech.com
Password: Athlete@123

Profile:
- First Name: Sarah
- Last Name: Johnson
- Age: 22
- Gender: Female
- Sport: Swimming
- Experience: Advanced
- Goals: Improve performance and qualify for national championships

2. Track Athlete
Email: track.athlete@athletetech.com
Password: Athlete@123

Profile:
- First Name: David
- Last Name: Lee
- Age: 19
- Gender: Male
- Sport: Athletics
- Experience: Intermediate
- Goals: Improve sprint times and qualify for regional championships

3. Basketball Player
Email: basketball.player@athletetech.com
Password: Athlete@123

Profile:
- First Name: Lisa
- Last Name: Chen
- Age: 21
- Gender: Female
- Sport: Basketball
- Experience: Advanced
- Goals: Enhance shooting accuracy and team leadership skills
```

### Important Notes

- All test accounts use the same password pattern for simplicity
- These accounts are for testing purposes only
- In production, use strong, unique passwords
- Test accounts may be reset periodically
- Do not store sensitive information in test accounts

## Project Structure

```
AthleteTech/
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── config/
│   │   │   └── firebase.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── Backend/
│   ├── config/
│   │   └── db.js
│   ├── server.js
│   └── package.json
└── README.md
```

## Authentication Flow

1. **User Registration**
   - Users can register as either a coach or an athlete
   - Email and password are required
   - User type is stored in Firestore

2. **User Login**
   - Separate login flows for coaches and athletes
   - JWT-based authentication
   - Protected routes based on user type

3. **Session Management**
   - Persistent authentication state
   - Automatic session recovery
   - Secure logout functionality

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@athletetech.com or create an issue in the repository.

## Acknowledgments

- Material-UI for the component library
- Firebase for authentication and database
- MongoDB for data storage 