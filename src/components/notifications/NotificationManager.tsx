'use client';

import { useEffect } from 'react';
import { getMessagingInstance } from '@/firebase';
import { getToken, Messaging } from 'firebase/messaging';
import { useFirebaseApp, useUser, useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where, doc } from 'firebase/firestore';
import type { Booking } from '@/lib/types';
import { differenceInHours, isToday, format } from 'date-fns';

function showNotification(title: string, body: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
}

export function NotificationManager() {
  const firebaseApp = useFirebaseApp();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const upcomingBookingsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'bookings'),
      where('userId', '==', user.uid),
      where('checkOutDate', '>=', new Date())
    );
  }, [firestore, user]);

  const { data: upcomingBookings } = useCollection<Booking>(upcomingBookingsQuery);

  // Effect for requesting notification permission
  useEffect(() => {
    const requestPermission = async () => {
      if (!firebaseApp) return;
      const messaging = await getMessagingInstance(firebaseApp);
      if (!messaging) {
        console.log('Firebase Messaging is not supported in this browser.');
        return;
      }
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted.');
          const currentToken = await getToken(messaging, { vapidKey: 'BIVYlyICxL9aV54JkvV2c2YxPQRx9gG2nTgP53r-2a-sLhjvOQUgY0a2b9kC7gRDbk1cEWQeYJc_sI6AINx58mU' });
          if (currentToken) {
            console.log('FCM Token:', currentToken);
          } else {
            console.log('No registration token available. Request permission to generate one.');
          }
        } else {
          console.log('Unable to get permission to notify.');
        }
      } catch (err) {
        console.error('An error occurred while retrieving token or requesting permission. ', err);
         toast({
          title: 'Could not get notification token',
          description: 'Please ensure your VAPID key is set up in the Firebase console and in the code.',
          variant: 'destructive',
        });
      }
    };
    if ('Notification' in window && Notification.permission === 'default') {
       setTimeout(requestPermission, 5000);
    }
  }, [firebaseApp, toast]);

  // Effect for sending booking reminders
  useEffect(() => {
    if (!upcomingBookings || !firestore || !user) return;

    const now = new Date();

    upcomingBookings.forEach(booking => {
      const checkInDate = booking.checkInDate.toDate();
      const checkOutDate = booking.checkOutDate.toDate();

      // Check-in reminder (within 24 hours)
      if (differenceInHours(checkInDate, now) <= 24 && differenceInHours(checkInDate, now) > 0 && !booking.reminders?.checkInReminderSent) {
        showNotification(
          'Check-in Reminder',
          `Your check-in for ${booking.propertyName} is tomorrow at ${format(checkInDate, 'p')}.`
        );
        const bookingRef = doc(firestore, `bookings/${booking.id}`);
        setDocumentNonBlocking(bookingRef, { reminders: { checkInReminderSent: true } }, { merge: true });
      }

      // Check-out reminder (day of)
      if (isToday(checkOutDate) && !booking.reminders?.checkOutReminderSent) {
        showNotification(
          'Check-out Reminder',
          `Your check-out for ${booking.propertyName} is today at ${format(checkOutDate, 'p')}.`
        );
        const bookingRef = doc(firestore, `bookings/${booking.id}`);
        setDocumentNonBlocking(bookingRef, { reminders: { checkOutReminderSent: true } }, { merge: true });
      }
    });

  }, [upcomingBookings, firestore, user]);


  return null; // This component doesn't render anything.
}
