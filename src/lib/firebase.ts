/// <reference types="vite/client" />

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAnalytics, Analytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCFmLHqP8kWqTZpyenutR93jqFDpOfWh40",
    authDomain: "expensetracker-51a1e.firebaseapp.com",
    projectId: "expensetracker-51a1e",
    storageBucket: "expensetracker-51a1e.firebasestorage.app",
    messagingSenderId: "1012820403873",
    appId: "1:1012820403873:web:7a50083e51dcf6ce0eb2e0",
    measurementId: "G-5PKQCBG5SS"
};


let authInstance: Auth | any = null;
let dbInstance: Firestore | any = null;
let analyticsInstance: Analytics | any = null;
let providerInstance: GoogleAuthProvider | any = null;

try {
    const app = initializeApp(firebaseConfig);

    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
    providerInstance = new GoogleAuthProvider();

    if (typeof window !== "undefined") {
        analyticsInstance = getAnalytics(app);
    }

} catch (error) {
    console.error("Firebase initialization error:", error);
}

export const auth = authInstance as Auth;
export const db = dbInstance as Firestore;
export const googleProvider = providerInstance as GoogleAuthProvider;
export const analytics = analyticsInstance as Analytics;
