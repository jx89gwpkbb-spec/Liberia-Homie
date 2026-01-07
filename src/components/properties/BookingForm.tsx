"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Minus, Plus, Loader2 } from "lucide-react";
import { format, addDays, differenceInDays, eachDayOfInterval } from "date-fns";
import { cn } from "@/lib/utils";
import type { Property, Booking, Extra } from "@/lib/types";
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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

type PriceDetails = {
  nights: number;
  basePrice: number;
  discount: number;
  extrasPrice: number;
  serviceFee: number;
  total: number;
  weekdayDays: number;
  weekendDays: number;
};

function calculateTotalPrice(
  dateRange: DateRange | undefined,
  property: Property,
  selectedExtras: Extra[],
  guests: number
): PriceDetails {
  const { from, to } = dateRange || {};
  if (!from || !to) {
    return { nights: 0, basePrice: 0, discount: 0, extrasPrice: 0, serviceFee: 0, total: 0, weekdayDays: 0, weekendDays: 0 };
  }

  const nights = differenceInDays(to, from);
  if (nights <= 0) {
    return { nights: 0, basePrice: 0, discount: 0, extrasPrice: 0, serviceFee: 0, total: 0, weekdayDays: 0, weekendDays: 0 };
  }

  const days = eachDayOfInterval({ start: from, end: addDays(to, -1) });
  let weekdayDays = 0;
  let weekendDays = 0;

  days.forEach(day => {
    const dayOfWeek = day.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) { // 0 = Sunday, 6 = Saturday
      weekendDays++;
    } else {
      weekdayDays++;
    }
  });

  const weekdayPrice = weekdayDays * property.pricePerNight;
  const weekendPrice = weekendDays * (property.weekendPrice || property.pricePerNight);
  const basePrice = weekdayPrice + weekendPrice;
  
  let discount = 0;
  if (property.weeklyDiscount && nights >= 7) {
      discount = basePrice * (property.weeklyDiscount / 100);
  }

  const extrasPrice = selectedExtras.reduce((acc, extra) => {
    switch (extra.type) {
        case 'per_night':
            return acc + (extra.price * nights);
        case 'per_person':
            return acc + (extra.price * guests);
        default: // 'per_stay'
            return acc + extra.price;
    }
  }, 0);
  
  const serviceFee = nights > 0 ? 50 : 0;
  const total = basePrice - discount + extrasPrice + serviceFee;

  return { nights, basePrice, discount, extrasPrice, serviceFee, total, weekdayDays, weekendDays };
}



export function BookingForm({ property }: { property: Property }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [date, setDate] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(1);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedExtras, setSelectedExtras] = useState<Extra[]>([]);

  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !property?.id) return null;
    return query(collection(firestore, 'bookings'), where('propertyId', '==', property.id));
  }, [firestore, property.id]);

  const { data: bookings } = useCollection<Booking>(bookingsQuery);

  const bookedDates = useMemo(() => {
    if (!bookings) return [];
    const dates: Date[] = [];
    bookings.forEach(booking => {
      const start = booking.checkInDate.toDate();
      const end = booking.checkOutDate.toDate();
      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }
    });
    return dates;
  }, [bookings]);

  const priceDetails = calculateTotalPrice(date, property, selectedExtras, guests);
  const { total, nights, basePrice, discount, extrasPrice, serviceFee, weekdayDays, weekendDays } = priceDetails;


  const handleExtraChange = (extra: Extra, checked: boolean) => {
    setSelectedExtras(prev => 
        checked ? [...prev, extra] : prev.filter(item => item.name !== extra.name)
    )
  };

  const showNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  };

  const handleReserve = () => {
    if (!user || !date?.from || !date?.to || !firestore) {
        return;
    }

    setIsBooking(true);
    
    const bookingsCollection = collection(firestore, 'bookings');
    const newBooking = {
        userId: user.uid,
        vendorId: property.owner.id,
        propertyId: property.id,
        checkInDate: date.from,
        checkOutDate: date.to,
        totalPrice: total,
        guests: guests,
        createdAt: serverTimestamp(),
        propertyName: property.name,
        propertyImage: property.images[0],
        propertyLocation: property.location,
        extras: selectedExtras,
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
    setSelectedExtras([]);
    setIsBooking(false);
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>
          <span className="text-2xl font-bold">${property.pricePerNight}</span>
          <span className="text-base font-normal text-muted-foreground">/{property.longStay ? 'month' : 'night'}</span>
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

        {property.extras && property.extras.length > 0 && (
            <div className="space-y-3">
                <Label>Add-ons</Label>
                {property.extras.map(extra => (
                    <div key={extra.name} className="flex items-center justify-between rounded-md border p-3">
                        <div>
                            <Label htmlFor={extra.name} className="font-medium">{extra.name}</Label>
                            <p className="text-xs text-muted-foreground">${extra.price} / {extra.type.replace('_', ' ')}</p>
                        </div>
                        <Checkbox 
                            id={extra.name}
                            onCheckedChange={(checked) => handleExtraChange(extra, checked as boolean)}
                            checked={selectedExtras.some(e => e.name === extra.name)}
                        />
                    </div>
                ))}
            </div>
        )}

        {!property.longStay && <DateSuggestionClient property={property} onDateSelect={(range) => setDate(range)} />}
        
        {nights > 0 && (
          <div className="space-y-2 text-sm">
             <div className="flex justify-between">
                <span>{weekdayDays} weekday nights</span>
                <span>${(weekdayDays * property.pricePerNight).toLocaleString()}</span>
            </div>
            {weekendDays > 0 && (
                <div className="flex justify-between">
                    <span>{weekendDays} weekend nights</span>
                    <span>${(weekendDays * (property.weekendPrice || property.pricePerNight)).toLocaleString()}</span>
                </div>
            )}
             {extrasPrice > 0 && (
                <div className="flex justify-between">
                    <span>Extras</span>
                    <span>${extrasPrice.toLocaleString()}</span>
                </div>
            )}
            <div className="flex justify-between">
                <span>Service fee</span>
                <span>${serviceFee.toLocaleString()}</span>
            </div>
            {discount > 0 && (
                 <div className="flex justify-between text-green-600">
                    <span>Weekly discount ({property.weeklyDiscount}%)</span>
                    <span>-${discount.toLocaleString()}</span>
                </div>
            )}
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
                ) : user && user.emailVerified ? (
                    <Button className="w-full" size="lg" disabled={isBooking || !date?.from || !date.to}>
                        {isBooking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Reserve'}
                    </Button>
                ): (
                    <Button className="w-full" size="lg" asChild>
                        <Link href="/login">{user ? 'Verify Email to Reserve' : 'Login to Reserve'}</Link>
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
