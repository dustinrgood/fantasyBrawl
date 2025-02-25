import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Check if Firebase credentials are available
const hasFirebaseCredentials = 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN && 
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// Create a mock implementation for development without Firebase
const createMockFirebase = () => {
  console.warn('Firebase credentials not found or invalid. Using mock implementation.');
  
  // Mock auth
  const mockAuth = {
    currentUser: null,
    onAuthStateChanged: (callback: any) => {
      callback(null);
      return () => {};
    },
    signInWithPopup: async () => {
      console.warn('Mock auth: signInWithPopup called');
      return { user: null };
    },
    signOut: async () => {
      console.warn('Mock auth: signOut called');
    }
  };
  
  // Mock db
  const mockDb = {};
  
  // Mock storage
  const mockStorage = {};
  
  return { app: null, auth: mockAuth, db: mockDb, storage: mockStorage };
};

let app: any;
let auth: any;
let db: any;
let storage: any;

// Only initialize Firebase if credentials are available
if (hasFirebaseCredentials) {
  try {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    console.log('Initializing Firebase with config:', {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '***' : undefined,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '***' : undefined,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '***' : undefined,
    });

    // Initialize Firebase
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    // Fall back to mock implementation on error
    const mockFirebase = createMockFirebase();
    app = mockFirebase.app;
    auth = mockFirebase.auth;
    db = mockFirebase.db;
    storage = mockFirebase.storage;
  }
} else {
  // Use mock implementation
  console.warn('Firebase credentials missing. Check your .env.local file.');
  const mockFirebase = createMockFirebase();
  app = mockFirebase.app;
  auth = mockFirebase.auth;
  db = mockFirebase.db;
  storage = mockFirebase.storage;
}

export { app, auth, db, storage };
