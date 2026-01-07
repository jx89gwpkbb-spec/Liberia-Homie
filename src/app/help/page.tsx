'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Mail, Phone, LifeBuoy, Loader2, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUser, useFirestore, addDocumentNonBlocking } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function HelpPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: '', email: '', subject: '', message: '' },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.displayName || '',
        email: user.email || '',
        subject: '',
        message: '',
      });
    }
  }, [user, form]);

  const { formState: { isSubmitting } } = form;

  const faqs = [
    {
      question: "How do I book a property?",
      answer: "To book a property, simply navigate to the property's page, select your desired dates on the calendar, choose the number of guests, and click the 'Reserve' button. You'll be guided through a confirmation process."
    },
    {
      question: "What is the cancellation policy?",
      answer: "Cancellation policies vary by property. You can find the specific cancellation policy for a listing in the 'About this place' section on the property details page. For most properties, you can cancel up to 5 days before check-in for a full refund."
    },
    {
      question: "How do I become a vendor and list my property?",
      answer: "During the signup process, choose the 'I want to list my property' option. Once your account is created, you will find an 'Add New' button in your dashboard under 'My Properties' to start creating your listing."
    },
    {
      question: "How are properties verified?",
      answer: "Our admin team reviews every new property submission to ensure it meets our quality and safety standards. Listings only go live after being approved by an administrator."
    },
    {
      question: "How does payment work?",
      answer: "For this demonstration application, no real payment is processed. You can simulate a booking by clicking 'Confirm and Pay' without any financial transaction. In a real-world scenario, we would integrate a secure payment gateway like Stripe or Braintree."
    }
  ];

  const onSubmit = (data: ContactFormData) => {
    if (!firestore) {
      toast({ title: 'Error', description: 'Could not connect to our services.', variant: 'destructive'});
      return;
    }
    
    const ticketsCollection = collection(firestore, 'tickets');
    const newTicket = {
        ...data,
        userId: user?.uid || null,
        status: 'New' as const,
        priority: 'Medium' as const,
        createdAt: serverTimestamp(),
    };
    
    addDocumentNonBlocking(ticketsCollection, newTicket);

    toast({
        title: "Message Sent!",
        description: "Thanks for reaching out. A support ticket has been created and our team will get back to you shortly."
    });
    form.reset();
  };

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold font-headline">Help Center</h1>
            <p className="mt-2 text-lg text-muted-foreground">
                Find answers to your questions or get in touch with our support team.
            </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
            <div className="mb-12 md:mb-0">
                <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                     <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                        <AccordionContent>
                            {faq.answer}
                        </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
            </div>

            <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><LifeBuoy /> Contact Support</CardTitle>
                    <CardDescription>
                      If you can't find an answer, submit a support ticket below.
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" {...form.register('name')} />
                             {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" {...form.register('email')} />
                            {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
                        </div>
                      </div>
                       <div className="space-y-2">
                          <Label htmlFor="subject">Subject</Label>
                          <Input id="subject" {...form.register('subject')} />
                           {form.formState.errors.subject && <p className="text-sm text-destructive">{form.formState.errors.subject.message}</p>}
                      </div>
                       <div className="space-y-2">
                          <Label htmlFor="message">Message</Label>
                          <Textarea id="message" rows={5} {...form.register('message')} />
                           {form.formState.errors.message && <p className="text-sm text-destructive">{form.formState.errors.message.message}</p>}
                      </div>
                    </CardContent>
                    <CardFooter>
                       <Button type="submit" className="w-full" disabled={isSubmitting}>
                         {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                         Submit Ticket
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
}
