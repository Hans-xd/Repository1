import firebase from "firebase/app";
import "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "actividad-b0284.firebaseapp.com",
  projectId: "actividad-b0284",
  storageBucket: "actividad-b0284.appspot.com",
  messagingSenderId: "52011526430",
  appId: "1:52011526430:web:4d8a4a71c9cd0279f6810f",
  measurementId: "G-B6VRVXDG8T"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  