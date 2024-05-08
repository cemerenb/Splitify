// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"
import {getDatabase} from 'firebase/database'
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';


const firebaseConfig = {
  apiKey: "AIzaSyDTGNjpUaQPbjsmCU-7HI9QNfWk2l7EzNY",
  authDomain: "splitify-a6ff8.firebaseapp.com",
  projectId: "splitify-a6ff8",
  storageBucket: "splitify-a6ff8.appspot.com",
  messagingSenderId: "1033232401585",
  appId: "1:1033232401585:android:446d1478b99160f0370e90",
  measurementId: "G-CG4F3751QC"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH =  initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);
export const DATABASE = getDatabase(FIREBASE_APP);