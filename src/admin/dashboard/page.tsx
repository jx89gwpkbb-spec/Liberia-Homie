'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { format } from "date-fns";
import { Users as UsersIcon, Home, BookOpenCheck, DollarSign, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from "recharts";
import { useFirestore, useCollection, useMemoFirebase, useUser, setDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, limit, where, doc } from 'firebase/firestore';
import type { UserProfile as User, Property, Booking } from '@/lib/types';
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import { useToast } from "@/hooks/use-toast";


const usersChartConfig: ChartConfig = {
    users: {
      label: "New Users",
      color: "hsl(var(--primary))",
    },
  };

export default function AdminDashboardPage() {
  const firestore = useFirestore();
  const { user: adminUser } = useUser();
  const { toast } = useToast();

  const isSuperAdmin = adminUser?.email === 'samuelknimelyjr@gmail.com';

  const usersCollectionRef = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const propertiesCollectionRef = useMemoFirebase(() => firestore ? collection(firestore, 'properties') : null, [firestore]);
  const bookingsCollectionRef = useMemoFirebase(() => firestore ? query(collection(firestore, 'bookings')) : null, [firestore]);
  
  const recentUsersQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'users'), orderBy('createdAt', 'desc'), limit(5)) : null, [firestore]);
  const recentPropertiesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'properties'), where('status', '==', 'approved'), orderBy('reviewCount', 'desc'), limit(3)) : null, [firestore]);
  const pendingPropertiesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'properties'), where('status', '==', 'pending')) : null, [firestore]);

  const { data: users, isLoading: usersLoading } = useCollection<User>(usersCollectionRef);
  const { data: properties, isLoading: propertiesLoading } = useCollection<Property>(propertiesCollectionRef);
  const { data: bookingsData, isLoading: bookingsLoading } = useCollection<Booking>(bookingsCollectionRef);
  const { data: recentUsers, isLoading: recentUsersLoading } = useCollection<User>(recentUsersQuery);
  const { data: recentProperties, isLoading: recentPropertiesLoading } = useCollection<Property>(recentPropertiesQuery);
  const { data: pendingProperties, isLoading: pendingPropertiesLoading } = useCollection<Property>(pendingPropertiesQuery);

  const bookings = useMemo(() => {
    if (!bookingsData) return [];
    // Sort client-side
    return [...bookingsData].sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate()).slice(0, 50);
  }, [bookingsData]);

  const totalRevenue = useMemo(() => {
    if (!bookings) return 0;
    // Ensure booking.totalPrice is a number before adding it to the accumulator
    return bookings.reduce((acc, booking) => acc + (booking.totalPrice || 0), 0);
  }, [bookings]);

  const isLoading = usersLoading || propertiesLoading || bookingsLoading || recentUsersLoading || recentPropertiesLoading || pendingPropertiesLoading;
  
  const usersChartData = useMemo(() => {
    if (!users) return [];
    const dailyUsers: {[key: string]: number} = {};
     users.slice(-7).forEach(user => {
        if (user.createdAt && typeof user.createdAt.toDate === 'function') {
            const date = format(user.createdAt.toDate(), 'yyyy-MM-dd');
            dailyUsers[date] = (dailyUsers[date] || 0) + 1;
        }
    });
    return Object.keys(dailyUsers).map(date => ({ date, users: dailyUsers[date] }));
  }, [users]);
  
  const handleStatusChange = (propertyId: string, status: 'approved' | 'rejected') => {
    if (!firestore) return;
    const propertyRef = doc(firestore, 'properties', propertyId);
    setDocumentNonBlocking(propertyRef, { status: status }, { merge: true });
    toast({
        title: `Property ${status}`,
        description: `The property has been successfully ${status}.`,
    })
  };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Admin Overview</h1>
        <p className="text-muted-foreground">A summary of your platform's activity.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
            <p className="text-xs text-muted-foreground">All time bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {bookingsLoading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>}
            <p className="text-xs text-muted-foreground">All time revenue</p>
          </CardContent>
        </Card>
      </div>
      
      {isSuperAdmin && (
        <Card>
            <CardHeader>
                <CardTitle>Pending Property Approvals</CardTitle>
                <CardDescription>Review and approve new property submissions.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Property</TableHead>
                            <TableHead>Owner</TableHead>
                            <TableHead>Price/Night</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pendingPropertiesLoading ? (
                            Array.from({length: 2}).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-40" /></TableCell>
                                </TableRow>
                            ))
                        ) : pendingProperties && pendingProperties.length > 0 ? (
                            pendingProperties.map(property => (
                                <TableRow key={property.id}>
                                    <TableCell>
                                      <div className="flex items-center gap-3">
                                        <Image src={property.images[0]} alt={property.name} width={48} height={48} className="rounded-md object-cover" />
                                        <div>
                                            <p className="font-medium">{property.name}</p>
                                            <p className="text-sm text-muted-foreground">{property.location}</p>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>{property.owner.name}</TableCell>
                                    <TableCell>${property.pricePerNight}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700" onClick={() => handleStatusChange(property.id, 'approved')}>
                                            <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleStatusChange(property.id, 'rejected')}>
                                            <XCircle className="mr-2 h-4 w-4" /> Reject
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No properties are currently pending approval.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                 </Table>
            </CardContent>
        </Card>
      )}

       <div className="grid gap-8 lg:grid-cols-1">
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
                <CardTitle>Top Properties</CardTitle>
                <CardDescription>Highest rated approved properties.</CardDescription>
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
    </div>
  );
}
