import { auth, googleProvider } from '../firebase';
import {
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    sendPasswordResetEmail,
} from 'firebase/auth';

export const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
};

export const registerWithEmail = async (email, password, displayName) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
        await updateProfile(result.user, { displayName });
    }
    return result.user;
};

export const loginWithEmail = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
};

export const sendPasswordReset = async (email) => {
    await sendPasswordResetEmail(auth, email);
};

export const logoutUser = async () => {
    await signOut(auth);
};

export const subscribeToAuthChanges = (callback) => {
    return onAuthStateChanged(auth, callback);
};
