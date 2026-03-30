import admin from 'firebase-admin';
import firebaseConfig from '../firebase-applet-config.json';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
    // In this environment, we don't have a service account key file,
    // but we can often use default credentials if running in Cloud Run.
    // However, for local dev or if credentials are not available,
    // we might need to provide them.
    // For now, we'll try to initialize with just the project ID.
  });
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export const adminStorage = admin.storage();
