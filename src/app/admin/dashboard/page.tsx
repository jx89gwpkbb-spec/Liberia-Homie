'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { format } from "date-fns";
import { Users as UsersIcon, Home, BookOpenCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from "recharts";
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { UserProfile as User, Property, Booking } from '@/lib/types';
import { Skeleton } from "@/components/ui/skeleton";

const bookingsChartConfig: ChartConfig = {
  bookings: {
    label: "Bookings",
    color: "hsl(var(--primary))",
  },
};

const usersChartConfig: ChartConfig = {
    users: {
      label: "New Users",
      color: "hsl(var(--primary))",
    },
  };

export default function AdminDashboardPage() {
  const firestore = useFirestore();

  const usersCollectionRef = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const propertiesCollectionRef = useMemoFirebase(() => firestore ? collection(firestore, 'properties') : null, [firestore]);
  const bookingsCollectionRef = useMemoFirebase(() => firestore ? collection(firestore, 'bookings') : null, [firestore]);

  const recentUsersQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'users'), orderBy('createdAt', 'desc'), limit(5)) : null, [firestore]);
  const recentPropertiesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'properties'), orderBy('reviewCount', 'desc'), limit(3)) : null, [firestore]);
  const recentBookingsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'bookings'), orderBy('createdAt', 'desc'), limit(5)) : null, [firestore]);
  
  const { data: users, isLoading: usersLoading } = useCollection<User>(usersCollectionRef);
  const { data: properties, isLoading: propertiesLoading } = useCollection<Property>(propertiesCollectionRef);
  const { data: bookings, isLoading: bookingsLoading } = useCollection<Booking>(bookingsCollectionRef);

  const { data: recentUsers, isLoading: recentUsersLoading } = useCollection<User>(recentUsersQuery);
  const { data: recentProperties, isLoading: recentPropertiesLoading } = useCollection<Property>(recentPropertiesQuery);
  const { data: recentBookings, isLoading: recentBookingsLoading } = useCollection<Booking>(recentBookingsQuery);

  const isLoading = usersLoading || propertiesLoading || bookingsLoading || recentUsersLoading || recentPropertiesLoading || recentBookingsLoading;
  
   const bookingsChartData = useMemoFirebase(() => {
    if (!bookings) return [];
    const monthlyBookings: {[key: string]: number} = {};
    bookings.forEach(booking => {
        if(booking.createdAt?.toDate) {
            const month = format(booking.createdAt.toDate(), 'MMMM');
            monthlyBookings[month] = (monthlyBookings[month] || 0) + 1;
        }
    });
    return Object.keys(monthlyBookings).map(month => ({ month, bookings: monthlyBookings[month] }));
  }, [bookings]);
  
  const usersChartData = useMemoFirebase(() => {
    if (!users) return [];
    const dailyUsers: {[key: string]: number} = {};
     users.slice(-7).forEach(user => {
        if (user.createdAt?.toDate) {
            const date = format(user.createdAt.toDate(), 'yyyy-MM-dd');
            dailyUsers[date] = (dailyUsers[date] || 0) + 1;
        }
    });
    return Object.keys(dailyUsers).map(date => ({ date, users: dailyUsers[date] }));
  }, [users]);


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
            {usersLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{users?.length || 0}</div>}
            <p className="text-xs text-muted-foreground">All registered users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {propertiesLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{properties?.length || 0}</div>}
            <p className="text-xs text-muted-foreground">All listed properties</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <BookOpenCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {bookingsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{bookings?.length || 0}</div>}
            <p className="text-xs text-muted-foreground">Completed and upcoming</p>
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bookings This Year</CardTitle>
            <CardDescription>A summary of bookings per month.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={bookingsChartConfig} className="h-[250px] w-full">
              {bookingsLoading ? <Skeleton className="w-full h-full" /> : (
                <BarChart accessibilityLayer data={bookingsChartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <YAxis />
                    <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dashed" />}
                    />
                    <Bar dataKey="bookings" fill="var(--color-bookings)" radius={4} />
                </BarChart>
              )}
            </ChartContainer>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>New Users</CardTitle>
            <CardDescription>New user sign-ups in the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={usersChartConfig} className="h-[250px] w-full">
              {usersLoading ? <Skeleton className="w-full h-full" /> : (
                <LineChart accessibilityLayer data={usersChartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => format(new Date(value), "MMM d")}
                    />
                    <YAxis />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Line
                    dataKey="users"
                    type="monotone"
                    stroke="var(--color-users)"
                    strokeWidth={2}
                    dot={false}
                    />
                </LineChart>
              )}
            </ChartContainer>
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
                    {recentUsersLoading ? Array.from({length: 5}).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><div className="flex items-center gap-3"><Skeleton className="h-8 w-8 rounded-full" /><Skeleton className="h-4 w-24" /></div></TableCell>
                            <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        </TableRow>
                    )) : recentUsers?.map(user => (
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
                    {recentPropertiesLoading ? Array.from({length: 3}).map((_, i) => (
                         <TableRow key={i}>
                            <TableCell><div className="flex items-center gap-3"><Skeleton className="h-12 w-12 rounded-md" /><div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-16" /></div></div></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        </TableRow>
                    )) : recentProperties?.map(prop => (
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
                <TableHead>User ID</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentBookingsLoading ? Array.from({length: 5}).map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                </TableRow>
              )) : recentBookings?.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.propertyName}</TableCell>
                  <TableCell className="text-xs font-mono">{booking.userId}</TableCell>
                  <TableCell>{booking.checkInDate?.toDate ? `${format(booking.checkInDate.toDate(), 'MMM dd')} - ${format(booking.checkOutDate.toDate(), 'MMM dd, yyyy')}`: 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={booking.checkOutDate?.toDate() < new Date() ? 'secondary' : 'default'}>
                      {booking.checkOutDate?.toDate() < new Date() ? 'Completed' : 'Upcoming'}
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
