import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { properties } from "@/lib/data";
import { MapPin, Calendar, Users, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import placeholderImages from '@/lib/placeholder-images.json';
import { useTranslations } from 'next-intl';

export default function Home() {
  const featuredProperties = properties.slice(0, 3);
  const heroImage = placeholderImages.placeholderImages.find(p => p.id === "hero-1");
  const t = useTranslations('Hero');
  const tFeatured = useTranslations('FeaturedProperties');

  return (
    <>
      <section className="relative -mt-16 flex h-[560px] w-full items-center justify-center">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white px-4">
          <h1 className="font-headline text-4xl font-bold md:text-6xl">{t('title')}</h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-200">
            {t('subtitle')}
          </p>
          
          <div className="mt-8 w-full max-w-4xl rounded-full border border-gray-600 bg-white/20 p-2 shadow-lg backdrop-blur-sm">
            <form action="/properties" className="grid grid-cols-1 items-center gap-4 md:grid-cols-12">
              <div className="relative md:col-span-5">
                <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input name="location" placeholder={t('locationPlaceholder')} className="h-12 rounded-full border-0 bg-transparent pl-12 text-white placeholder:text-gray-300 focus:ring-0" />
              </div>
              <div className="relative md:col-span-3">
                <Calendar className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder={t('datesPlaceholder')} className="h-12 rounded-full border-0 bg-transparent pl-12 text-white placeholder:text-gray-300 focus:ring-0" />
              </div>
              <div className="relative md:col-span-3">
                <Users className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder={t('guestsPlaceholder')} className="h-12 rounded-full border-0 bg-transparent pl-12 text-white placeholder:text-gray-300 focus:ring-0" />
              </div>
              <Button type="submit" size="icon" className="h-12 w-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 md:col-span-1">
                <Search className="h-5 w-5" />
                <span className="sr-only">{t('search')}</span>
              </Button>
            </form>
          </div>
        </div>
      </section>

      <section id="featured" className="py-16 sm:py-24">
        <div className="container">
          <h2 className="text-center font-headline text-3xl font-bold tracking-tight sm:text-4xl">{tFeatured('title')}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted-foreground">
            {tFeatured('subtitle')}
          </p>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button asChild size="lg">
              <Link href="/properties">{tFeatured('viewAll')}</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
