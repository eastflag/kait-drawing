// Import the functions you need from the SDKs you need
import { FirebaseApp, initializeApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA2qRh3g-2X1VY-ANnVV7hnsy7jL37HmQI",
  authDomain: "kait-drawing.firebaseapp.com",
  projectId: "kait-drawing",
  storageBucket: "kait-drawing.appspot.com",
  messagingSenderId: "297121992102",
  appId: "1:297121992102:web:d5b86460ae8c5a3feb5367",
  measurementId: "G-CN6KZ01K22"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
// const auth = app.auth();
// const firestore = firebase.firestore();
// const messaging = app.messaging();
