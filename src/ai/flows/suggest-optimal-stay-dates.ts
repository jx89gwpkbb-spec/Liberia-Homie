'use server';

/**
 * @fileOverview This file defines a Genkit flow to suggest optimal stay dates for renters based on typical renter behavior.
 *
 * - suggestOptimalStayDates - An exported function that takes renter preferences and suggests optimal stay dates.
 * - SuggestOptimalStayDatesInput - The input type for the suggestOptimalStayDates function.
 * - SuggestOptimalStayDatesOutput - The output type for the suggestOptimalStayDates function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimalStayDatesInputSchema = z.object({
  location: z.string().describe('The desired location for the stay.'),
  stayDurationPreference: z
    .string()
    .describe(
      'The preferred stay duration (e.g., weekend, week, month).'
    ),
  purposeOfStay: z
    .string()
    .describe('The purpose of the stay (e.g., vacation, business).'),
  budget: z.number().optional().describe('The budget for the stay.'),
});

export type SuggestOptimalStayDatesInput = z.infer<
  typeof SuggestOptimalStayDatesInputSchema
>;

const SuggestOptimalStayDatesOutputSchema = z.object({
  suggestedDates: z
    .array(z.string())
    .describe(
      'A list of suggested start dates for the stay, in ISO 8601 format (YYYY-MM-DD).'
    ),
  reasoning: z
    .string()
    .describe(
      'The AI agents reasoning of why these dates were suggested.'
    ),
});

export type SuggestOptimalStayDatesOutput = z.infer<
  typeof SuggestOptimalStayDatesOutputSchema
>;

export async function suggestOptimalStayDates(
  input: SuggestOptimalStayDatesInput
): Promise<SuggestOptimalStayDatesOutput> {
  return suggestOptimalStayDatesFlow(input);
}

const suggestOptimalStayDatesPrompt = ai.definePrompt({
  name: 'suggestOptimalStayDatesPrompt',
  input: {schema: SuggestOptimalStayDatesInputSchema},
  output: {schema: SuggestOptimalStayDatesOutputSchema},
  prompt: `You are an AI assistant specializing in suggesting optimal stay dates for rental properties.

  Based on the renter's preferences, consider typical renter behavior and seasonality to suggest the best possible stay dates.
  The suggested dates should consider:
  - The location: {{{location}}}
  - The preferred stay duration: {{{stayDurationPreference}}}
  - The purpose of the stay: {{{purposeOfStay}}}
  - The budget: {{{budget}}}

  Reason your date suggestions out loud. 
  Then respond with JSON in the following format:
  {
    "suggestedDates": ["YYYY-MM-DD", "YYYY-MM-DD", ...],
    "reasoning": "The AI agents reasoning of why these dates were suggested."
  }`,
});

const suggestOptimalStayDatesFlow = ai.defineFlow(
  {
    name: 'suggestOptimalStayDatesFlow',
    inputSchema: SuggestOptimalStayDatesInputSchema,
    outputSchema: SuggestOptimalStayDatesOutputSchema,
  },
  async input => {
    const {output} = await suggestOptimalStayDatesPrompt(input);
    return output!;
  }
);
