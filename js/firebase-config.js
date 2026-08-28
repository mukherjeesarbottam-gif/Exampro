import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-storage.js";

// Firebase configuration for ExamPro
const firebaseConfig = {
    apiKey: "AIzaSyDkN0F7cC5qmbdZkUx0xLxVAcohA8RStkU",
    authDomain: "exampro-9398b.firebaseapp.com",
    projectId: "exampro-9398b",
    storageBucket: "exampro-9398b.firebasestorage.app",
    messagingSenderId: "393319820258",
    appId: "1:393319820258:web:e380814bb235f3ed9067bb",
    measurementId: "G-NWED7Q4GQW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Cloud Firestore
const db = getFirestore(app);

// Initialize Firebase Storage
const storage = getStorage(app);

console.log("ExamPro Firebase connected successfully!");

export { app, auth, db, storage };