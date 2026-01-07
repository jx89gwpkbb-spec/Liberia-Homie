'use client';

import {
  Building,
  Users,
  Calendar,
  Lock,
  Smartphone,
  ChevronRight,
  LifeBuoy,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const features = [
  {
    icon: Building,
    title: 'Housing & Rentals',
    description: 'Find or list apartments, homes, and shared spaces.',
  },
  {
    icon: Users,
    title: 'Local Services',
    description:
      'Connect with professionals offering repairs, tutoring, transport, and more.',
  },
  {
    icon: Calendar,
    title: 'Community Events',
    description:
      'Stay updated on cultural, educational, and social activities near you.',
  },
  {
    icon: Lock,
    title: 'Secure Access',
    description:
      'Built with Firebase authentication and Firestore rules to protect your data.',
  },
  {
    icon: Smartphone,
    title: 'Easy to Use',
    description: 'Simple interface designed for mobile-first users in Liberia.',
  },
];

export default function HelpPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-headline text-primary">
            Welcome to Homie Liberia
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Your trusted digital companion for everyday living in Liberia. We
            connect people, services, and opportunities to help you find what
            you need, when you need it.
          </p>
        </div>

        <Card className="mb-12 shadow-lg">
           <CardHeader>
                <CardTitle className="flex items-center gap-2"><LifeBuoy /> Our Mission</CardTitle>
                <CardDescription>
                Homie Liberia is a community-driven platform designed to connect people, services, and opportunities across Liberia. Whether you’re looking for housing, local services, or community events, Homie Liberia makes it easy to discover and share what matters most in your area.
                </CardDescription>
            </CardHeader>
        </Card>

        <div>
          <h2 className="text-3xl font-semibold text-center mb-8">
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-1 text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-16">
          <h2 className="text-2xl font-semibold">Ready to get started?</h2>
          <p className="text-muted-foreground mt-2">
            Explore listings or create one of your own.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/properties">Explore Properties</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/signup">Join the Community</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
