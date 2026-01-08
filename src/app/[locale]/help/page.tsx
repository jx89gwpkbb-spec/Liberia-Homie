'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Mail, Phone, LifeBuoy } from 'lucide-react';
import Link from 'next/link';

const faqs = [
  {
    question: 'How do I book a property?',
    answer:
      'To book a property, simply navigate to the property\'s page, select your desired dates on the calendar, specify the number of guests, and click "Reserve". You will be guided through a confirmation process.',
  },
  {
    question: 'Can I cancel a booking?',
    answer:
      'Yes, you can cancel a booking. Cancellation policies may vary by property. You can view your bookings and the option to cancel from your dashboard under "My Bookings". Please review the cancellation terms before confirming.',
  },
  {
    question: 'How do I list my own property?',
    answer:
      'If you\'ve signed up as a vendor, you can add a new property from your dashboard. Click on "My Properties" and then "Add New". You will be prompted to fill out all the necessary details about your property, including photos, amenities, and pricing.',
  },
  {
    question: 'Is my payment information secure?',
    answer:
      'Homie Liberia uses industry-standard security practices. All transactions are handled through a secure payment gateway, and we do not store your credit card information on our servers.',
  },
  {
    question: 'How do I contact a property owner?',
    answer:
      'Once your booking is confirmed, you will be able to communicate with the property owner through our secure messaging system to coordinate check-in and other details.',
  },
];

export default function HelpPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-headline text-primary">
            Help & Support
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Have questions? We’re here to help. Find answers to common
            questions below or contact our support team.
          </p>
        </div>

        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LifeBuoy /> Contact Support
            </CardTitle>
            <CardDescription>
              If you can't find the answer you're looking for, please don't
              hesitate to reach out to us.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold">Email</h3>
                <a
                  href="mailto:support@homieliberia.com"
                  className="text-muted-foreground hover:text-primary"
                >
                  support@homieliberia.com
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Phone className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold">Phone</h3>
                <p className="text-muted-foreground">(+231) 770-321-127</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground pt-4">
              For account-specific issues, please submit a ticket through your{' '}
              <Link href="/dashboard/support" className="underline hover:text-primary">
                support dashboard
              </Link>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
