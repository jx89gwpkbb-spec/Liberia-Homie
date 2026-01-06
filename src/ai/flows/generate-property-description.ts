'use server';

/**
 * @fileOverview A property description generator AI agent.
 *
 * - generatePropertyDescription - A function that handles the generation of property descriptions.
 * - GeneratePropertyDescriptionInput - The input type for the generatePropertyDescription function.
 * - GeneratePropertyDescriptionOutput - The return type for the generatePropertyDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePropertyDescriptionInputSchema = z.object({
  keyFeatures: z
    .string()
    .describe("Key features and amenities of the property, separated by commas."),
  propertyType: z.string().describe("The type of property (e.g., house, apartment, condo)."),
  location: z.string().describe("The location of the property."),
  price: z.number().describe("The price of the property."),
  stayDuration: z.enum(['long', 'short']).describe("The duration of stay (long or short)."),
});
export type GeneratePropertyDescriptionInput = z.infer<typeof GeneratePropertyDescriptionInputSchema>;

const GeneratePropertyDescriptionOutputSchema = z.object({
  description: z.string().describe("A compelling description of the property."),
});
export type GeneratePropertyDescriptionOutput = z.infer<typeof GeneratePropertyDescriptionOutputSchema>;

export async function generatePropertyDescription(input: GeneratePropertyDescriptionInput): Promise<GeneratePropertyDescriptionOutput> {
  return generatePropertyDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePropertyDescriptionPrompt',
  input: {schema: GeneratePropertyDescriptionInputSchema},
  output: {schema: GeneratePropertyDescriptionOutputSchema},
  prompt: `You are an expert property description writer. Generate a compelling and engaging property description based on the following information:

Property Type: {{propertyType}}
Location: {{location}}
Price: {{price}}
Stay Duration: {{stayDuration}}
Key Features: {{keyFeatures}}

Write a description that highlights the best aspects of the property and makes it appealing to potential renters.`,
});

const generatePropertyDescriptionFlow = ai.defineFlow(
  {
    name: 'generatePropertyDescriptionFlow',
    inputSchema: GeneratePropertyDescriptionInputSchema,
    outputSchema: GeneratePropertyDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
