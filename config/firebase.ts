import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD9ax78ftCmwUXtv8f1yvEfB7Pcm2ptJRA",
  authDomain: "mai-expense-tracker.firebaseapp.com",
  projectId: "mai-expense-tracker",
  storageBucket: "mai-expense-tracker.firebasestorage.app",
  messagingSenderId: "1065330744797",
  appId: "1:1065330744797:web:a2d903da8d7e0734e0aa34",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const firestore = getFirestore(app);