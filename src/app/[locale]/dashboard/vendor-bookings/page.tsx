'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Booking } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

export default function VendorBookingsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const vendorBookingsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    // Query bookings directly where the vendorId matches the current user's UID
    return query(collection(firestore, 'bookings'), where('vendorId', '==', user.uid));
  }, [user, firestore]);

  const { data: vendorBookings, isLoading: areBookingsLoading } = useCollection<Booking>(vendorBookingsQuery);
  
  const isLoading = isUserLoading || areBookingsLoading;

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline">Vendor Bookings</h1>
        <p className="text-muted-foreground">A summary of all bookings for your properties.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Booking History</CardTitle>
          <CardDescription>A list of all past and upcoming bookings for your properties.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Renter</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({length: 3}).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : vendorBookings && vendorBookings.length > 0 ? (
                vendorBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.propertyName}</TableCell>
                     <TableCell>
                        <div className="flex items-center gap-2">
                            {/* In a real app, fetch the user's avatar */}
                            <Image src={`https://picsum.photos/seed/${booking.userId}/40/40`} alt="Renter" width={24} height={24} className="rounded-full" />
                            <span className="text-xs font-mono">{booking.userId.substring(0, 10)}...</span>
                        </div>
                    </TableCell>
                    <TableCell>
                      {booking.checkInDate?.toDate && booking.checkOutDate?.toDate ? `${format(booking.checkInDate.toDate(), 'MMM dd')} - ${format(booking.checkOutDate.toDate(), 'MMM dd, yyyy')}` : 'Date not available'}
                    </TableCell>
                    <TableCell>${booking.totalPrice.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={booking.checkOutDate?.toDate() < new Date() ? 'secondary' : 'default'}>
                        {booking.checkOutDate?.toDate() < new Date() ? 'Completed' : 'Upcoming'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    You have no bookings for your properties yet.
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
