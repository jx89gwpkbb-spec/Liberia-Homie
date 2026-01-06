'use client';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Booking } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Image from "next/image";
import { Skeleton } from '@/components/ui/skeleton';

export default function MyBookingsPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const bookingsCollectionRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'bookings'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: bookings, isLoading } = useCollection<Booking>(bookingsCollectionRef);
  const pageLoading = isUserLoading || isLoading;

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline">My Bookings</h1>
        <p className="text-muted-foreground">An overview of your upcoming and past stays.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Booking History</CardTitle>
          <CardDescription>A complete list of all your bookings.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-16 w-16 rounded-md" />
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : bookings && bookings.length > 0 ? (
                bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Image src={booking.propertyImage} alt={booking.propertyName} width={64} height={64} className="rounded-md object-cover" />
                        <div>
                          <p className="font-semibold">{booking.propertyName}</p>
                          <p className="text-sm text-muted-foreground">{booking.propertyLocation}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(booking.checkInDate.toDate(), 'MMM dd, yyyy')} - {format(booking.checkOutDate.toDate(), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>${booking.totalPrice.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={booking.checkOutDate.toDate() < new Date() ? 'secondary' : 'default'}>
                        {booking.checkOutDate.toDate() < new Date() ? 'Completed' : 'Upcoming'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    You haven't made any bookings yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
