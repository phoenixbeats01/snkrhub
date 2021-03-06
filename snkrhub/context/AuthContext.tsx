import { FC, createContext, useContext, useEffect, useState, SetStateAction } from 'react';

// Firebase
import firebase, { getIdToken } from "firebase/auth";
import { auth } from "../firebaseSetup";
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    sendPasswordResetEmail 
} from "firebase/auth";

// Types 
type User = firebase.User | null;
type ContextState = { 
    loading: boolean,
    user: User,
    signUp: (email: string, password: string) => Promise<firebase.UserCredential>,
    signOutUser: () => Promise<void>,
    signIn: (email: string, password: string) => Promise<firebase.UserCredential>,
    getUser: () => firebase.User | null, 
    forgotPassword: (email: string) => Promise<void>
    getUserToken: () => Promise<string | undefined>
    userToken: string | undefined
}

// Create auth context
const AuthContext = createContext<ContextState | undefined>(undefined)

// Use auth function for screens 
const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error(
            "useFirebaseAuth must be used within a AuthProvider"
        );
    }
    return context;
}

// Auth provider
const AuthProvider: FC = ({ children }) => {
    const [user, setUser] = useState<User>(null)
    const [userToken, setUserToken] = useState<string | undefined>('')
    const [loading, setLoading] = useState(true)
    
    // User functions
    const signUp = async (email: string, password: string) => {       
        return createUserWithEmailAndPassword(auth, email, password)
    }

    const signOutUser = () => {
        return signOut(auth)
    }

    const signIn = (email: string, password: string) => {
        return signInWithEmailAndPassword(auth, email, password)
    }

    const forgotPassword = (email: string) => {
        return sendPasswordResetEmail(auth, email)
    }

    const getUser = () => {
        return auth.currentUser;
    }

    const getUserToken = async() => {
        if(user) {
            const firebaseToken = await getIdToken(user, true)
            return firebaseToken
        }
    }


    useEffect(() => {
        setLoading(true)

        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
                setLoading(false)
            } else {
                setUser(null);
                setLoading(false)
            }
        });

        return unsubscribe;
    }, []);

    const value = {
        user,
        getUser,
        forgotPassword,
        signIn,
        signOutUser,
        signUp,
        loading,
        getUserToken,
        userToken
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export { AuthProvider, useAuth }