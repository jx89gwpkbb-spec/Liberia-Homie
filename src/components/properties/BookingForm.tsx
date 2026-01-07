
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Minus, Plus, Loader2 } from "lucide-react";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import type { Property, Booking } from "@/lib/types";
import { DateRange } from "react-day-picker";
import { DateSuggestionClient } from "./DateSuggestionClient";
import { useUser, useFirestore, addDocumentNonBlocking, useCollection, useMemoFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { collection, serverTimestamp, query, where } from "firebase/firestore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function BookingForm({ property }: { property: Property }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [date, setDate] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(1);
  const [isBooking, setIsBooking] = useState(false);

  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !property?.id) return null;
    return query(collection(firestore, 'bookings'), where('propertyId', '==', property.id));
  }, [firestore, property?.id]);

  const { data: bookings } = useCollection<Booking>(bookingsQuery);

  const bookedDates = useMemo(() => {
    if (!bookings) return [];
    const dates: Date[] = [];
    bookings.forEach(booking => {
      const start = booking.checkInDate.toDate();
      const end = booking.checkOutDate.toDate();
      for (let d = start; d < end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }
    });
    return dates;
  }, [bookings]);

  const price = property.pricePerNight;
  const nights = date?.to && date?.from ? Math.round((date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const serviceFee = nights > 0 ? 50 : 0;
  const total = nights * price + serviceFee;

  const showNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  };

  const handleReserve = async () => {
    if (!user || !date?.from || !date?.to || !firestore) {
        // This case should ideally be prevented by disabling the button.
        return;
    }

    setIsBooking(true);
    
    try {
        const bookingsCollection = collection(firestore, 'bookings');
        const newBooking = {
            userId: user.uid,
            propertyId: property.id,
            checkInDate: date.from,
            checkOutDate: date.to,
            totalPrice: total,
            guests: guests,
            createdAt: serverTimestamp(),
            propertyName: property.name,
            propertyImage: property.images[0],
            propertyLocation: property.location,
        };

        addDocumentNonBlocking(bookingsCollection, newBooking);

        toast({
            title: "Booking Successful!",
            description: `You have reserved ${property.name}.`,
        });
        
        showNotification(
            'Booking Confirmed!',
            `Your stay at ${property.name} from ${format(date.from, "MMM dd")} to ${format(date.to, "MMM dd")} is confirmed.`
        );

        setDate(undefined);
        setGuests(1);
    } catch (error) {
        console.error("Booking failed:", error);
        toast({
            title: "Booking Failed",
            description: "Something went wrong. Please try again.",
            variant: "destructive",
        });
    } finally {
        setIsBooking(false);
    }
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>
          <span className="text-2xl font-bold">${price}</span>
          <span className="text-base font-normal text-muted-foreground">/{property.longStay ? 'month' : 'day'}</span>
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
                disabled={[{ before: new Date() }, ...bookedDates]}
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
        
        {nights > 0 && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>${price} x {nights} nights</span>
              <span>${(price * nights).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Service fee</span>
              <span>${serviceFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
              <span>Total</span>
              <span>${total.toLocaleString()}</span>
            </div>
          </div>
        )}

        <AlertDialog>
           <AlertDialogTrigger asChild>
                {isUserLoading ? (
                    <Button className="w-full" size="lg" disabled>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                    </Button>
                ) : user ? (
                    <Button className="w-full" size="lg" disabled={isBooking || !date?.from || !date.to}>
                        {isBooking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Reserve'}
                    </Button>
                ): (
                    <Button className="w-full" size="lg" asChild>
                        <Link href="/login">Login to Reserve</Link>
                    </Button>
                )}
           </AlertDialogTrigger>
           <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Your Booking</AlertDialogTitle>
                <AlertDialogDescription>
                  You are about to book a stay at {property.name} from {date?.from ? format(date.from, 'MMM dd, yyyy') : ''} to {date?.to ? format(date.to, 'MMM dd, yyyy') : ''}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="rounded-lg bg-muted p-4">
                  <div className="flex justify-between font-bold text-lg">
                      <span>Total Price:</span>
                      <span>${total.toLocaleString()}</span>
                  </div>
                   <p className="text-sm text-muted-foreground mt-1">This is a placeholder for the payment step. No real payment will be processed.</p>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleReserve} disabled={isBooking}>
                   {isBooking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Confirm Instant Booking'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

      </CardContent>
    </Card>
  );
}

function Label({ children }: { children: React.ReactNode }) {
    return <p className="text-sm font-medium mb-2">{children}</p>;
}
