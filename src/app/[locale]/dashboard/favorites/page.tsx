'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Favorite, Property } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { FavoritesGrid } from '@/components/properties/FavoritesGrid';
import { Button } from "@/components/ui/button";

export default function MyFavoritesPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const favoritesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, `users/${user.uid}/favorites`);
  }, [firestore, user]);

  const { data: favorites, isLoading: areFavoritesLoading } = useCollection<Favorite>(favoritesQuery);

  const isLoading = isUserLoading || areFavoritesLoading;

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline">My Favorites</h1>
        <p className="text-muted-foreground">Your saved properties for future stays.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Favorite Properties</CardTitle>
          <CardDescription>All the properties you've saved.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && !favorites ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-60 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                ))}
            </div>
          ) : favorites && firestore ? (
            <FavoritesGrid favorites={favorites} />
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
