import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '@/firebase'

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch(error) {
        console.error('Error signing in with Goggle', error);
        throw error;
    }
}

export const logOut = async () => {
    try {
        await signOut(auth)
    } catch(error) {
        console.error('Error logging out', error);
        throw error;
    }
}