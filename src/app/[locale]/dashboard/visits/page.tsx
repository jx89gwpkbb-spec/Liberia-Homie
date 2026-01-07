'use client';
import { useMemo, useEffect, useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { collection, query, where, getDocs, doc } from 'firebase/firestore';
import type { Visit, Property } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Image from "next/image";
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
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
import { Check, Clock, X, MoreHorizontal } from 'lucide-react';

type EnrichedVisit = Visit & {
  propertyName?: string;
  propertyImage?: string;
};

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "bg-yellow-500",
  },
  confirmed: {
    label: "Confirmed",
    icon: Check,
    color: "bg-green-500",
  },
  cancelled: {
    label: "Cancelled",
    icon: X,
    color: "bg-red-500",
  },
};


export default function MyVisitsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [enrichedVisits, setEnrichedVisits] = useState<EnrichedVisit[]>([]);
  const { toast } = useToast();

  const visitsQuery = useMemoFirebase(() => {
    if (!firestore || !user || !user.emailVerified) return null;
    return query(collection(firestore, 'visits'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: visits, isLoading: areVisitsLoading } = useCollection<Visit>(visitsQuery);

  useEffect(() => {
    const enrichVisits = async () => {
      if (!visits || !firestore) return;

      const propertyIds = [...new Set(visits.map(v => v.propertyId))];
      if (propertyIds.length === 0) {
        setEnrichedVisits(visits);
        return;
      }
      
      const properties: {[key: string]: Property} = {};
      
      // Firestore 'in' query limited to 30, but we'll use 10 for safety
      for(let i = 0; i < propertyIds.length; i += 10) {
        const chunk = propertyIds.slice(i, i + 10);
        const propertiesQuery = query(collection(firestore, 'properties'), where('id', 'in', chunk));
        const snapshot = await getDocs(propertiesQuery);
        snapshot.docs.forEach(doc => {
            properties[doc.id] = { id: doc.id, ...doc.data() } as Property;
        });
      }
      
      const newEnrichedVisits = visits.map(visit => {
        const property = properties[visit.propertyId];
        return {
          ...visit,
          propertyName: property?.name,
          propertyImage: property?.images[0],
        };
      });
      setEnrichedVisits(newEnrichedVisits);
    };
    enrichVisits();
  }, [visits, firestore]);

  const handleCancelVisit = (visitId: string) => {
    if (!firestore || !visitId) return;
    const visitRef = doc(firestore, 'visits', visitId);
    setDocumentNonBlocking(visitRef, { status: 'cancelled' }, { merge: true });
    toast({
        title: "Visit Cancelled",
        description: "Your visit request has been cancelled.",
    })
  };

  const isLoading = isUserLoading || areVisitsLoading;

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline">My Visits</h1>
        <p className="text-muted-foreground">An overview of your scheduled property tours.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visit Requests</CardTitle>
          <CardDescription>A list of your pending and confirmed property visits.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Visit Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({length: 2}).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-16 w-16 rounded-md" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : enrichedVisits && enrichedVisits.length > 0 ? (
                enrichedVisits.map((visit) => {
                  const currentStatus = statusConfig[visit.status];
                  return (
                      <TableRow key={visit.id}>
                        <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                            {visit.propertyImage && <Image src={visit.propertyImage} alt={visit.propertyName || 'Property'} width={64} height={64} className="rounded-md object-cover" />}
                            <p className="font-semibold">{visit.propertyName || visit.propertyId}</p>
                        </div>
                        </TableCell>
                        <TableCell>
                        {format(visit.visitDate.toDate(), 'EEE, MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("text-white", currentStatus.color)}>
                            <currentStatus.icon className="mr-1.5 h-3 w-3" />
                            {currentStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {visit.status === 'pending' && (
                             <AlertDialog>
                               <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">Cancel</Button>
                               </AlertDialogTrigger>
                               <AlertDialogContent>
                                 <AlertDialogHeader>
                                   <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                   <AlertDialogDescription>
                                     This will cancel your visit request. This action cannot be undone.
                                   </AlertDialogDescription>
                                 </AlertDialogHeader>
                                 <AlertDialogFooter>
                                   <AlertDialogCancel>Go Back</AlertDialogCancel>
                                   <AlertDialogAction onClick={() => handleCancelVisit(visit.id!)} className="bg-destructive hover:bg-destructive/90">Confirm Cancellation</AlertDialogAction>
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
                  <TableCell colSpan={4} className="h-24 text-center">
                    You haven't scheduled any visits yet.
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
