
'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, onSnapshot, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

type FavoriteButtonProps = {
  propertyId: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
};

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

    try {
      if (isFavorited) {
        await deleteDoc(favoriteRef);
        toast({ title: 'Removed from favorites.' });
      } else {
        await setDoc(favoriteRef, {
          propertyId,
          createdAt: serverTimestamp(),
        });
        toast({ title: 'Added to favorites!' });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: 'Something went wrong',
        description: 'Could not update your favorites. Please try again.',
        variant: 'destructive',
      });
    } finally {
      // The onSnapshot listener will handle the final state update,
      // so we don't need to manually set isFavorited here.
      // We just need to stop the local loading indicator.
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

    