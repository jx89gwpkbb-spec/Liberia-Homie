"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { DescriptionGenerator } from "./DescriptionGenerator";
import { useUser, useFirestore, addDocumentNonBlocking } from "@/firebase";
import { collection } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { properties } from "@/lib/data"; // For mock images

const propertySchema = z.object({
    name: z.string().min(1, "Name is required"),
    location: z.string().min(1, "Location is required"),
    price: z.string().refine((val) => !isNaN(parseFloat(val)), { message: "Must be a number" }),
    propertyType: z.enum(['House', 'Apartment', 'Condo', 'Villa']),
    stayDuration: z.enum(['long', 'short']),
    keyFeatures: z.string().min(1, "Key features are required"),
    description: z.string().min(1, "Description is required"),
    bedrooms: z.string().refine((val) => !isNaN(parseInt(val, 10)) && parseInt(val, 10) > 0, { message: "Must be a positive number" }),
    bathrooms: z.string().refine((val) => !isNaN(parseInt(val, 10)) && parseInt(val, 10) > 0, { message: "Must be a positive number" }),
    maxGuests: z.string().refine((val) => !isNaN(parseInt(val, 10)) && parseInt(val, 10) > 0, { message: "Must be a positive number" }),
});

type PropertyFormData = z.infer<typeof propertySchema>;

export function PropertyForm() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    const { register, handleSubmit, control, formState: { errors }, getValues, setValue } = useForm<PropertyFormData>({
        resolver: zodResolver(propertySchema),
        defaultValues: {
            propertyType: "House",
            stayDuration: "short",
        }
    });

    const onSubmit = async (data: PropertyFormData) => {
        if (!user || !firestore) {
            toast({ title: "Error", description: "You must be logged in to create a property.", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        try {
            const propertiesCollection = collection(firestore, 'properties');
            const newProperty = {
                ...data,
                pricePerNight: parseFloat(data.price),
                bedrooms: parseInt(data.bedrooms, 10),
                bathrooms: parseInt(data.bathrooms, 10),
                maxGuests: parseInt(data.maxGuests, 10),
                longStay: data.stayDuration === 'long',
                amenities: data.keyFeatures.split(',').map(s => s.trim()),
                owner: {
                    id: user.uid,
                    name: user.displayName || 'Anonymous',
                    avatar: user.photoURL || `https://picsum.photos/seed/${user.uid}/40/40`,
                },
                // Mock data for fields not in form
                rating: Math.random() * 2 + 3, // 3.0 to 5.0
                reviewCount: Math.floor(Math.random() * 100),
                images: [properties[0].images[0], properties[1].images[0], properties[2].images[0]],
            };
            
            delete (newProperty as any).price; // remove original price string
            
            await addDocumentNonBlocking(propertiesCollection, newProperty);
            
            toast({
                title: "Property Added!",
                description: `${data.name} has been listed successfully.`,
            });
            router.push('/dashboard/properties');

        } catch (error) {
            console.error("Error adding property:", error);
            toast({ title: "Error", description: "Failed to save property.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };
    
    const getFormDataForAI = () => {
        return {
            keyFeatures: getValues("keyFeatures"),
            propertyType: getValues("propertyType"),
            location: getValues("location"),
            price: getValues("price"),
            stayDuration: getValues("stayDuration"),
        };
    };
    
    const handleDescriptionGenerated = (description: string) => {
        setValue("description", description);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Property Name</Label>
                        <Input id="name" {...register("name")} />
                        {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" {...register("location")} placeholder="e.g. Austin, Texas"/>
                        {errors.location && <p className="text-destructive text-sm">{errors.location.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="price">Price per Night ($)</Label>
                        <Input id="price" type="text" {...register("price")} />
                        {errors.price && <p className="text-destructive text-sm">{errors.price.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Property Type</Label>
                        <Controller
                            name="propertyType"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="House">House</SelectItem>
                                        <SelectItem value="Apartment">Apartment</SelectItem>
                                        <SelectItem value="Condo">Condo</SelectItem>
                                        <SelectItem value="Villa">Villa</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                         {errors.propertyType && <p className="text-destructive text-sm">{errors.propertyType.message}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="bedrooms">Bedrooms</Label>
                        <Input id="bedrooms" type="number" {...register("bedrooms")} />
                        {errors.bedrooms && <p className="text-destructive text-sm">{errors.bedrooms.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bathrooms">Bathrooms</Label>
                        <Input id="bathrooms" type="number" {...register("bathrooms")} />
                        {errors.bathrooms && <p className="text-destructive text-sm">{errors.bathrooms.message}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="maxGuests">Max Guests</Label>
                        <Input id="maxGuests" type="number" {...register("maxGuests")} />
                        {errors.maxGuests && <p className="text-destructive text-sm">{errors.maxGuests.message}</p>}
                    </div>

                     <div className="space-y-2">
                        <Label>Stay Duration</Label>
                        <Controller
                            name="stayDuration"
                            control={control}
                            render={({ field }) => (
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4 pt-2">
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="short" id="short" /><Label htmlFor="short">Short Stay</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="long" id="long" /><Label htmlFor="long">Long Stay</Label></div>
                                </RadioGroup>
                            )}
                        />
                         {errors.stayDuration && <p className="text-destructive text-sm">{errors.stayDuration.message}</p>}
                    </div>
                    
                    <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="keyFeatures">Key Features (comma-separated)</Label>
                        <Input id="keyFeatures" {...register("keyFeatures")} placeholder="e.g., Private Pool, Ocean View, Gym"/>
                        {errors.keyFeatures && <p className="text-destructive text-sm">{errors.keyFeatures.message}</p>}
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="description">Description</Label>
                            <DescriptionGenerator getFormData={getFormDataForAI} onDescriptionGenerated={handleDescriptionGenerated} />
                        </div>
                        <Textarea id="description" {...register("description")} rows={6} />
                        {errors.description && <p className="text-destructive text-sm">{errors.description.message}</p>}
                    </div>
                    <div className="md:col-span-2 text-right">
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Property
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
