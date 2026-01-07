
"use client";

import { useState } from 'react';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Bookmark } from 'lucide-react';
import type { ReadonlyURLSearchParams } from 'next/navigation';

type SaveSearchDialogProps = {
    searchParams: ReadonlyURLSearchParams;
};

export function SaveSearchDialog({ searchParams }: SaveSearchDialogProps) {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [searchName, setSearchName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!user || !firestore) {
            toast({ title: "Please log in to save searches.", variant: "destructive" });
            return;
        }
        if (!searchName.trim()) {
            toast({ title: "Please enter a name for your search.", variant: "destructive" });
            return;
        }

        setIsSaving(true);
        try {
            const filters: any = {};
            searchParams.forEach((value, key) => {
                if (key === 'amenities') {
                    filters.amenities = searchParams.getAll('amenities');
                } else if (key === 'price' || key === 'bedrooms') {
                    filters[key] = parseInt(value, 10);
                } else if (key === 'petFriendly') {
                    filters[key] = value === 'true';
                } else {
                    filters[key] = value;
                }
            });

            const savedSearchesCollection = collection(firestore, `users/${user.uid}/savedSearches`);
            const newSearch = {
                name: searchName,
                createdAt: serverTimestamp(),
                filters,
            };

            await addDocumentNonBlocking(savedSearchesCollection, newSearch);

            toast({
                title: "Search Saved!",
                description: `Your search "${searchName}" has been saved.`,
            });
            setIsOpen(false);
            setSearchName('');

        } catch (error) {
            console.error("Failed to save search:", error);
            toast({
                title: "Save Failed",
                description: "Could not save your search. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                    <Bookmark className="mr-2 h-4 w-4" /> Save Search
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Save Your Search</DialogTitle>
                    <DialogDescription>
                        Give this search a name so you can easily find it later.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="search-name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="search-name"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            className="col-span-3"
                            placeholder="e.g. 'Monrovia Beach Houses'"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

    