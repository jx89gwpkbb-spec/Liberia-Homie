
'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { Favorite, Property } from '@/lib/types';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";

export function FavoritesGrid({ favorites }: { favorites: Favorite[] }) {
  const firestore = useFirestore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      if (!firestore || favorites.length === 0) {
        setProperties([]);
        setIsLoading(false);
        return;
      }
      
      const propertyPromises = favorites.map(fav => {
        const propRef = doc(firestore, 'properties', fav.propertyId);
        return getDoc(propRef);
      });

      const propertyDocs = await Promise.all(propertyPromises);
      const fetchedProperties = propertyDocs
        .filter(doc => doc.exists())
        .map(doc => ({ id: doc.id, ...doc.data() } as Property));
      
      setProperties(fetchedProperties);
      setIsLoading(false);
    };

    fetchProperties();
  }, [favorites, firestore]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-60 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed rounded-lg">
        <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">No Favorites Yet</h2>
        <p className="mt-2 text-muted-foreground">
          Start exploring and save the properties you love.
        </p>
        <Button asChild className="mt-6">
          <Link href="/properties">Explore Properties</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map(property => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
