"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Button } from "../ui/button";

export function FilterSidebar() {
  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-base font-semibold">Price Range</Label>
          <div className="mt-4">
            <Slider defaultValue={[500]} max={2000} step={50} />
            <div className="mt-2 flex justify-between text-sm text-muted-foreground">
              <span>$50</span>
              <span>$2000+</span>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-base font-semibold">Stay Duration</Label>
          <RadioGroup defaultValue="any" className="mt-2">
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

        <div>
          <Label className="text-base font-semibold">Amenities</Label>
          <div className="mt-2 space-y-2">
            {['Private Pool', 'WiFi', 'Kitchen', 'Air Conditioning', 'Free Parking'].map(amenity => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox id={amenity.toLowerCase().replace(' ', '-')}/>
                <Label htmlFor={amenity.toLowerCase().replace(' ', '-')}>{amenity}</Label>
              </div>
            ))}
          </div>
        </div>
        
        <Button className="w-full">Apply Filters</Button>
      </CardContent>
    </Card>
  );
}
