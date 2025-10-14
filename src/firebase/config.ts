// src/firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Import Firestore

import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBnN3Jv0RmbzPYTeGRnsfumVnwlaFadum8",
  authDomain: "cuddles-59853.firebaseapp.com",
  projectId: "cuddles-59853",
  storageBucket: "cuddles-59853.firebasestorage.app",
  messagingSenderId: "373068354303",
  appId: "1:373068354303:web:3db5ad400618e48d4d72ca",
  measurementId: "G-QNZM4SQJG9"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // Import and initialize Firestore