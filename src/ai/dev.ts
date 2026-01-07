'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-property-description.ts';
import '@/ai/flows/suggest-optimal-stay-dates.ts';
import '@/ai/flows/faq-chatbot.ts';
