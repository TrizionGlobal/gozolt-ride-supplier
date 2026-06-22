import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only if config exists and not already initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn('Push messaging is not supported by this browser.');
      return null;
    }

    const messaging = getMessaging(app);
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Register service worker explicitly with config params
      const swUrl = `/firebase-messaging-sw.js?apiKey=${firebaseConfig.apiKey}&authDomain=${firebaseConfig.authDomain}&projectId=${firebaseConfig.projectId}&storageBucket=${firebaseConfig.storageBucket}&messagingSenderId=${firebaseConfig.messagingSenderId}&appId=${firebaseConfig.appId}`;
      const registration = await navigator.serviceWorker.register(swUrl);

      const token = await getToken(messaging, {
        ...(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ? { vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY } : {}),
        serviceWorkerRegistration: registration,
      });
      return token;
    } else {
      console.warn('Notification permission denied by user.');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while requesting notification permission:', error);
    return null;
  }
};

export { app, requestNotificationPermission, onMessage };
