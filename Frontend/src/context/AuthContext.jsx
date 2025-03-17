import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  async function signup(email, password, userType, additionalDetails = {}) {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Prepare user data
      const userData = {
        email: email.toLowerCase(),
        userType,
        ...additionalDetails,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Store user data in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), userData);

      // Update local state
      setUserType(userType);
      setUserDetails(userData);

      return userCredential;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  async function login(email, password, expectedUserType) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        await signOut(auth);
        throw new Error('User data not found');
      }

      const userData = userDoc.data();

      // Verify if the user is trying to log in with the correct account type
      if (userData.userType !== expectedUserType) {
        await signOut(auth);
        throw new Error('Please use the correct login type for your account');
      }

      // Set user data if verification passes
      setUserType(userData.userType);
      setUserDetails(userData);

      return userCredential;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserType(null);
      setUserDetails(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserType(userData.userType);
            setUserDetails(userData);
          }
          setCurrentUser(user);
        } catch (error) {
          console.error('Auth state change error:', error);
        }
      } else {
        setCurrentUser(null);
        setUserType(null);
        setUserDetails(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userType,
    userDetails,
    signup,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 