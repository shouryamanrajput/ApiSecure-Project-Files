// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration from environment variables
// Falls back to hardcoded values for development/demo
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDly9jR8r6a_8-eIRaZp-LQgz3vqM3OugM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "blist-e54cb.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "blist-e54cb",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "blist-e54cb.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "343242160126",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:343242160126:web:c51b964ad6ae9bc5c672af",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-JFQNG2H3EQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

// Set persistence to LOCAL - keeps user logged in even after browser is closed
// This is the "Remember Me" functionality
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("✅ Auth persistence set to LOCAL - user will stay logged in");
  })
  .catch((error) => {
    console.error("❌ Error setting auth persistence:", error);
  });

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/gmail.send');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Export initialized services
export { app, auth, db, googleProvider };

