import { bookings } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function AdminBookingsPage() {
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline">Booking Management</h1>
        <p className="text-muted-foreground">View and manage all bookings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>A complete list of all bookings on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-mono text-xs">{booking.id}</TableCell>
                  <TableCell className="font-medium">{booking.property.name}</TableCell>
                  <TableCell>{booking.user.name}</TableCell>
                  <TableCell>{format(new Date(booking.checkInDate), 'MMM dd, yyyy')} - {format(new Date(booking.checkOutDate), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>${booking.totalPrice.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={new Date(booking.checkOutDate) < new Date() ? 'secondary' : 'default'}>
                      {new Date(booking.checkOutDate) < new Date() ? 'Completed' : 'Upcoming'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Contact User</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Cancel Booking</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
