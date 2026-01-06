import { properties } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Star, MapPin, Users, BedDouble, Bath, Wifi, ParkingCircle, Utensils, Wind, Tv } from "lucide-react";
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

const amenityIcons: { [key: string]: React.ElementType } = {
  'WiFi': Wifi,
  'Free Parking': ParkingCircle,
  'Kitchen': Utensils,
  'Air Conditioning': Wind,
  'TV': Tv,
  'Private Pool': () => <span className="text-lg">🏊</span>,
  'Ocean View': () => <span className="text-lg">🌊</span>,
  'Gym': () => <span className="text-lg">🏋️</span>,
};


export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const property = properties.find((p) => p.id === params.id);

  if (!property) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-4">
        <h1 className="text-4xl font-bold font-headline">{property.name}</h1>
        <div className="mt-2 flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center">
            <Star className="h-5 w-5 text-primary" />
            <span className="ml-1 font-semibold text-foreground">{property.rating} ({property.reviewCount} reviews)</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="ml-1 text-foreground">{property.location}</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Carousel className="w-full rounded-xl overflow-hidden shadow-lg">
                <CarouselContent>
                    {property.images.map((img, index) => (
                    <CarouselItem key={index}>
                        <div className="relative h-[500px]">
                            <Image src={img} alt={`${property.name} view ${index + 1}`} fill className="object-cover" />
                        </div>
                    </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
            </Carousel>
        </div>
        <div className="hidden lg:grid grid-rows-2 gap-4">
            <div className="relative rounded-xl overflow-hidden shadow-lg">
                <Image src={property.images[1] || property.images[0]} alt={`${property.name} view 2`} fill className="object-cover" />
            </div>
             <div className="relative rounded-xl overflow-hidden shadow-lg">
                <Image src={property.images[2] || property.images[0]} alt={`${property.name} view 3`} fill className="object-cover" />
            </div>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="border-b pb-6">
             <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-semibold">{property.propertyType} hosted by {property.owner.name}</h2>
                    <div className="mt-2 flex items-center gap-4 text-muted-foreground">
                        <span><Users className="inline h-4 w-4 mr-1"/>{property.maxGuests} guests</span>
                        <span><BedDouble className="inline h-4 w-4 mr-1"/>{property.bedrooms} bedrooms</span>
                        <span><Bath className="inline h-4 w-4 mr-1"/>{property.bathrooms} bathrooms</span>
                    </div>
                </div>
                <Image src={property.owner.avatar} alt={property.owner.name} width={64} height={64} className="rounded-full" data-ai-hint="person portrait" />
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
