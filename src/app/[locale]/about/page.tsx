'use client';

import {
  Building,
  Users,
  Lock,
  Smartphone,
  Search,
  Eye,
  Heart,
  Linkedin,
  Mail,
  Instagram,
  Facebook,
  Github,
} from 'lucide-react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import placeholderImages from '@/lib/placeholder-images.json';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Search,
    title: 'Smart Search',
    description: 'Browse listings by location, price, and type of property.',
  },
  {
    icon: Eye,
    title: 'Verified Listings',
    description: 'Transparent details and photos to help you make confident choices.',
  },
  {
    icon: Users,
    title: 'Community Connection',
    description: 'Direct communication between landlords and tenants, reducing middlemen.',
  },
  {
    icon: Lock,
    title: 'Secure Access',
    description: 'Powered by Firebase authentication and Firestore rules to protect your data.',
  },
  {
    icon: Smartphone,
    title: 'Mobile‑First Experience',
    description: 'Designed for easy use on smartphones, so you can search on the go.',
  },
];

export default function AboutPage() {
    const founderImage = placeholderImages.placeholderImages.find(p => p.id === "founder-samuel");

  return (
    <div className="bg-background text-foreground">
      <section className="py-16 md:py-24">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold font-headline text-primary md:text-5xl">
            About Homie Liberia
          </h1>
          <p className="mt-4 text-lg text-muted-foreground md:text-xl">
            A modern renting app built to make finding and managing housing in Liberia simple, secure, and stress‑free. Whether you’re searching for an apartment, a shared room, or a family home, Homie Liberia connects renters and landlords in one trusted digital space.
          </p>
        </div>
      </section>
      
      <section className="py-16 md:py-24 bg-muted">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-semibold text-center mb-12">
            What We Offer
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
      </section>

       <section className="py-16 md:py-24">
        <div className="container mx-auto max-w-4xl text-center">
           <Card className="shadow-lg border-2 border-primary/20 text-left">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Heart className="h-8 w-8 text-primary" />
                        <CardTitle className="text-2xl">Our Mission</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-lg text-muted-foreground">
                        Homie Liberia’s mission is to empower communities by making housing more accessible and reliable. We believe everyone deserves a safe, affordable place to call home, and our app is here to bridge the gap between renters and property owners.
                    </p>
                </CardContent>
            </Card>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted">
         <div className="container mx-auto max-w-5xl">
             <h2 className="text-3xl font-semibold text-center mb-12">
                Founder
            </h2>
            <Card className="overflow-hidden">
                <div className="grid md:grid-cols-3">
                    <div className="md:col-span-1 relative h-80 md:h-full">
                        {founderImage && (
                            <Image 
                                src={founderImage.imageUrl}
                                alt={founderImage.description}
                                fill
                                className="object-cover object-top"
                                data-ai-hint={founderImage.imageHint}
                            />
                        )}
                    </div>
                    <div className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-3xl font-headline">Samuel Nimely</CardTitle>
                            <CardDescription>Founder & CEO of Homie Liberia</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                Homie Liberia was founded by Samuel Nimely, a Liberian student currently studying Information Technology in India. Samuel has a strong passion for computer networking, network security, and cyber law, and brings these skills into building a secure and reliable platform.
                            </p>
                            <p className="text-muted-foreground">
                                Beyond technology, he is also skilled in content creation and media, using creativity to communicate and connect with people. His vision is to combine technical expertise with storytelling to make Homie Liberia not just an app, but a community.
                            </p>
                            <div className="flex items-center flex-wrap gap-4 pt-4">
                                <Button asChild variant="outline">
                                    <Link href="mailto:samuelknimelyjr@gmail.com" target="_blank">
                                        <Mail className="mr-2 h-4 w-4" />
                                        Email
                                    </Link>
                                </Button>
                                 <Button asChild variant="outline">
                                    <Link href="https://www.linkedin.com/in/samuel-nimely-4057222a4" target="_blank">
                                        <Linkedin className="mr-2 h-4 w-4" />
                                        LinkedIn
                                    </Link>
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href="https://github.com/jx89gwpkbb-spec" target="_blank">
                                        <Github className="mr-2 h-4 w-4" />
                                        GitHub
                                    </Link>
                                </Button>
                                 <Button asChild variant="outline">
                                    <Link href="https://www.instagram.com/onelsmusknimely" target="_blank">
                                        <Instagram className="mr-2 h-4 w-4" />
                                        Instagram
                                    </Link>
                                </Button>
                                 <Button asChild variant="outline">
                                    <Link href="https://www.facebook.com/onelsmusnimelyjr?mibextid=wwXIfr&mibextid=wwXIfr" target="_blank">
                                        <Facebook className="mr-2 h-4 w-4" />
                                        Facebook
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </div>
                </div>
            </Card>
         </div>
      </section>
    </div>
  );
}
