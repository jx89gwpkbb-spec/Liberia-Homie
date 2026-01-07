'use client';
import { useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { Booking } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { format, isPast } from "date-fns";
import Image from "next/image";
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Plane, Calendar, Users, MapPin } from 'lucide-react';

export default function MyTripsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'bookings'), where('userId', '==', user.uid), orderBy('checkInDate', 'desc'));
  }, [firestore, user]);

  const { data: bookings, isLoading: areBookingsLoading } = useCollection<Booking>(bookingsQuery);
  
  const { upcomingTrips, pastTrips } = useMemo(() => {
    if (!bookings) return { upcomingTrips: [], pastTrips: [] };
    const now = new Date();
    return {
      upcomingTrips: bookings.filter(b => !isPast(b.checkInDate.toDate())),
      pastTrips: bookings.filter(b => isPast(b.checkInDate.toDate())),
    };
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
            {pastTrips.map(trip => <TripCard key={trip.id} trip={trip} />)}
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

function TripCard({ trip }: { trip: Booking }) {
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
            <CardFooter className="p-4 pt-0">
                <Button asChild variant="outline" className="w-full">
                    <Link href={`/properties/${trip.propertyId}`}>View Property</Link>
                </Button>
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
