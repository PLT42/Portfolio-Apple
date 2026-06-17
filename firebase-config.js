import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-analytics.js";

// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB5xxbZTTExC8Bg-Utlmyui7s_P2MGLGFY",
    authDomain: "portfolio-29737.firebaseapp.com",
    databaseURL: "https://portfolio-29737-default-rtdb.firebaseio.com",
    projectId: "portfolio-29737",
    storageBucket: "portfolio-29737.firebasestorage.app",
    messagingSenderId: "541954076701",
    appId: "1:541954076701:web:f7aa3dbeb563c34ba996f4",
    measurementId: "G-6SDFFHDTCE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

console.log("Firebase Analytics Initialized");
