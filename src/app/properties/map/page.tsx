import Image from "next/image";
import placeholderImages from "@/lib/placeholder-images.json";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function PropertiesMapPage() {
  const mapImage = placeholderImages.placeholderImages.find(
    (p) => p.id === "map-placeholder"
  );

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline">Explore Properties on Map</h1>
        <p className="text-muted-foreground">
          Find your perfect stay by location.
        </p>
      </div>

      <Alert className="mb-8">
        <Info className="h-4 w-4" />
        <AlertTitle>Developer Preview</AlertTitle>
        <AlertDescription>
          This is a static placeholder for the interactive map view. A full map
          integration is coming soon.
        </AlertDescription>
      </Alert>

      <div className="relative h-[600px] w-full overflow-hidden rounded-lg border shadow-lg">
        {mapImage ? (
          <Image
            src={mapImage.imageUrl}
            alt={mapImage.description}
            fill
            className="object-cover"
            data-ai-hint={mapImage.imageHint}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <p>Map could not be loaded.</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 z-10 text-white">
          <h2 className="text-2xl font-bold">Map View</h2>
          <p>Pins for properties will be shown here.</p>
        </div>
      </div>
    </div>
  );
}
