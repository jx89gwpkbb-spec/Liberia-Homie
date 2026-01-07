"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { amenities as availableAmenities } from "@/lib/data";
import { SaveSearchDialog } from "./SaveSearchDialog";
import { useUser } from "@/firebase";
import { SavedSearches } from "./SavedSearches";
import { Separator } from "../ui/separator";


export function FilterSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useUser();

  // Initialize state from URL params
  const [price, setPrice] = useState(searchParams.get('price') ? parseInt(searchParams.get('price') as string) : 2000);
  const [stayDuration, setStayDuration] = useState(searchParams.get('duration') || 'any');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(searchParams.getAll('amenities') || []);
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') || '');
  const [petFriendly, setPetFriendly] = useState(searchParams.get('petFriendly') === 'true');

  useEffect(() => {
    setPrice(searchParams.get('price') ? parseInt(searchParams.get('price') as string) : 2000);
    setStayDuration(searchParams.get('duration') || 'any');
    setSelectedAmenities(searchParams.getAll('amenities') || []);
    setBedrooms(searchParams.get('bedrooms') || '');
    setPetFriendly(searchParams.get('petFriendly') === 'true');
  }, [searchParams]);

  const handleAmenityChange = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity) 
        : [...prev, amenity]
    );
  };
  
  const handleApplyFilters = () => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    current.set('price', price.toString());
    current.set('duration', stayDuration);
    current.delete('amenities');
    selectedAmenities.forEach(a => current.append('amenities', a));
    if (bedrooms) {
        current.set('bedrooms', bedrooms);
    } else {
        current.delete('bedrooms');
    }
    if (petFriendly) {
        current.set('petFriendly', 'true');
    } else {
        current.delete('petFriendly');
    }

    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`${pathname}${query}`);
  };

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-base font-semibold">Price Range (Max)</Label>
          <div className="mt-4">
            <Slider defaultValue={[price]} max={2000} step={50} onValueChange={(value) => setPrice(value[0])} />
            <div className="mt-2 flex justify-between text-sm text-muted-foreground">
              <span>$50</span>
              <span>${price}{price === 2000 && '+'}</span>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-base font-semibold">Stay Duration</Label>
          <RadioGroup value={stayDuration} onValueChange={setStayDuration} className="mt-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="any" id="any-stay" />
              <Label htmlFor="any-stay">Any</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="short" id="short-stay" />
              <Label htmlFor="short-stay">Short Stay</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="long" id="long-stay" />
              <Label htmlFor="long-stay">Long Stay</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="space-y-2">
            <Label className="text-base font-semibold">Bedrooms</Label>
            <Input type="number" placeholder="Any" value={bedrooms} onChange={e => setBedrooms(e.target.value)} min="1" />
        </div>

        <div className="flex items-center space-x-2">
            <Checkbox id="pet-friendly" checked={petFriendly} onCheckedChange={(checked) => setPetFriendly(checked as boolean)} />
            <Label htmlFor="pet-friendly" className="text-base font-semibold">Pet-Friendly</Label>
        </div>

        <div>
          <Label className="text-base font-semibold">Amenities</Label>
          <div className="mt-2 space-y-2">
            {availableAmenities.map(amenity => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox id={amenity.toLowerCase().replace(' ', '-')} 
                    checked={selectedAmenities.includes(amenity)}
                    onCheckedChange={() => handleAmenityChange(amenity)}
                />
                <Label htmlFor={amenity.toLowerCase().replace(' ', '-')}>{amenity}</Label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <Button className="w-full" onClick={handleApplyFilters}>Apply Filters</Button>
          {user && <SaveSearchDialog searchParams={searchParams} />}
        </div>
        
        {user && (
            <>
                <Separator />
                <SavedSearches />
            </>
        )}
      </CardContent>
    </Card>
  );
}
