import { PropertyCard } from "@/components/properties/PropertyCard";
import { FilterSidebar } from "@/components/properties/FilterSidebar";
import { properties as allProperties } from "@/lib/data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Map } from "lucide-react";
import { Suspense } from 'react';
import Link from "next/link";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { initializeFirebase } from "@/firebase";

// This is a server component, so we can fetch data directly.
// Note: This is a simplified example. For production, you'd use the Firebase client SDK
// in a client component or fetch via a server-side route handler that uses the Admin SDK.
async function getApprovedProperties() {
    const { firestore } = initializeFirebase();
    const propertiesRef = collection(firestore, 'properties');
    const q = query(propertiesRef, where("status", "==", "approved"));
    
    try {
        const querySnapshot = await getDocs(q);
        const properties = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // The data is not serializable for the client component if it contains Timestamps.
        // Let's use our static data for now until we have a proper API route.
        // In a real app, you would serialize this data properly.
        return allProperties.filter(p => p.status === 'approved');
    } catch (error) {
        console.error("Could not fetch approved properties, using static data as fallback:", error);
        return allProperties.filter(p => p.status === 'approved');
    }
}


async function PropertiesList({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const properties = await getApprovedProperties();

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
      <div className="mb-6 flex items-center justify-between gap-4 rounded-lg border bg-card p-4 shadow-sm">
        <form className="flex flex-grow items-center gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input defaultValue={location} name="location" placeholder="Search by location, landmark..." className="pl-10" />
          </div>
          <Button type="submit">Search</Button>
        </form>
        <Button variant="outline" asChild>
          <Link href="/properties/map">
            <Map className="mr-2 h-4 w-4" />
            Map View
          </Link>
        </Button>
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
