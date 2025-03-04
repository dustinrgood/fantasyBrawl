"use client";

import React, { createContext, useEffect, useState } from "react";
import { signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, User } from "firebase/auth";
import { auth } from "../firebase/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if auth has onAuthStateChanged method (it won't if we're using the mock)
    if (auth && typeof auth.onAuthStateChanged === 'function') {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        setUser(user);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // If using mock auth, just set loading to false
      setLoading(false);
      return () => {};
    }
  }, []);

  const signInWithGoogle = async () => {
    // Check if we have real Firebase auth
    if (auth && typeof auth.signInWithPopup === 'function') {
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        console.error("Error signing in with Google", error);
      }
    } else {
      console.warn("Firebase auth is not initialized. Sign in is not available.");
      alert("Firebase is not configured. Please add Firebase credentials to .env.local file.");
    }
  };

  const signOutUser = async () => {
    // Check if we have real Firebase auth
    if (auth && typeof auth.signOut === 'function') {
      try {
        await firebaseSignOut(auth);
      } catch (error) {
        console.error("Error signing out", error);
      }
    } else {
      console.warn("Firebase auth is not initialized. Sign out is not available.");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut: signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
