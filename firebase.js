// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDorbLfbFKHsu9RThXxwD1x8Rc08uyQCFI",
  authDomain: "admin-lauratek.firebaseapp.com",
  projectId: "admin-lauratek",
  storageBucket: "admin-lauratek.firebasestorage.app",
  messagingSenderId: "853811260716",
  appId: "1:853811260716:web:1b8e47dda6fb1cc4531089",
  measurementId: "G-D5FPJRCBBS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);