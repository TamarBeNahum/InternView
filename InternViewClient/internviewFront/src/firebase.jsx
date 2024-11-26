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
  apiKey: "AIzaSyAjQ0598ET6NOuxS-iNghaQK_YcNdIgFmo",
  authDomain: "internview-2490e.firebaseapp.com",
  databaseURL: "https://internview-2490e-default-rtdb.firebaseio.com/",
  projectId: "internview-2490e",
  storageBucket: "internview-2490e.appspot.com",
  messagingSenderId: "498153242822",
  appId: "1:498153242822:web:6741a8e440a05bbcb857c7",
  measurementId: "G-7VBVXTEW6R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

export { database };