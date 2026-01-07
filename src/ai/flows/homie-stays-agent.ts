'use server';
/**
 * @fileOverview A multi-tool agent for Homie Stays that can fetch and cancel bookings.
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
} from 'firebase/firestore';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

// Server-side Firebase initialization
let firestore: ReturnType<typeof getFirestore>;

if (!getApps().length) {
  const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);
  firestore = getFirestore(firebaseApp);
} else {
  firestore = getFirestore();
}


const GetCurrentBookingsInputSchema = z.object({
  userId: z.string().describe('The ID of the user to fetch bookings for.'),
});

const CancelBookingInputSchema = z.object({
  bookingId: z.string().describe('The ID of the booking to cancel.'),
});

/**
 * Genkit Tool: Fetches current bookings for a given user.
 */
const getCurrentBookings = ai.defineTool(
  {
    name: 'getCurrentBookings',
    description: 'Retrieves a list of current and upcoming bookings for a user.',
    inputSchema: GetCurrentBookingsInputSchema,
    outputSchema: z.any(),
  },
  async ({ userId }) => {
    if (!firestore) {
      throw new Error('Firestore is not initialized.');
    }
    const bookings: any[] = [];
    const bookingsRef = collection(firestore, 'bookings');
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
    description: 'Cancels a booking with the given ID.',
    inputSchema: CancelBookingInputSchema,
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  async ({ bookingId }) => {
    if (!firestore) {
      throw new Error('Firestore is not initialized.');
    }
    try {
      const bookingRef = doc(firestore, 'bookings', bookingId);
      await deleteDoc(bookingRef);
      return {
        success: true,
        message: `Successfully canceled booking ${bookingId}.`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to cancel booking: ${error.message}`,
      };
    }
  }
);

const HomieStaysAgentInputSchema = z.object({
  userId: z.string(),
  question: z.string(),
});

export type HomieStaysAgentInput = z.infer<typeof HomieStaysAgentInputSchema>;

export type HomieStaysAgentOutput = {
  answer: string;
};

export async function homieStaysAgent(
  input: HomieStaysAgentInput
): Promise<HomieStaysAgentOutput> {
  const { output } = await homieStaysAgentPrompt(input);
  return { answer: output! };
}

const homieStaysAgentPrompt = ai.definePrompt({
  name: 'homieStaysAgentPrompt',
  input: { schema: HomieStaysAgentInputSchema },
  output: { schema: z.string() },
  tools: [getCurrentBookings, cancelBooking],
  system: `You are Agent231, a friendly and helpful AI support agent for Homie Stays.
You can help users with their bookings, including fetching their booking details and canceling bookings.
The current user's ID is {{userId}}. You must pass this ID to any tool that requires a userId.
If you are asked to cancel a booking and you have the booking ID, use the cancelBooking tool.
If a user asks about their bookings, use the getCurrentBookings tool to fetch them.
For all other questions, answer them concisely and clearly. Maintain a warm and professional tone.

User Question: {{question}}
`,
});
