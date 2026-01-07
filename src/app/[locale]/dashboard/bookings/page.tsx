'use client';
import { useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import type { Booking } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Image from "next/image";
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { QrCode, Ticket, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useToast } from '@/hooks/use-toast';
import { homieStaysAgent } from '@/ai/flows/homie-stays-agent';


function DigitalKeyDialog({ booking }: { booking: Booking }) {
    if (!booking.id) return null;
    
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(booking.id)}`;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
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


export default function MyBookingsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !user || !user.emailVerified) return null;
    // Fetch bookings from the user-specific subcollection
    return query(collection(firestore, `users/${user.uid}/bookings`));
  }, [firestore, user]);

  const { data: bookings, isLoading: areBookingsLoading } = useCollection<Booking>(bookingsQuery);

  const handleCancelBooking = async (bookingId: string) => {
    if (!user || !bookingId || !firestore) return;

    try {
        // The agent handles deleting the booking from the global /bookings collection
        await homieStaysAgent({
            question: `Cancel booking ${bookingId}`,
            userId: user.uid,
        });

        // We only need to delete the user's copy of the booking record
        const userBookingRef = doc(firestore, `users/${user.uid}/bookings`, bookingId);
        await deleteDoc(userBookingRef);
        

        toast({
            title: "Booking Cancelled",
            description: "Your booking has been successfully cancelled and a full refund is being processed.",
        });
    } catch(e) {
        console.error("Failed to cancel booking", e);
        toast({
            title: "Cancellation Failed",
            description: "We were unable to cancel your booking. Please try again.",
            variant: "destructive",
        })
    }
  };

  const isLoading = isUserLoading || areBookingsLoading;

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2"><Ticket /> My Bookings</h1>
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({length: 3}).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-16 w-16 rounded-md" />
                        <div className="space-y-2">
                           <Skeleton className="h-4 w-40" />
                           <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell className="text-right space-x-2">
                        <Skeleton className="h-8 w-24 inline-block" />
                        <Skeleton className="h-8 w-24 inline-block" />
                    </TableCell>
                  </TableRow>
                ))
              ) : bookings && bookings.length > 0 ? (
                bookings.map((booking) => {
                  const isUpcoming = booking.checkOutDate.toDate() >= new Date();
                  return (
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
                      <Badge variant={isUpcoming ? 'default' : 'secondary'}>
                        {isUpcoming ? 'Upcoming' : 'Completed'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                        {isUpcoming && <DigitalKeyDialog booking={booking} />}
                        {isUpcoming && (
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Cancel
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will cancel your booking for {booking.propertyName}. A full refund of ${booking.totalPrice.toLocaleString()} will be issued. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Go Back</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleCancelBooking(booking.id!)} className="bg-destructive hover:bg-destructive/90">
                                            Confirm Cancellation
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </TableCell>
                  </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
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
