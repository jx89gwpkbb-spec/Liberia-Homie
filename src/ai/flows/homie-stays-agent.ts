
'use server';
/**
 * @fileOverview A multi-tool agent for Homie Liberia that can fetch and cancel bookings,
 * and provide information about properties.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  Timestamp,
  addDoc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import type { Property, Booking } from '@/lib/types';

// Server-side Firebase initialization
let firestore: ReturnType<typeof getFirestore>;

if (!getApps().length) {
  const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);
  firestore = getFirestore(firebaseApp);
} else {
  firestore = getFirestore();
}

// Input Schemas for Tools
const GetCurrentBookingsInputSchema = z.object({
  userId: z.string().describe('The ID of the user to fetch bookings for.'),
});

const CancelBookingInputSchema = z.object({
  bookingId: z.string().describe('The ID of the booking to cancel.'),
  userId: z.string().describe('The ID of the user who owns the booking.'),
});

const GetPropertyDetailsInputSchema = z.object({
  propertyName: z.string().describe('The name of the property to fetch details for.'),
});

const CheckAvailabilityInputSchema = z.object({
  propertyId: z.string().describe("The ID of the property to check."),
  checkInDate: z.string().describe("The check-in date in YYYY-MM-DD format."),
  checkOutDate: z.string().describe("The check-out date in YYYY-MM-DD format."),
});

const ScheduleVisitInputSchema = z.object({
  propertyId: z.string().describe("The ID of the property for the visit."),
  userId: z.string().describe("The ID of the user scheduling the visit."),
  visitDate: z.string().describe("The requested date for the visit in YYYY-MM-DD format."),
});


// Tool Definitions
/**
 * Genkit Tool: Fetches current bookings for a given user.
 */
const getCurrentBookings = ai.defineTool(
  {
    name: 'getCurrentBookings',
    description: 'Retrieves a list of current and upcoming bookings for a user. Requires a userId.',
    inputSchema: GetCurrentBookingsInputSchema,
    outputSchema: z.array(z.any()),
  },
  async ({ userId }) => {
    if (!firestore) throw new Error('Firestore is not initialized.');
    
    const bookings: any[] = [];
    // Fetches from the user-specific subcollection for security and efficiency.
    const bookingsRef = collection(firestore, `users/${userId}/bookings`);
    const q = query(bookingsRef, where('userId', '==', userId));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      bookings.push({ id: doc.id, ...doc.data() });
    });
    return bookings;
  }
);

/**
 * Genkit Tool: Cancels a booking by its ID.
 */
const cancelBooking = ai.defineTool(
  {
    name: 'cancelBooking',
    description: 'Cancels a booking with the given ID for a specific user. Requires a bookingId and userId.',
    inputSchema: CancelBookingInputSchema,
    outputSchema: z.object({ success: z.boolean(), message: z.string() }),
  },
  async ({ bookingId, userId }) => {
    if (!firestore) throw new Error('Firestore is not initialized.');

    try {
      // Use a batch to delete from both locations atomically.
      const batch = writeBatch(firestore);

      const globalBookingRef = doc(firestore, 'bookings', bookingId);
      const userBookingRef = doc(firestore, `users/${userId}/bookings`, bookingId);
      
      batch.delete(globalBookingRef);
      batch.delete(userBookingRef);

      await batch.commit();

      return { success: true, message: `Successfully canceled booking ${bookingId}.` };
    } catch (error: any) {
      console.error("Failed to cancel booking", error);
      return { success: false, message: `Failed to cancel booking: ${error.message}` };
    }
  }
);

/**
 * Genkit Tool: Fetches details for a specific property by name.
 */
const getPropertyDetails = ai.defineTool(
  {
    name: 'getPropertyDetails',
    description: 'Retrieves detailed information about a specific property by its name.',
    inputSchema: GetPropertyDetailsInputSchema,
    outputSchema: z.nullable(z.any()),
  },
  async ({ propertyName }) => {
    if (!firestore) throw new Error('Firestore is not initialized.');

    const propertiesRef = collection(firestore, 'properties');
    const q = query(propertiesRef, where('name', '==', propertyName), where('status', '==', 'approved'));
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    const propDoc = querySnapshot.docs[0];
    return { id: propDoc.id, ...propDoc.data() };
  }
);

