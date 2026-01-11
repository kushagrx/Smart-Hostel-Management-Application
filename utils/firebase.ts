import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache } from 'firebase/firestore';

const extra = (Constants.expoConfig?.extra as any) || {};

const firebaseConfig = {
  apiKey: extra.firebaseApiKey || '',
  authDomain: extra.firebaseAuthDomain || '',
  projectId: extra.firebaseProjectId || '',
  appId: extra.firebaseAppId || '',
};

console.log('Firebase Config:', firebaseConfig);
console.log('Can Init?', !!firebaseConfig.apiKey && !!firebaseConfig.appId);

const canInit = !!firebaseConfig.apiKey && !!firebaseConfig.appId;
const app = getApps().length ? getApps()[0] : (canInit ? initializeApp(firebaseConfig) : null);

let authInstance: any = null;
let dbInstance: ReturnType<typeof getFirestore> | null = null;

if (app) {
  try {
    // Try to initialize with persistence
    authInstance = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  } catch (e: any) {
    // If already initialized (e.g. fast refresh), fallback to getAuth
    console.log('Firebase Auth already initialized, using existing instance.');
    authInstance = getAuth(app);
  }
  dbInstance = initializeFirestore(app, {
    localCache: persistentLocalCache()
  });
}

export function getAuthSafe() {
  return authInstance;
}
export function getDbSafe() {
  return dbInstance;
}
export function isAuthConfigured() {
  return !!authInstance;
}
