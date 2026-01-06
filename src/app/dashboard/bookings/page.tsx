'use client';
import { bookings } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Image from "next/image";

export default function MyBookingsPage() {

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
              {bookings && bookings.length > 0 ? (
                bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Image src={booking.property.images[0]} alt={booking.property.name} width={64} height={64} className="rounded-md object-cover" />
                        <div>
                          <p className="font-semibold">{booking.property.name}</p>
                          <p className="text-sm text-muted-foreground">{booking.property.location}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(booking.checkInDate), 'MMM dd, yyyy')} - {format(new Date(booking.checkOutDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>${booking.totalPrice.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={new Date(booking.checkOutDate) < new Date() ? 'secondary' : 'default'}>
                        {new Date(booking.checkOutDate) < new Date() ? 'Completed' : 'Upcoming'}
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
