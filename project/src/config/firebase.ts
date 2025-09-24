// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCiV1NRc2py3v9ca9MVob7BYK_hntj2phg",
  authDomain: "bcombuddy-e8708.firebaseapp.com",
  projectId: "bcombuddy-e8708",
  storageBucket: "bcombuddy-e8708.firebasestorage.app",
  messagingSenderId: "775617562806",
  appId: "1:775617562806:web:7840683ea8012d89073e17",
  measurementId: "G-ZWN9V95Y0T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Configure Google Auth Provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
