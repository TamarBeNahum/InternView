// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from 'firebase/database';
import 'firebase/database';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA60QiKH2MjtoIRwGfpFFlISGlQVzu_PIc",
  authDomain: "internviewchat.firebaseapp.com",
  databaseURL: "https://internviewchat-default-rtdb.firebaseio.com",
  projectId: "internviewchat",
  storageBucket: "internviewchat.firebasestorage.app",
  messagingSenderId: "149630678787",
  appId: "1:149630678787:web:8648bf6c77049996ce5b36",
  measurementId: "G-3675VSBLYT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

export { database };