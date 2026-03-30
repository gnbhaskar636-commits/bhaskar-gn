import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs, onSnapshot, FirestoreError, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const message = error instanceof Error ? error.message : String(error);
  const isOffline = message.includes('offline');
  
  const errInfo: FirestoreErrorInfo = {
    error: isOffline ? `Firestore is currently offline or unreachable. Please check your internet connection and ensure the database ID '${firebaseConfig.firestoreDatabaseId}' is correct in your Firebase console.` : message,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  
  if (isOffline) {
    console.warn('Firestore is operating in offline mode. Changes will sync when a connection is re-established.');
  }
  
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection to Firestore with a slight delay to allow SDK initialization
async function testConnection() {
  // Wait 2 seconds before testing to allow the SDK to initialize in the iframe
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    // Try to get a document from the server to force a connection
    await getDocFromServer(doc(db, 'metadata', 'connection_test'));
    console.log("Firestore connection established successfully.");
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('the client is offline')) {
        console.error("Firestore Error: The client is offline. This may be due to a network issue or a configuration mismatch with the database ID: ", firebaseConfig.firestoreDatabaseId);
      } else if (error.message.includes('permission-denied')) {
        // Permission denied is actually a good sign - it means we reached the server!
        console.log("Firestore connection verified (Permission Denied is expected for this test path).");
      } else {
        console.error("Firestore Connection Test Error:", error.message);
      }
    }
  }
}
testConnection();
