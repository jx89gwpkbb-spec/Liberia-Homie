
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
import { useUser, useFirestore, addDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Loader2, Upload, X, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import type { Property } from "@/lib/types";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";

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
    petFriendly: z.boolean().default(false),
    // Images and GPS are not part of the Zod schema as we handle them separately
});

type PropertyFormData = z.infer<typeof propertySchema>;

type PropertyFormProps = {
    property?: Property;
};

// Helper function to upload files and get URLs
async function uploadImages(userId: string, propertyId: string, files: File[]): Promise<string[]> {
    const storage = getStorage();
    const urls: string[] = [];

    for (const file of files) {
        const filePath = `properties/${userId}/${propertyId}/${file.name}`;
        const storageRef = ref(storage, filePath);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        urls.push(url);
    }
    return urls;
}


export function PropertyForm({ property }: PropertyFormProps) {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    
    const isEditMode = !!property;
    
    const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
    const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const [gpsCoords, setGpsCoords] = useState<{ lat: number, lng: number } | null>(null);
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);

    const { register, handleSubmit, control, formState: { errors }, getValues, setValue, reset } = useForm<PropertyFormData>({
        resolver: zodResolver(propertySchema),
        defaultValues: {
            name: '',
            location: '',
            price: '',
            propertyType: "House",
            stayDuration: "short",
            keyFeatures: '',
            description: '',
            bedrooms: '',
            bathrooms: '',
            maxGuests: '',
            petFriendly: false,
        }
    });

    useEffect(() => {
        if (isEditMode && property) {
            reset({
                name: property.name,
                location: property.location,
                price: property.pricePerNight.toString(),
                propertyType: property.propertyType,
                stayDuration: property.longStay ? 'long' : 'short',
                keyFeatures: property.amenities.join(', '),
                description: property.description,
                bedrooms: property.bedrooms.toString(),
                bathrooms: property.bathrooms.toString(),
                maxGuests: property.maxGuests.toString(),
                petFriendly: property.petFriendly || false,
            });
            const imageUrls = property.images || [];
            setExistingImageUrls(imageUrls);
            setPreviewUrls(imageUrls);
            if (property.gps) {
                setGpsCoords(property.gps);
            }
        }
    }, [property, isEditMode, reset]);


    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setNewImageFiles(prev => [...prev, ...files]);

            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newPreviews]);
        }
    };
    
    const removeImage = (index: number) => {
        const removedUrl = previewUrls[index];
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));

        const existingIndex = existingImageUrls.indexOf(removedUrl);
        if (existingIndex > -1) {
            setExistingImageUrls(prev => prev.filter(url => url !== removedUrl));
        } else {
            let newFileIndex = -1;
            let fileCounter = 0;
            for(let i = 0; i < previewUrls.length; i++) {
                if(!existingImageUrls.includes(previewUrls[i])) {
                    if (i === index) {
                        newFileIndex = fileCounter;
                        break;
                    }
                    fileCounter++;
                }
            }
            if (newFileIndex > -1) {
                 setNewImageFiles(prev => prev.filter((_, i) => i !== newFileIndex));
            }
        }
    };

    const handleFetchLocation = () => {
        if (!navigator.geolocation) {
            toast({
                title: "Geolocation Not Supported",
                description: "Your browser does not support geolocation.",
                variant: "destructive",
            });
            return;
        }

        setIsFetchingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setGpsCoords({ lat: latitude, lng: longitude });
                setIsFetchingLocation(false);
                toast({
                    title: "Location Fetched",
                    description: "GPS coordinates have been set.",
                });
            },
            (error) => {
                setIsFetchingLocation(false);
                toast({
                    title: "Location Error",
                    description: error.message,
                    variant: "destructive",
                });
            }
        );
    };

    const onSubmit = async (data: PropertyFormData) => {
        if (!user || !firestore) {
            toast({ title: "Error", description: "You must be logged in to modify a property.", variant: "destructive" });
            return;
        }
        if (previewUrls.length === 0) {
            toast({ title: "Error", description: "You must upload at least one image.", variant: "destructive" });
            return;
        }

        setIsSaving(true);
        try {
            const propertyId = property?.id || doc(collection(firestore, 'properties')).id;
            let uploadedUrls: string[] = [];

            if (newImageFiles.length > 0) {
                uploadedUrls = await uploadImages(user.uid, propertyId, newImageFiles);
            }
            
            const finalImageUrls = [...existingImageUrls, ...uploadedUrls];


            const propertyData = {
                id: propertyId,
                name: data.name,
                location: data.location,
                pricePerNight: parseFloat(data.price),
                bedrooms: parseInt(data.bedrooms, 10),
                bathrooms: parseInt(data.bathrooms, 10),
                maxGuests: parseInt(data.maxGuests, 10),
                longStay: data.stayDuration === 'long',
                amenities: data.keyFeatures.split(',').map(s => s.trim()),
                description: data.description,
                propertyType: data.propertyType,
                images: finalImageUrls,
                petFriendly: data.petFriendly,
                owner: property?.owner || {
                    id: user.uid,
                    name: user.displayName || 'Anonymous',
                    avatar: user.photoURL || `https://picsum.photos/seed/${user.uid}/40/40`,
                },
                rating: property?.rating || Math.round((Math.random() * 2 + 3) * 10) / 10,
                reviewCount: property?.reviewCount || Math.floor(Math.random() * 100),
                gps: gpsCoords,
                status: property?.status || 'pending',
            };

            const propertyRef = doc(firestore, 'properties', propertyId);

            if (isEditMode) {
                setDocumentNonBlocking(propertyRef, propertyData, { merge: true });
                 toast({
                    title: "Property Updated!",
                    description: `${data.name} has been updated successfully.`,
                });
            } else {
                setDocumentNonBlocking(propertyRef, propertyData, { merge: false });
                toast({
                    title: "Property Submitted!",
                    description: `${data.name} has been submitted for review.`,
                });
            }
            
            router.push('/dashboard/properties');

        } catch (error) {
            console.error("Error saving property:", error);
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
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                <Select onValueChange={field.onChange} value={field.value}>
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
                    
                    <div className="md:col-span-3 lg:col-span-1 space-y-2">
                        <Label>GPS Location</Label>
                        <div className="flex flex-col gap-2">
                             <Button type="button" variant="outline" onClick={handleFetchLocation} disabled={isFetchingLocation}>
                                {isFetchingLocation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                                Set Location from Device
                            </Button>
                            {gpsCoords && (
                                <p className="text-sm text-muted-foreground text-center">
                                    Lat: {gpsCoords.lat.toFixed(6)}, Lng: {gpsCoords.lng.toFixed(6)}
                                </p>
                            )}
                        </div>
                    </div>


                     <div className="space-y-2 md:col-span-3 flex items-center gap-8">
                        <div className="space-y-2">
                            <Label>Stay Duration</Label>
                            <Controller
                                name="stayDuration"
                                control={control}
                                render={({ field }) => (
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4 pt-2">
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="short" id="short" /><Label htmlFor="short">Short Stay</Label></div>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="long" id="long" /><Label htmlFor="long">Long Stay</Label></div>
                                    </RadioGroup>
                                )}
                            />
                            {errors.stayDuration && <p className="text-destructive text-sm">{errors.stayDuration.message}</p>}
                        </div>
                         <div className="flex items-center space-x-2 pt-6">
                            <Controller
                                name="petFriendly"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        id="petFriendly"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                )}
                            />
                            <Label htmlFor="petFriendly">Pet Friendly</Label>
                        </div>
                    </div>
                    
                    <div className="md:col-span-3 space-y-2">
                        <Label htmlFor="keyFeatures">Key Features (comma-separated)</Label>
                        <Input id="keyFeatures" {...register("keyFeatures")} placeholder="e.g., Private Pool, Ocean View, Gym"/>
                        {errors.keyFeatures && <p className="text-destructive text-sm">{errors.keyFeatures.message}</p>}
                    </div>
                    
                    <div className="md:col-span-3 space-y-2">
                        <Label>Images (up to 5)</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                            {previewUrls.map((src, index) => (
                                <div key={index} className="relative group aspect-video">
                                    <Image src={src} alt={`Preview ${index + 1}`} width={200} height={112} className="w-full h-full object-cover rounded-md" />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                                        onClick={() => removeImage(index)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {previewUrls.length < 5 && (
                                <Label htmlFor="image-upload" className="cursor-pointer aspect-video flex flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/50 hover:bg-muted/50">
                                    <Upload className="h-8 w-8 text-muted-foreground" />
                                    <span className="mt-2 text-sm text-muted-foreground">Upload</span>
                                    <Input id="image-upload" type="file" multiple accept="image/*" className="sr-only" onChange={handleImageChange} />
                                </Label>
                            )}
                        </div>
                    </div>


                    <div className="md:col-span-3 space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="description">Description</Label>
                            <DescriptionGenerator getFormData={getFormDataForAI} onDescriptionGenerated={handleDescriptionGenerated} />
                        </div>
                        <Textarea id="description" {...register("description")} rows={6} />
                        {errors.description && <p className="text-destructive text-sm">{errors.description.message}</p>}
                    </div>
                    <div className="md:col-span-3 text-right">
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditMode ? 'Update Property' : 'Submit for Review'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}

    
