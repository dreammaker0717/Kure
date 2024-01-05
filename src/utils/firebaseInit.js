// firebaseConfig.js
import firebase from 'firebase/app';
import 'firebase/messaging'; // Import the messaging module

const firebaseConfig = {
  apiKey: "AIzaSyB3dZH1MdsiApb1Ispwgz8-59jqLvELBNc",
  authDomain: "kuredream-eec6d.firebaseapp.com",
  projectId: "kuredream-eec6d",
  storageBucket: "kuredream-eec6d.appspot.com",
  messagingSenderId: "650600989055",
  appId: "1:650600989055:web:cd3bab4e83d902e9351a4a",
  measurementId: "G-GYK1SNP640"
};

// Initialize Firebase
const firebase = firebase.initializeApp(firebaseConfig)
const message = firebaseApp.messaging();
export {message};
