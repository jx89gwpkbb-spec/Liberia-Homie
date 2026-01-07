
'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, onSnapshot, setDoc, deleteDoc, serverTimestamp, collection, getDocs, query, limit } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { Property } from '@/lib/types';
import { properties as staticProperties } from '@/lib/data';

type FavoriteButtonProps = {
  propertyId: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
};

// Caches for offline data
const CACHE_NAME = 'favorited-properties-v1';

async function cacheFavoritedProperty(property: Property) {
  if ('caches' in window) {
    try {
      const cache = await caches.open(CACHE_NAME);
      const imageUrls = property.images.map(url => new Request(url, { mode: 'no-cors' }));
      await cache.addAll(imageUrls);
      await cache.put(`/api/properties/${property.id}`, new Response(JSON.stringify(property)));
    } catch (error) {
      console.error('Failed to cache property:', error);
    }
  }
}

async function removePropertyFromCache(propertyId: string) {
    if ('caches' in window) {
        try {
            const cache = await caches.open(CACHE_NAME);
            const property = staticProperties.find(p => p.id === propertyId);
            if (property) {
                // We must also remove images from cache
                 for (const imageUrl of property.images) {
                    await cache.delete(imageUrl);
                }
            }
            await cache.delete(`/api/properties/${propertyId}`);
        } catch(error) {
            console.error("Failed to remove from cache:", error);
        }
    }
}


export function FavoriteButton({ propertyId, size = 'default' }: FavoriteButtonProps) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const favoriteRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `users/${user.uid}/favorites`, propertyId);
  }, [firestore, user, propertyId]);

  useEffect(() => {
    if (!favoriteRef) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = onSnapshot(favoriteRef, (doc) => {
      setIsFavorited(doc.exists());
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [favoriteRef]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isUserLoading) return;

    if (!user || !firestore || !favoriteRef) {
      toast({
        title: 'Please log in',
        description: 'You need to be logged in to save favorites.',
        action: <Button onClick={() => router.push('/login')}>Login</Button>,
      });
      return;
    }

    setIsLoading(true);

    const property = staticProperties.find(p => p.id === propertyId);

    try {
      if (isFavorited) {
        await deleteDoc(favoriteRef);
        if (property) await removePropertyFromCache(propertyId);
        toast({ title: 'Removed from favorites.' });
      } else {
        const favoritesCollection = collection(firestore, `users/${user.uid}/favorites`);
        const q = query(favoritesCollection, limit(1));
        const snapshot = await getDocs(q);

        await setDoc(favoriteRef, {
          propertyId,
          createdAt: serverTimestamp(),
        });
        
        if (property) await cacheFavoritedProperty(property);

        if (snapshot.empty) {
          toast({ title: 'Congrats on your first saved property! 🎉' });
        } else {
          toast({ title: 'Added to favorites!' });
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: 'Something went wrong',
        description: 'Could not update your favorites. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size={size === 'lg' ? 'icon' : 'sm'}
      className={cn(
        "rounded-full p-2 h-auto w-auto bg-black/30 hover:bg-black/50 backdrop-blur-sm",
        size === 'lg' && 'h-12 w-12',
      )}
      onClick={toggleFavorite}
      disabled={isLoading || isUserLoading}
      aria-label="Toggle Favorite"
    >
      <Heart
        className={cn(
          "h-5 w-5 text-white transition-all",
          isFavorited && "fill-red-500 text-red-500",
          size === 'lg' && 'h-6 w-6'
        )}
      />
    </Button>
  );
}