/**
 * Genkit Tool: Checks if a property is available for a given date range.
 */
const checkAvailability = ai.defineTool(
  {
    name: "checkAvailability",
    description: "Checks if a property is available for booking between two dates.",
    inputSchema: CheckAvailabilityInputSchema,
    outputSchema: z.object({ isAvailable: z.boolean(), reason: z.string() }),
  },
  async ({ propertyId, checkInDate, checkOutDate }) => {
    if (!firestore) throw new Error("Firestore not initialized");

    const start = Timestamp.fromDate(new Date(checkInDate));
    const end = Timestamp.fromDate(new Date(checkOutDate));

    const bookingsRef = collection(firestore, "bookings");
    const q = query(
      bookingsRef,
      where("propertyId", "==", propertyId),
      where("checkOutDate", ">", start)
    );

    const snapshot = await getDocs(q);
    const conflictingBookings = snapshot.docs.filter(doc => {
      const booking = doc.data() as Booking;
      const bookingCheckIn = (booking.checkInDate as any).toDate();
      return bookingCheckIn < end;
    });

    if (conflictingBookings.length > 0) {
      return { isAvailable: false, reason: "The property is already booked for some or all of the selected dates." };
    }
    return { isAvailable: true, reason: "The property is available for the selected dates." };
  }
);

/**
 * Genkit Tool: Schedules a visit to a property.
 */
const scheduleVisit = ai.defineTool(
  {
    name: "scheduleVisit",
    description: "Schedules a visit to a property for a user on a specific date.",
    inputSchema: ScheduleVisitInputSchema,
    outputSchema: z.object({ success: z.boolean(), message: z.string(), visitId: z.string().optional() }),
  },
  async ({ propertyId, userId, visitDate }) => {
    if (!firestore) throw new Error("Firestore not initialized");

    try {
      const visitRequest = {
        propertyId,
        userId,
        visitDate: Timestamp.fromDate(new Date(visitDate)),
        status: "pending",
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(firestore, "visits"), visitRequest);
      return { success: true, message: `Your visit request for ${visitDate} has been submitted. The property owner will confirm shortly.`, visitId: docRef.id };
    } catch (error: any) {
      console.error("Failed to schedule visit", error);
      return { success: false, message: `Sorry, I was unable to schedule the visit. Please try again. Error: ${error.message}` };
    }
  }
);


// Main Agent Flow
const HomieStaysAgentInputSchema = z.object({
  userId: z.string().optional(),
  question: z.string(),
});
export type HomieStaysAgentInput = z.infer<typeof HomieStaysAgentInputSchema>;

export type HomieStaysAgentOutput = {
  answer: string;
};

export async function homieStaysAgent(
  input: HomieStaysAgentInput
): Promise<HomieStaysAgentOutput> {
  const response = await homieStaysAgentPrompt(input);
  return { answer: response.text };
}

const homieStaysAgentPrompt = ai.definePrompt({
  name: 'homieStaysAgentPrompt',
  input: { schema: HomieStaysAgentInputSchema },
  output: { format: 'text' },
  tools: [getCurrentBookings, cancelBooking, getPropertyDetails, checkAvailability, scheduleVisit],
  prompt: `You are Agent231, a friendly and helpful AI support agent for Homie Liberia, a property rental platform.
You can help users with their bookings, answer questions about properties, check availability, and schedule visits.

- If the user is logged in (a userId is provided), you can fetch their bookings, cancel a booking, or schedule a visit for them. The current user's ID is {{userId}}. You MUST pass this ID to any tool that requires a userId.
- When cancelling a booking, you MUST have both the bookingId and the userId.
- If a user asks about a specific property by name, use the 'getPropertyDetails' tool to find information about it.
- If a user asks about availability for a property, you MUST first use 'getPropertyDetails' to get the property's ID, and then use the 'checkAvailability' tool.
- If a user wants to schedule a visit or tour, you MUST first get the property's ID using 'getPropertyDetails' if you don't have it, and then use the 'scheduleVisit' tool. You must have the property ID, user ID, and a date to schedule a visit.
- For all other questions, answer them clearly and concisely based on your general knowledge of a rental platform.
- Maintain a warm, professional, and encouraging tone.

User Question: {{question}}
`,
});
