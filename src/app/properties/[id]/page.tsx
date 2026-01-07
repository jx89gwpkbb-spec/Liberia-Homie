

import { properties, properties as allProperties } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Star, MapPin, Users, BedDouble, Bath, Wifi, ParkingCircle, Utensils, Wind, Tv, PlayCircle, Clock, PawPrint, Maximize, BadgeCheck, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BookingForm } from "@/components/properties/BookingForm";
import { ReviewSection } from "@/components/properties/ReviewSection";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import placeholderImages from '@/lib/placeholder-images.json';
import { FavoriteButton } from "@/components/properties/FavoriteButton";

const amenityIcons: { [key: string]: React.ElementType } = {
  'WiFi': Wifi,
  'Free Parking': ParkingCircle,
  'Kitchen': Utensils,
  'Air Conditioning': Wind,
  'TV': Tv,
  'Private Pool': () => <span className="text-lg">🏊</span>,
  'Ocean View': () => <span className="text-lg">🌊</span>,
  'Gym': () => <span className="text-lg">🏋️</span>,
  'Hot Tub': () => <span className="text-lg">🛁</span>,
  'Pet Friendly': PawPrint,
};


export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const property = properties.find((p) => p.id === params.id);
  const virtualTourImage = placeholderImages.placeholderImages.find(p => p.id === "virtual-tour-placeholder");

  if (!property) {
    notFound();
  }
  
  const ownerPropertyCount = allProperties.filter(p => p.owner.id === property.owner.id).length;
  const isOwnerVerified = ownerPropertyCount > 1;


  const mainImage = property.images[0];
  const secondaryImages = property.images.slice(1, 3);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-4">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-4xl font-bold font-headline">{property.name}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground">
                <div className="flex items-center">
                    <Star className="h-5 w-5 text-primary" />
                    <span className="ml-1 font-semibold text-foreground">{property.rating} ({property.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span className="ml-1 text-foreground">{property.location}</span>
                </div>
                {property.longStay && (
                    <Badge variant="secondary" className="flex items-center">
                    <Clock className="h-4 w-4 mr-1.5" />
                    Long Stay Available
                    </Badge>
                )}
                 {property.petFriendly && (
                    <Badge variant="secondary" className="flex items-center">
                    <PawPrint className="h-4 w-4 mr-1.5" />
                    Pet Friendly
                    </Badge>
                )}
                </div>
            </div>
            <FavoriteButton propertyId={property.id} size="lg" />
        </div>
      </div>
      
       <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-2 h-[500px] rounded-xl overflow-hidden shadow-lg">
          <div className="col-span-2 row-span-2 h-full">
            {mainImage && (
              <div className="relative w-full h-full">
                 <Image src={mainImage} alt={`${property.name} main view`} fill className="object-cover" priority />
              </div>
            )}
          </div>
          {secondaryImages.map((img, index) => (
            <div key={index} className="h-full">
              <div className="relative w-full h-full">
                <Image src={img} alt={`${property.name} view ${index + 2}`} fill className="object-cover" />
              </div>
            </div>
          ))}
          <div className="absolute bottom-4 right-4 z-10 flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" className="shadow-lg">
                  <Maximize className="mr-2 h-5 w-5" />
                  Show all photos
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                 <Carousel className="w-full">
                    <CarouselContent>
                        {property.images.map((img, index) => (
                        <CarouselItem key={index}>
                            <div className="relative h-[60vh]">
                                <Image src={img} alt={`${property.name} view ${index + 1}`} fill className="object-contain" priority={index === 0} />
                            </div>
                        </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10" />
                    <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10" />
                </Carousel>
              </DialogContent>
            </Dialog>
            {property.virtualTourUrl && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary" className="shadow-lg">
                    <Video className="mr-2 h-5 w-5" />
                    Virtual Tour
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>360° Virtual Tour</DialogTitle>
                    <DialogDescription>
                      Explore every corner of {property.name}.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="relative h-[60vh] w-full mt-4 rounded-lg bg-muted flex items-center justify-center">
                    {virtualTourImage ? (
                      <Image src={property.virtualTourUrl} alt="Virtual Tour" fill className="object-contain" />
                    ) : <p>Virtual tour loading...</p>}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white p-4">
                      <h3 className="text-2xl font-bold">Interactive Tour Placeholder</h3>
                      <p className="mt-2 text-center">A full 360° virtual tour experience will be available here soon.</p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="border-b pb-6">
             <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-semibold flex items-center gap-2">
                        {property.propertyType} hosted by {property.owner.name}
                        {isOwnerVerified && <BadgeCheck className="h-6 w-6 text-primary" />}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground">
                        <span><Users className="inline h-4 w-4 mr-1"/>{property.maxGuests} guests</span>
                        <span><BedDouble className="inline h-4 w-4 mr-1"/>{property.bedrooms} bedrooms</span>
                        <span><Bath className="inline h-4 w-4 mr-1"/>{property.bathrooms} bathrooms</span>
                    </div>
                </div>
                <Image src={property.owner.avatar} alt={property.owner.name} width={64} height={64} className="rounded-full flex-shrink-0" data-ai-hint="person portrait" />
             </div>
          </div>
          <div className="py-8 border-b">
            <h3 className="text-xl font-semibold mb-4">About this place</h3>
            <p className="text-muted-foreground whitespace-pre-line">{property.description}</p>
          </div>
          <div className="py-8 border-b">
            <h3 className="text-xl font-semibold mb-4">What this place offers</h3>
            <div className="grid grid-cols-2 gap-4">
              {property.amenities.map((amenity) => {
                const Icon = amenityIcons[amenity] || Star;
                return (
                  <div key={amenity} className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-primary" />
                    <span>{amenity}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <ReviewSection propertyId={property.id} />
        </div>
        <div className="md:col-span-1">
          <div className="sticky top-24">
            <BookingForm property={property} />
          </div>
        </div>
      </div>
    </div>
  );
}
