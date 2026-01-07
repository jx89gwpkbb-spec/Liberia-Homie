
'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, getDoc, collection } from 'firebase/firestore';
import type { Favorite, Property } from '@/lib/types';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, WifiOff } from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";

const CACHE_NAME = 'favorited-properties-v1';

async function getCachedProperties(favorites: Favorite[]): Promise<Property[]> {
  if (!('caches' in window)) return [];

  const cache = await caches.open(CACHE_NAME);
  const cachedProperties: Property[] = [];
  for (const fav of favorites) {
    const response = await cache.match(`/api/properties/${fav.propertyId}`);
    if (response) {
      cachedProperties.push(await response.json());
    }
  }
  return cachedProperties;
}


export function FavoritesGrid({ favorites }: { favorites: Favorite[] }) {
  const firestore = useFirestore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);


  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      
      if (isOffline) {
          const cachedProps = await getCachedProperties(favorites);
          setProperties(cachedProps);
          setIsLoading(false);
          return;
      }

      if (!firestore || favorites.length === 0) {
        setProperties([]);
        setIsLoading(false);
        return;
      }
      
      try {
        const propertyPromises = favorites.map(fav => {
            const propRef = doc(firestore, 'properties', fav.propertyId);
            return getDoc(propRef);
        });

        const propertyDocs = await Promise.all(propertyPromises);
        const fetchedProperties = propertyDocs
            .filter(doc => doc.exists())
            .map(doc => ({ id: doc.id, ...doc.data() } as Property));
        
        setProperties(fetchedProperties);
      } catch (error) {
          console.error("Firestore fetch failed, trying cache:", error);
          const cachedProps = await getCachedProperties(favorites);
          setProperties(cachedProps);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [favorites, firestore, isOffline]);

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
    const EmptyStateIcon = isOffline ? WifiOff : Heart;
    const title = isOffline ? "You are offline" : "No Favorites Yet";
    const description = isOffline 
        ? "Some of your favorited properties may be available here once you're back online." 
        : "Start exploring and save the properties you love.";

    return (
      <div className="text-center py-16 border-2 border-dashed rounded-lg">
        <EmptyStateIcon className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">{title}</h2>
        <p className="mt-2 text-muted-foreground">
          {description}
        </p>
        {!isOffline && (
            <Button asChild className="mt-6">
                <Link href="/properties">Explore Properties</Link>
            </Button>
        )}
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
