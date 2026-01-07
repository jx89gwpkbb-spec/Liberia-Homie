'use client';

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, Save, Megaphone } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Announcement } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminNotificationsPage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [isLoading, setIsLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [targetAudience, setTargetAudience] = useState<'all' | 'renters' | 'vendors'>('all');

    const announcementsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'announcements');
    }, [firestore]);

    const { data: announcements, isLoading: isLoadingAnnouncements } = useCollection<Announcement>(announcementsQuery);

    const handleSave = (status: 'draft' | 'published') => {
        if (!title || !content || !firestore) {
            toast({
                title: "Missing fields",
                description: "Please provide a title and content.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        const announcementsCollection = collection(firestore, 'announcements');
        const newAnnouncement: Omit<Announcement, 'id'> = {
            title,
            content,
            status,
            targetAudience,
            createdAt: serverTimestamp(),
            ...(status === 'published' && { publishedAt: serverTimestamp() }),
        };
        
        addDocumentNonBlocking(announcementsCollection, newAnnouncement);

        toast({
            title: status === 'published' ? "Announcement Published!" : "Draft Saved!",
            description: `Your announcement has been successfully ${status}.`,
        });

        setTitle('');
        setContent('');
        setTargetAudience('all');
        setIsLoading(false);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline flex items-center gap-2"><Megaphone /> Announcements</h1>
                <p className="text-muted-foreground">Create and publish announcements for your users.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Compose Announcement</CardTitle>
                    <CardDescription>
                        Write a new announcement to be published.
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
                        <Label htmlFor="content">Content</Label>
                        <Textarea 
                            id="content" 
                            placeholder="Describe your announcement..."
                            rows={5}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="targetAudience">Target Audience</Label>
                        <Select value={targetAudience} onValueChange={(v) => setTargetAudience(v as any)}>
                            <SelectTrigger id="targetAudience" className="w-[180px]">
                                <SelectValue placeholder="Select audience" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Users</SelectItem>
                                <SelectItem value="renters">Renters Only</SelectItem>
                                <SelectItem value="vendors">Vendors Only</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                     <Button variant="outline" onClick={() => handleSave('draft')} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save as Draft
                    </Button>
                     <Button onClick={() => handleSave('published')} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Publish Now
                    </Button>
                </CardFooter>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Announcement History</CardTitle>
                    <CardDescription>A log of all past announcements.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Audience</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingAnnouncements ? (
                                Array.from({length: 3}).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    </TableRow>
                                ))
                            ) : announcements && announcements.length > 0 ? (
                                announcements.map(notif => (
                                    <TableRow key={notif.id}>
                                        <TableCell className="font-medium">{notif.title}</TableCell>
                                        <TableCell>
                                            <Badge variant={notif.status === 'published' ? 'default': 'secondary'}>{notif.status}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{notif.targetAudience}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {notif.publishedAt ? format(notif.publishedAt.toDate(), "MMM dd, yyyy 'at' h:mm a") : format(notif.createdAt.toDate(), "MMM dd, yyyy")}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No announcements have been created yet.
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
