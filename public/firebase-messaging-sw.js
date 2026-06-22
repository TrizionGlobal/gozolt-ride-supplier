importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// In production, these should be dynamically injected or hardcoded.
// For Next.js, public static files don't have access to process.env during runtime unless injected.
// We provide a mechanism to configure this safely.
const firebaseConfig = {
  apiKey: new URL(location).searchParams.get('apiKey'),
  authDomain: new URL(location).searchParams.get('authDomain'),
  projectId: new URL(location).searchParams.get('projectId'),
  storageBucket: new URL(location).searchParams.get('storageBucket'),
  messagingSenderId: new URL(location).searchParams.get('messagingSenderId'),
  appId: new URL(location).searchParams.get('appId'),
};

if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'null') {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: '/logo-icon.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} else {
  console.log('Firebase SW skipped initialization (No valid config injected)');
}
