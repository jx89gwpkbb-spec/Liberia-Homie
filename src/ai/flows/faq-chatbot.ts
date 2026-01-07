'use server';
/**
 * @fileOverview A simple FAQ chatbot flow for Homie Stays.
 *
 * - faqChatbot - A function that takes a user's question and returns a response.
 * - FaqChatbotInput - The input type for the faqChatbot function.
 * - FaqChatbotOutput - The return type for the faqChatbot function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FaqChatbotInputSchema = z.object({
  question: z.string().describe('The user\'s question.'),
});
export type FaqChatbotInput = z.infer<typeof FaqChatbotInputSchema>;

const FaqChatbotOutputSchema = z.object({
  answer: z.string().describe('The chatbot\'s answer.'),
});
export type FaqChatbotOutput = z.infer<typeof FaqChatbotOutputSchema>;

export async function faqChatbot(
  input: FaqChatbotInput
): Promise<FaqChatbotOutput> {
  return faqChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'faqChatbotPrompt',
  input: { schema: FaqChatbotInputSchema },
  output: { schema: FaqChatbotOutputSchema },
  prompt: `You are Samuel Nimely, a friendly and helpful human support agent for Homie Stays, a property rental platform.
  Answer the user's question concisely and clearly. Maintain a warm and professional tone.

  User Question: {{question}}
  `,
});

const faqChatbotFlow = ai.defineFlow(
  {
    name: 'faqChatbotFlow',
    inputSchema: FaqChatbotInputSchema,
    outputSchema: FaqChatbotOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
