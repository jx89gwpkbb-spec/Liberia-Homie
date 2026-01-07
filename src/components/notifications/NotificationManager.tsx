'use client';

import { useEffect } from 'react';
import { getMessaging, getToken } from 'firebase/messaging';
import { useFirebaseApp } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

export function NotificationManager() {
  const firebaseApp = useFirebaseApp();
  const { toast } = useToast();

  useEffect(() => {
    const requestPermission = async () => {
      if (!('Notification' in window) || !firebaseApp) {
        console.log('This browser does not support desktop notification or Firebase is not initialized.');
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        try {
          const messaging = getMessaging(firebaseApp);
          // NOTE: You need a firebase-messaging-sw.js file in your public directory
          // for this to work and to receive background notifications.
          // VAPID key is passed for web push authentication. You can generate one in Firebase Console.
          const currentToken = await getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY_FROM_FIREBASE_CONSOLE' });
          if (currentToken) {
            console.log('FCM Token:', currentToken);
            // TODO: Send this token to your server to send targeted notifications.
          } else {
            console.log('No registration token available. Request permission to generate one.');
          }
        } catch (err) {
          console.error('An error occurred while retrieving token. ', err);
          // This can happen if the VAPID key is missing or incorrect.
           toast({
            title: 'Could not get notification token',
            description: 'Please ensure your VAPID key is set up in the Firebase console and in the code.',
            variant: 'destructive',
          });
        }
      } else {
        console.log('Unable to get permission to notify.');
      }
    };

    // We only want to ask for permission once, maybe after a user action.
    // For this demo, we'll ask on first load if not already granted/denied.
    if ('Notification' in window && Notification.permission === 'default') {
      // You might want to tie this to a button click for better UX
      // e.g. "Enable Notifications"
       setTimeout(requestPermission, 5000); // Delaying the request a bit
    }

  }, [firebaseApp, toast]);

  return null; // This component doesn't render anything.
}
