'use server';
/**
 * @fileOverview An AI agent that generates neighborhood insights for a given location.
 *
 * - getNeighborhoodInsights - A function that returns insights about schools, hospitals, crime rates, and commute times.
 * - NeighborhoodInsightsInput - The input type for the getNeighborhoodInsights function.
 * - NeighborhoodInsightsOutput - The return type for the getNeighborhoodInsights function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const NeighborhoodInsightsInputSchema = z.object({
  location: z.string().describe('The city or neighborhood name.'),
});
export type NeighborhoodInsightsInput = z.infer<
  typeof NeighborhoodInsightsInputSchema
>;

const NeighborhoodInsightsOutputSchema = z.object({
  schools: z.array(z.string()).describe('List of nearby schools.'),
  hospitals: z.array(z.string()).describe('List of nearby hospitals.'),
  crimeRate: z
    .string()
    .describe(
      'A brief summary of the area\'s crime rate (e.g., "Low", "Below Average").'
    ),
  commuteTimes: z
    .string()
    .describe('A summary of typical commute times to business districts.'),
  summary: z.string().describe('A general summary of the neighborhood.'),
});
export type NeighborhoodInsightsOutput = z.infer<
  typeof NeighborhoodInsightsOutputSchema
>;

export async function getNeighborhoodInsights(
  input: NeighborhoodInsightsInput
): Promise<NeighborhoodInsightsOutput> {
  return neighborhoodInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'neighborhoodInsightsPrompt',
  input: { schema: NeighborhoodInsightsInputSchema },
  output: { schema: NeighborhoodInsightsOutputSchema },
  prompt: `You are a local expert for cities in Liberia.
  
  Generate plausible, simulated neighborhood insights for the following location: {{{location}}}.
  
  Provide a list of 2-3 fictional but realistic school and hospital names.
  Characterize the crime rate (e.g., Low, Average, High).
  Summarize the typical commute time to a central business area.
  Finally, write a short, encouraging summary of the neighborhood.
  
  This is for a demo application, so the data does not need to be real, but it should sound authentic for a location in Liberia.`,
});

const neighborhoodInsightsFlow = ai.defineFlow(
  {
    name: 'neighborhoodInsightsFlow',
    inputSchema: NeighborhoodInsightsInputSchema,
    outputSchema: NeighborhoodInsightsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
