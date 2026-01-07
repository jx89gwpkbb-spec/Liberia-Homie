'use client';
import { useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { SupportTicket } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusConfig = {
    New: { color: "bg-blue-500" },
    "In Progress": { color: "bg-yellow-500" },
    Resolved: { color: "bg-green-500" },
    Closed: { color: "bg-gray-500" },
};

export default function AdminSupportPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const ticketsCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'tickets');
  }, [firestore]);

  const { data: tickets, isLoading } = useCollection<SupportTicket>(ticketsCollectionRef);

  const handleStatusChange = (ticketId: string, status: SupportTicket['status']) => {
    if (!firestore) return;
    const ticketRef = doc(firestore, 'tickets', ticketId);
    setDocumentNonBlocking(ticketRef, { status: status }, { merge: true });
    toast({
        title: `Ticket Updated`,
        description: `Ticket has been set to "${status}".`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Support Tickets</h1>
        <p className="text-muted-foreground">Manage user-submitted support requests.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tickets</CardTitle>
          <CardDescription>A complete list of all support tickets.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : tickets && tickets.length > 0 ? (
                tickets.map((ticket) => {
                  const currentStatus = statusConfig[ticket.status];
                  return (
                      <TableRow key={ticket.id}>
                         <TableCell>
                            <Badge className={cn("text-white hover:bg-opacity-80", currentStatus.color)}>
                                {ticket.status}
                            </Badge>
                         </TableCell>
                        <TableCell className="font-medium">{ticket.subject}</TableCell>
                        <TableCell>
                            <div>{ticket.name}</div>
                            <div className="text-xs text-muted-foreground">{ticket.email}</div>
                        </TableCell>
                        <TableCell>{ticket.createdAt ? formatDistanceToNow(ticket.createdAt.toDate(), { addSuffix: true }) : 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                              {Object.keys(statusConfig).map(status => (
                                <DropdownMenuItem 
                                  key={status} 
                                  onClick={() => handleStatusChange(ticket.id!, status as SupportTicket['status'])}
                                  disabled={ticket.status === status}
                                >
                                  {status}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                  )
                })
               ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No support tickets found.
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

    