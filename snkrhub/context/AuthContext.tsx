import { FC, createContext, useContext, useEffect, useState } from 'react';

// Firebase
import firebase from "firebase/auth";
import { auth } from "../firebaseSetup";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";

// Types 
type User = firebase.User | null;
type ContextState = { user: User }

// Create auth context
const AuthContext = createContext<ContextState | undefined>(undefined)

// Use auth function for screens 
export const useAuth = () => {
    return useContext(AuthContext)
}

// Auth provider
export const AuthProvider: FC = ({ children }) => {
    const [user, setUser] = useState<User>(null)
    const [loading, setLoading] = useState(true)
    
    // User functions
    const login = (email: string, password: string) => {
        return signInWithEmailAndPassword(auth, email, password)
    }

    const signUp = (email: string, password: string) => {
        return createUserWithEmailAndPassword(auth, email, password)
    }

    const signOutUser = () => {
        return signOut(auth)
    }

    const getUser = () => {
        return auth.currentUser;
    }

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(setUser);
        setLoading(false)
        return unsubscribe;
    }, [])

    const value = {
    user,
    getUser,
    login,
    signOutUser,
    signUp,
    loading
  }

    return (
        <AuthContext.Provider
            value={value}
        >
            {children}
        </AuthContext.Provider>
    )
}