
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Mail, Phone } from "lucide-react";

export default function HelpPage() {
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

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold font-headline">Help Center</h1>
            <p className="mt-2 text-lg text-muted-foreground">
                Find answers to your questions or get in touch with our support team.
            </p>
        </div>
        
        <div className="mb-12">
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
            <h2 className="text-2xl font-semibold mb-6 text-center">Contact Support</h2>
            <p className="text-muted-foreground text-center mb-8">
                If you can't find the answer you're looking for, please don't hesitate to reach out to us.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                <div className="flex flex-col items-center text-center p-6 border rounded-lg">
                    <Mail className="h-10 w-10 text-primary mb-4" />
                    <h3 className="text-xl font-semibold">Email Us</h3>
                    <p className="text-muted-foreground mt-2">Send us an email and we'll get back to you as soon as possible.</p>
                    <a href="mailto:support@homiestays.com" className="mt-4 text-primary font-semibold hover:underline">
                        support@homiestays.com
                    </a>
                </div>
                 <div className="flex flex-col items-center text-center p-6 border rounded-lg">
                    <Phone className="h-10 w-10 text-primary mb-4" />
                    <h3 className="text-xl font-semibold">Call Us</h3>
                    <p className="text-muted-foreground mt-2">Our support team is available from 9 AM to 5 PM, Mon-Fri.</p>
                    <a href="tel:+1-234-567-890" className="mt-4 text-primary font-semibold hover:underline">
                        +1 (234) 567-890
                    </a>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
