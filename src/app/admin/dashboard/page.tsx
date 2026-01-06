import { users, properties, bookings } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { format } from "date-fns";
import { Users as UsersIcon, Home, BookOpenCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  const recentUsers = users.slice(0, 5);
  const recentProperties = properties.slice(0, 3);
  const recentBookings = bookings.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Admin Overview</h1>
        <p className="text-muted-foreground">A summary of your platform's activity.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">All registered users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties.length}</div>
            <p className="text-xs text-muted-foreground">All listed properties</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <BookOpenCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
            <p className="text-xs text-muted-foreground">Completed and upcoming</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>The latest users who signed up.</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild><Link href="/admin/users">View All</Link></Button>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentUsers.map(user => (
                         <TableRow key={user.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Image src={user.avatar} alt={user.name} width={32} height={32} className="rounded-full object-cover" />
                                    <span className="font-medium">{user.name}</span>
                                </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
             <div>
                <CardTitle>Recent Properties</CardTitle>
                <CardDescription>The latest properties added.</CardDescription>
             </div>
             <Button variant="outline" size="sm" asChild><Link href="/admin/properties">View All</Link></Button>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead>Price</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentProperties.map(prop => (
                         <TableRow key={prop.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Image src={prop.images[0]} alt={prop.name} width={48} height={48} className="rounded-md object-cover" />
                                    <div>
                                        <p className="font-medium">{prop.name}</p>
                                        <p className="text-sm text-muted-foreground">{prop.location}</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>${prop.pricePerNight}/night</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
             </Table>
          </CardContent>
        </Card>
      </div>
      
       <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>An overview of recent booking activity.</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild><Link href="/admin/bookings">View All</Link></Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.property.name}</TableCell>
                  <TableCell>{booking.user.name}</TableCell>
                  <TableCell>{format(new Date(booking.checkInDate), 'MMM dd')} - {format(new Date(booking.checkOutDate), 'MMM dd, yyyy')}</TableCell>
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
