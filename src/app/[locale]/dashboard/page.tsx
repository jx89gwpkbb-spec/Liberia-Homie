'use client';
import { useMemo, useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Booking } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { format, isPast } from "date-fns";
import Image from "next/image";
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Plane, Calendar, Users, MapPin, QrCode } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

function DigitalKeyDialog({ booking }: { booking: Booking }) {
    if (!booking.id) return null;
    
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(booking.id)}`;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="secondary" size="sm" className="w-full mt-2">
                    <QrCode className="mr-2 h-4 w-4" />
                    Digital Key
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Your Digital Key</DialogTitle>
                    <DialogDescription>
                        Scan this QR code at the property for check-in. Valid for your stay from {format(booking.checkInDate.toDate(), 'MMM dd')} to {format(booking.checkOutDate.toDate(), 'MMM dd, yyyy')}.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center justify-center p-4 bg-white rounded-lg">
                    <Image src={qrCodeUrl} alt="Digital Key QR Code" width={256} height={256} />
                </div>
                <div className="text-center text-xs text-muted-foreground">Booking ID: {booking.id}</div>
            </DialogContent>
        </Dialog>
    );
}

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  
  const [upcomingTrips, setUpcomingTrips] = useState<Booking[]>([]);
  const [pastTrips, setPastTrips] = useState<Booking[]>([]);

  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !user || !user.emailVerified) return null;
    return query(collection(firestore, 'bookings'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: bookings, isLoading: areBookingsLoading } = useCollection<Booking>(bookingsQuery);
  
  useEffect(() => {
    if (bookings) {
      const sortedBookings = [...bookings].sort((a, b) => b.checkInDate.toDate().getTime() - a.checkInDate.toDate().getTime());
      const now = new Date();
      setUpcomingTrips(sortedBookings.filter(b => !isPast(b.checkOutDate.toDate())));
      setPastTrips(sortedBookings.filter(b => isPast(b.checkOutDate.toDate())));
    }
  }, [bookings]);

  const isLoading = isUserLoading || areBookingsLoading;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2"><Plane /> My Trips</h1>
        <p className="text-muted-foreground">An overview of your upcoming and past adventures.</p>
      </div>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Upcoming Trips</h2>
        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            <TripCardSkeleton />
            <TripCardSkeleton />
          </div>
        ) : upcomingTrips.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {upcomingTrips.map(trip => <TripCard key={trip.id} trip={trip} />)}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold">No Upcoming Trips</h3>
            <p className="text-muted-foreground mt-2">Time to plan your next getaway!</p>
            <Button asChild className="mt-4">
              <Link href="/properties">Explore Properties</Link>
            </Button>
          </div>
        )}
      </section>
      
      <Separator />

      <section>
        <h2 className="text-2xl font-semibold mb-4">Past Trips</h2>
        {isLoading ? (
           <div className="grid md:grid-cols-2 gap-6">
            <TripCardSkeleton />
          </div>
        ) : pastTrips.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {pastTrips.map(trip => <TripCard key={trip.id} trip={trip} isPast />)}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold">No Past Trips</h3>
            <p className="text-muted-foreground mt-2">You haven't been on any trips with us yet.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function TripCard({ trip, isPast = false }: { trip: Booking, isPast?: boolean }) {
    return (
        <Card className="overflow-hidden">
            <CardHeader className="p-0 relative">
                <div className="relative h-48 w-full">
                    <Image
                        src={trip.propertyImage}
                        alt={trip.propertyName}
                        fill
                        className="object-cover"
                    />
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
                <CardTitle className="text-xl">{trip.propertyName}</CardTitle>
                <div className="text-muted-foreground text-sm space-y-2">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{trip.propertyLocation}</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{format(trip.checkInDate.toDate(), 'MMM dd, yyyy')} - {format(trip.checkOutDate.toDate(), 'MMM dd, yyyy')}</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{trip.guests} guest{trip.guests > 1 ? 's' : ''}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex-col items-stretch gap-2">
                <Button asChild variant="outline" className="w-full">
                    <Link href={`/properties/${trip.propertyId}`}>View Property</Link>
                </Button>
                {!isPast && <DigitalKeyDialog booking={trip} />}
            </CardFooter>
        </Card>
    );
}

function TripCardSkeleton() {
    return (
        <Card>
            <CardHeader className="p-0">
                <Skeleton className="h-48 w-full" />
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Skeleton className="h-10 w-full" />
            </CardFooter>
        </Card>
    )
}
