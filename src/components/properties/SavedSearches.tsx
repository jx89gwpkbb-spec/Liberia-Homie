"use client";

import { useUser, useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { SavedSearch } from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function SavedSearches() {
    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const pathname = usePathname();
    const { toast } = useToast();

    const savedSearchesQuery = useMemoFirebase(() => {
        if (!user || !firestore || !user.emailVerified) return null;
        return collection(firestore, `users/${user.uid}/savedSearches`);
    }, [user, firestore]);

    const { data: savedSearches, isLoading } = useCollection<SavedSearch>(savedSearchesQuery);

    const applySearch = (search: SavedSearch) => {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(search.filters)) {
            if (Array.isArray(value)) {
                value.forEach(v => params.append(key, v));
            } else if (value !== undefined) {
                params.set(key, String(value));
            }
        }
        router.push(`${pathname}?${params.toString()}`);
    };
    
    const handleDelete = (searchId: string) => {
        if (!user || !firestore) return;
        const searchRef = doc(firestore, `users/${user.uid}/savedSearches`, searchId);
        deleteDocumentNonBlocking(searchRef);
        toast({ title: "Search Deleted", description: "The saved search has been removed." });
    };

    return (
        <div className="space-y-4">
            <h3 className="text-base font-semibold">Saved Searches</h3>
            {isLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-full" />
                </div>
            ) : savedSearches && savedSearches.length > 0 ? (
                <div className="space-y-2">
                    {savedSearches.map(search => (
                        <div key={search.id} className="flex items-center justify-between gap-2 group">
                             <Button variant="ghost" className="flex-1 justify-start" onClick={() => applySearch(search)}>
                                <Search className="mr-2 h-4 w-4" />
                                <span className="truncate">{search.name}</span>
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-50 group-hover:opacity-100">
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete this search?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently delete your saved search "{search.name}". This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(search.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">You have no saved searches.</p>
            )}
        </div>
    );
}
