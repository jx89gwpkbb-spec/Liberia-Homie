'use client';
import { useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { Property } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { MoreHorizontal, CheckCircle, XCircle, Clock } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function AdminPropertiesPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const propertiesCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'properties');
  }, [firestore]);

  const { data: properties, isLoading } = useCollection<Property>(propertiesCollectionRef);
  
  const handleStatusChange = (propertyId: string, status: 'approved' | 'rejected' | 'pending') => {
    if (!firestore) return;
    const propertyRef = doc(firestore, 'properties', propertyId);
    setDocumentNonBlocking(propertyRef, { status: status }, { merge: true });
    toast({
        title: `Property status updated`,
        description: `The property has been set to ${status}.`,
    })
  };

  const statusConfig = {
      approved: {
          variant: "default",
          icon: CheckCircle,
          label: "Approved",
          className: "bg-green-500 hover:bg-green-600 text-white",
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
      <div>
        <h1 className="text-3xl font-bold font-headline">Property Management</h1>
        <p className="text-muted-foreground">Oversee all property listings on the platform.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Properties</CardTitle>
          <CardDescription>A complete list of all properties.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price/Night</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
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
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : properties && properties.length > 0 ? (
                properties.map((property) => {
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
                        <TableCell>{property.owner.name}</TableCell>
                        <TableCell>
                          <Badge variant={currentStatus.variant as any} className={cn(currentStatus.className)}>
                              <currentStatus.icon className="mr-1.5 h-3 w-3" />
                              {currentStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell>${property.pricePerNight}</TableCell>
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
                               {property.status !== 'approved' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(property.id, 'approved')}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve
                                </DropdownMenuItem>
                               )}
                               {property.status !== 'rejected' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(property.id, 'rejected')} className="text-destructive">
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject
                                </DropdownMenuItem>
                               )}
                               {property.status !== 'pending' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(property.id, 'pending')}>
                                    <Clock className="mr-2 h-4 w-4" />
                                    Set as Pending
                                </DropdownMenuItem>
                               )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/properties/edit/${property.id}`}>Edit</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/properties/${property.id}`} target="_blank">View Listing</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                  )
                })
               ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No properties found.
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
