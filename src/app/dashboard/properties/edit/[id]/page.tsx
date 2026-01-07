'use client';

import { PropertyForm } from "@/components/properties/PropertyForm";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import type { Property } from "@/lib/types";
import { doc } from "firebase/firestore";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditPropertyPage() {
    const { id } = useParams<{ id: string }>();
    const firestore = useFirestore();

    const propertyRef = useMemoFirebase(() => {
        if (!id || !firestore) return null;
        return doc(firestore, 'properties', id);
    }, [firestore, id]);

    const { data: property, isLoading } = useDoc<Property>(propertyRef);

    if (isLoading) {
        return (
             <div>
                <h1 className="text-3xl font-bold font-headline mb-6">Edit Property</h1>
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-10 w-32 ml-auto" />
                </div>
            </div>
        )
    }

    if (!property) {
        return <div>Property not found.</div>
    }

    return (
        <div>
            <h1 className="text-3xl font-bold font-headline mb-6">Edit Property</h1>
            <PropertyForm property={property} />
        </div>
    );
}

    