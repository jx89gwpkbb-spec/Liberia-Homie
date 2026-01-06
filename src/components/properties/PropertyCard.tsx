import type { Property } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Users, BedDouble, Bath } from "lucide-react";

type PropertyCardProps = {
  property: Property;
};

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Link href={`/properties/${property.id}`} className="group">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
        <CardHeader className="p-0">
          <div className="relative h-60 w-full">
            <Image
              src={property.images[0]}
              alt={property.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <Badge className="absolute right-3 top-3 bg-accent text-accent-foreground shadow-md">
              {property.longStay ? "Long Stay" : "Short Stay"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <p className="text-sm text-muted-foreground">{property.propertyType} in {property.location.split(',')[0]}</p>
          <h3 className="text-lg font-bold leading-tight mt-1 truncate group-hover:text-primary">{property.name}</h3>
          
          <div className="mt-4 flex items-center justify-start gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {property.maxGuests} guests</span>
              <span className="flex items-center gap-1.5"><BedDouble className="h-4 w-4" /> {property.bedrooms} beds</span>
              <span className="flex items-center gap-1.5"><Bath className="h-4 w-4" /> {property.bathrooms} baths</span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between p-4 pt-0">
          <div>
            <span className="text-xl font-bold text-primary">${property.pricePerNight}</span>
            <span className="text-sm text-muted-foreground">/night</span>
          </div>
          <div className="flex items-center">
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            <span className="ml-1 font-semibold">{property.rating.toFixed(1)}</span>
            <span className="ml-1 text-sm text-muted-foreground">({property.reviewCount})</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
