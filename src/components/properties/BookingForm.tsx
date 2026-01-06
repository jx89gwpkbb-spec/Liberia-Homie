"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Minus, Plus, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Property } from "@/lib/types";
import { DateRange } from "react-day-picker";
import { DateSuggestionClient } from "./DateSuggestionClient";
import { useUser, useFirestore, addDocumentNonBlocking } from "@/firebase";
import { collection } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export function BookingForm({ property }: { property: Property }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [date, setDate] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(1);
  const [isBooking, setIsBooking] = useState(false);

  const price = property.pricePerNight;
  const nights = date?.to && date?.from ? Math.round((date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const serviceFee = nights > 0 ? 50 : 0;
  const total = nights * price + serviceFee;

  const handleReserve = async () => {
    if (!user || !firestore || !date?.from || !date?.to) {
        toast({
            title: "Reservation Failed",
            description: "You must be logged in and select valid dates to book a property.",
            variant: "destructive",
        });
        return;
    }

    setIsBooking(true);
    
    const bookingsCollectionRef = collection(firestore, 'bookings');
    const bookingData = {
        userId: user.uid,
        propertyId: property.id,
        checkInDate: date.from,
        checkOutDate: date.to,
        totalPrice: total,
        guests: guests,
        createdAt: new Date(),
        propertyName: property.name,
        propertyImage: property.images[0],
        propertyLocation: property.location,
    };

    try {
        await addDocumentNonBlocking(bookingsCollectionRef, bookingData);
        toast({
            title: "Booking Successful!",
            description: `You have reserved ${property.name}.`,
        });
        // Optionally, redirect or clear form
        setDate(undefined);
        setGuests(1);
    } catch (error) {
         // The non-blocking function will handle the error toast via the global emitter
         // but we can log it here if needed.
        console.error("Booking failed:", error);
    } finally {
        setIsBooking(false);
    }
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>
          <span className="text-2xl font-bold">${price}</span>
          <span className="text-base font-normal text-muted-foreground">/night</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Dates</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={1}
                disabled={{ before: new Date() }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label>Guests</Label>
          <div className="flex items-center justify-between rounded-md border p-2">
            <Button variant="ghost" size="icon" onClick={() => setGuests(g => Math.max(1, g - 1))}>
              <Minus className="h-4 w-4" />
            </Button>
            <span>{guests} guest{guests > 1 && 's'}</span>
            <Button variant="ghost" size="icon" onClick={() => setGuests(g => Math.min(property.maxGuests, g + 1))}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <DateSuggestionClient property={property} onDateSelect={(range) => setDate(range)} />

        {isUserLoading ? (
            <Button className="w-full" size="lg" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
            </Button>
        ) : user ? (
            <Button className="w-full" size="lg" onClick={handleReserve} disabled={isBooking || !date?.from || !date.to}>
                {isBooking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Reserve'}
            </Button>
        ): (
            <Button className="w-full" size="lg" asChild>
                <Link href="/login">Login to Reserve</Link>
            </Button>
        )}

        {nights > 0 && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>${price} x {nights} nights</span>
              <span>${price * nights}</span>
            </div>
            <div className="flex justify-between">
              <span>Service fee</span>
              <span>${serviceFee}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
              <span>Total</span>
              <span>${total}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Label({ children }: { children: React.ReactNode }) {
    return <p className="text-sm font-medium mb-2">{children}</p>;
}
