import { PropertyCard } from "@/components/properties/PropertyCard";
import { FilterSidebar } from "@/components/properties/FilterSidebar";
import { properties } from "@/lib/data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Suspense } from 'react';

function PropertiesList({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const location = typeof searchParams.location === 'string' ? searchParams.location : '';
  const price = searchParams.price ? parseInt(searchParams.price as string) : 2000;
  const duration = searchParams.duration;
  const amenities = searchParams.amenities ? (Array.isArray(searchParams.amenities) ? searchParams.amenities : [searchParams.amenities]) : [];
  const bedrooms = searchParams.bedrooms ? parseInt(searchParams.bedrooms as string) : undefined;
  const petFriendly = searchParams.petFriendly === 'true';

  const filteredProperties = properties.filter(p => {
    const locationMatch = p.location.toLowerCase().includes(location.toLowerCase());
    const priceMatch = p.pricePerNight <= price;
    const durationMatch = !duration || duration === 'any' || (duration === 'long' && p.longStay) || (duration === 'short' && !p.longStay);
    const amenitiesMatch = amenities.every(amenity => p.amenities.includes(amenity));
    const bedroomMatch = !bedrooms || p.bedrooms >= bedrooms;
    const petFriendlyMatch = !petFriendly || p.petFriendly === true;

    return locationMatch && priceMatch && durationMatch && amenitiesMatch && bedroomMatch && petFriendlyMatch;
  });

  return (
    <main className="lg:col-span-3">
      <div className="mb-6 rounded-lg border bg-card p-4 shadow-sm">
        <form className="flex items-center gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input defaultValue={location} name="location" placeholder="Search by location, landmark..." className="pl-10" />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>

      <h1 className="text-3xl font-bold tracking-tight">
        {location ? `Stays in ${location}` : "All Properties"}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {filteredProperties.length} properties found.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
        {filteredProperties.length > 0 ? (
          filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))
        ) : (
          <p>No properties found for your search criteria.</p>
        )}
      </div>
    </main>
  )
}

export default function PropertiesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <Suspense>
            <FilterSidebar />
          </Suspense>
        </aside>
        <Suspense fallback={<p>Loading properties...</p>}>
           <PropertiesList searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
