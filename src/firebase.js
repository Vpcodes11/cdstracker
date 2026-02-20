import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBLr3C6u8ebOjBOkZZDPCXveEqwaUHw8WU",
    authDomain: "cds-tracker-app.firebaseapp.com",
    projectId: "cds-tracker-app",
    storageBucket: "cds-tracker-app.firebasestorage.app",
    messagingSenderId: "827101037286",
    appId: "1:827101037286:web:8b73296722ddc3d0a67127",
    measurementId: "G-K1GKCZD425"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
