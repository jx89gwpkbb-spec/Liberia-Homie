
'use client';
import { useUser, useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import type { Property } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { MoreHorizontal, PlusCircle, Trash2, CheckCircle, Clock, XCircle, Eye } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Skeleton } from '@/components/ui/skeleton';
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
} from "@/components/ui/alert-dialog"


export default function DashboardPropertiesPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const propertiesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'properties'), where('owner.id', '==', user.uid));
  }, [firestore, user]);

  const { data: userProperties, isLoading: arePropertiesLoading } = useCollection<Property>(propertiesQuery);

  const isLoading = isUserLoading || arePropertiesLoading;
  
  const handleDelete = (propertyId: string) => {
    if (!firestore) return;
    const propertyRef = doc(firestore, 'properties', propertyId);
    deleteDocumentNonBlocking(propertyRef);
  };

  const statusConfig = {
      approved: {
          variant: "default",
          icon: CheckCircle,
          label: "Approved",
          className: "bg-green-500 hover:bg-green-600",
      },
      pending: {
          variant: "secondary",
          icon: Clock,
          label: "Pending",
          className: "bg-yellow-500 hover:bg-yellow-600 text-white",
      },
      rejected: {
          variant: "destructive",
          icon: XCircle,
          label: "Rejected"
      }
  }


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold font-headline">My Properties</h1>
            <p className="text-muted-foreground">Manage your property listings.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/properties/new"><PlusCircle className="mr-2 h-4 w-4" /> Add New</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Property Listings</CardTitle>
          <CardDescription>A list of all your properties and their performance.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price/Night</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Views</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-16 w-16 rounded-md" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : userProperties && userProperties.length > 0 ? (
                userProperties.map((property) => {
                  const currentStatus = statusConfig[property.status || 'pending'];
                  return (
                  <TableRow key={property.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Image src={property.images[0]} alt={property.name} width={64} height={64} className="rounded-md object-cover" />
                        <div>
                          <p className="font-semibold">{property.name}</p>
                          <p className="text-sm text-muted-foreground">{property.location}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={currentStatus.variant as any} className={currentStatus.className}>
                        <currentStatus.icon className="mr-1.5 h-3 w-3" />
                        {currentStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell>${property.pricePerNight}</TableCell>
                    <TableCell>{property.reviewCount}</TableCell>
                    <TableCell>
                        <div className="flex items-center gap-1.5">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            {property.viewCount || 0}
                        </div>
                    </TableCell>
                    <TableCell>
                       <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link href={`/dashboard/properties/edit/${property.id}`}>Edit</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/properties/${property.id}`} target="_blank">View Listing</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialogTrigger asChild>
                               <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                         <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your property
                              and remove its data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/90"
                              onClick={() => handleDelete(property.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    You have not added any properties yet.
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
