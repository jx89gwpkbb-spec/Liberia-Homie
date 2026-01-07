
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
  question: z.string().describe("The user's question."),
});
export type FaqChatbotInput = z.infer<typeof FaqChatbotInputSchema>;

const FaqChatbotOutputSchema = z.object({
  answer: z.string().describe("The chatbot's answer."),
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
  prompt: `You are Agent231, a friendly and helpful AI support agent for Homie Stays, a property rental platform.
  Your goal is to answer user questions about booking, payments, listing properties, and general platform use.
  
  Answer the user's question clearly and concisely. If the question is complex or you don't know the answer,
  politely suggest they visit the Help Center or contact support directly. Maintain a warm, professional, and encouraging tone.

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
