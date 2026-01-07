'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

type Notification = {
    id: string;
    title: string;
    message: string;
    status: 'Sent' | 'Draft';
    createdAt: Date;
    sentAt?: Date;
}

export default function AdminNotificationsPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    
    // Placeholder for sent notifications
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const handleSendNotification = async () => {
        if (!title || !message) {
            toast({
                title: "Missing fields",
                description: "Please provide a title and message.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        // In a real application, you would have a backend service to handle sending notifications.
        // For this demo, we'll simulate it and add it to our local state.
        await new Promise(resolve => setTimeout(resolve, 1500));

        const newNotification: Notification = {
            id: `notif-${Date.now()}`,
            title,
            message,
            status: 'Sent',
            createdAt: new Date(),
            sentAt: new Date(),
        };

        setNotifications(prev => [newNotification, ...prev]);

        toast({
            title: "Notification Sent!",
            description: "Your notification has been sent to all users.",
        });

        setTitle('');
        setMessage('');
        setIsLoading(false);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">Notifications Center</h1>
                <p className="text-muted-foreground">Create and send announcements to your users.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Compose Notification</CardTitle>
                    <CardDescription>
                        Write a new notification to be sent to all users via push notifications.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input 
                            id="title" 
                            placeholder="e.g., Summer Promotion!"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea 
                            id="message" 
                            placeholder="Describe your announcement..."
                            rows={5}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                     <Button variant="outline" disabled={isLoading}>Save as Draft</Button>
                     <Button onClick={handleSendNotification} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Send Notification
                    </Button>
                </CardFooter>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Sent Notifications</CardTitle>
                    <CardDescription>A history of all previously sent notifications.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Sent At</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {notifications.length > 0 ? (
                                notifications.map(notif => (
                                    <TableRow key={notif.id}>
                                        <TableCell className="font-medium">{notif.title}</TableCell>
                                        <TableCell>
                                            <Badge variant={notif.status === 'Sent' ? 'default': 'secondary'}>{notif.status}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {notif.sentAt ? format(notif.sentAt, "MMM dd, yyyy 'at' h:mm a") : 'N/A'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                        No notifications have been sent yet.
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
