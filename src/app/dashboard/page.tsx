import { bookings } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { format } from "date-fns";

export default function DashboardPage() {
  const userBookings = bookings.filter(b => b.user.id === 'user-4'); // Mocked current user

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">My Bookings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming and Past Stays</CardTitle>
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
              {userBookings.map((booking) => (
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
                  <TableCell>{format(new Date(booking.checkInDate), 'MMM dd, yyyy')} - {format(new Date(booking.checkOutDate), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>${booking.totalPrice.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={new Date(booking.checkOutDate) < new Date() ? 'secondary' : 'default'}>
                      {new Date(booking.checkOutDate) < new Date() ? 'Completed' : 'Upcoming'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
