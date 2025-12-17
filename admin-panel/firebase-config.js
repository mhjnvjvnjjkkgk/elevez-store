
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCCrE4ikRxLf2fF6ujdhwOcKGfuGRnMBMw",
  authDomain: "elevez-ed97f.firebaseapp.com",
  projectId: "elevez-ed97f",
  storageBucket: "elevez-ed97f.firebasestorage.app",
  messagingSenderId: "440636781018",
  appId: "1:440636781018:web:24d9b6d31d5aee537850e3",
  measurementId: "G-1H0YRD521H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('🔥 Firebase Initialized for Admin Panel');

export { db, app };
