'use client';

import { useEffect, useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, where, serverTimestamp } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { SupportTicket } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, LifeBuoy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const ticketSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
});

type TicketFormData = z.infer<typeof ticketSchema>;

const statusConfig = {
    New: { color: "bg-blue-500" },
    "In Progress": { color: "bg-yellow-500" },
    Resolved: { color: "bg-green-500" },
    Closed: { color: "bg-gray-500" },
};

export default function MySupportPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<TicketFormData>();

  const ticketsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'tickets'), where('userId', '==', user.uid));
  }, [user, firestore]);

  const { data: tickets, isLoading: areTicketsLoading } = useCollection<SupportTicket>(ticketsQuery);

  const onSubmit = async (data: TicketFormData) => {
    if (!firestore || !user) {
      toast({ title: 'Error', description: 'Could not connect to our services.', variant: 'destructive'});
      return;
    }

    try {
        const ticketsCollection = collection(firestore, 'tickets');
        const newTicket = {
            ...data,
            name: user.displayName || 'N/A',
            email: user.email || 'N/A',
            userId: user.uid,
            status: 'New',
            priority: 'Medium',
            createdAt: serverTimestamp(),
        };
        
        await addDocumentNonBlocking(ticketsCollection, newTicket);

        toast({
            title: "Ticket Submitted!",
            description: "Our support team will get back to you shortly."
        });
        reset();
        
    } catch (error) {
        console.error("Failed to submit ticket:", error);
        toast({ title: "Submission Failed", description: "Something went wrong. Please try again.", variant: 'destructive'});
    }
  };

  const isLoading = isUserLoading || areTicketsLoading;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
          <LifeBuoy /> My Support
        </h1>
        <p className="text-muted-foreground">Submit a new request or track your existing tickets.</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
             <Card>
                <CardHeader>
                    <CardTitle>New Support Ticket</CardTitle>
                    <CardDescription>
                        Have an issue? Let us know.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input id="subject" {...register('subject')} />
                            {errors.subject && <p className="text-sm text-destructive">{errors.subject.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea id="message" rows={5} {...register('message')} />
                            {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Submit Ticket
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>

        <div className="md:col-span-2">
           <Card>
                <CardHeader>
                    <CardTitle>My Tickets</CardTitle>
                    <CardDescription>A list of your support requests.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Subject</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Submitted</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({length: 3}).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    </TableRow>
                                ))
                            ) : tickets && tickets.length > 0 ? (
                                tickets.map(ticket => {
                                    const currentStatus = statusConfig[ticket.status];
                                    return (
                                        <TableRow key={ticket.id}>
                                            <TableCell className="font-medium">{ticket.subject}</TableCell>
                                            <TableCell>
                                                <Badge className={cn("text-white", currentStatus?.color)}>
                                                    {ticket.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {ticket.createdAt ? formatDistanceToNow(ticket.createdAt.toDate(), { addSuffix: true }) : 'N/A'}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                        You have not submitted any support tickets.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}