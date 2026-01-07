'use client';

import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, orderBy, doc } from 'firebase/firestore';
import type { Announcement, UserProfile } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Megaphone } from 'lucide-react';
import { useDoc } from '@/firebase/firestore/use-doc';

export default function AnnouncementsPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const announcementsQuery = useMemoFirebase(() => {
    if (!firestore || !userProfile) return null;
    
    const relevantAudiences = ['all', userProfile.role];

    return query(
        collection(firestore, 'announcements'), 
        where('status', '==', 'published'),
        where('targetAudience', 'in', relevantAudiences),
        orderBy('publishedAt', 'desc')
    );
  }, [firestore, userProfile]);

  const { data: announcements, isLoading: areAnnouncementsLoading } = useCollection<Announcement>(announcementsQuery);

  const isLoading = isProfileLoading || areAnnouncementsLoading;

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2"><Megaphone /> Announcements</h1>
        <p className="text-muted-foreground">Latest updates and news from Homie Liberia.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
            {Array.from({length: 3}).map((_, i) => (
                 <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/4 mt-2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6 mt-2" />
                    </CardContent>
                </Card>
            ))}
        </div>
      ) : announcements && announcements.length > 0 ? (
        <div className="space-y-4">
            {announcements.map(announcement => (
                <Card key={announcement.id}>
                    <CardHeader>
                        <CardTitle>{announcement.title}</CardTitle>
                        {announcement.publishedAt && (
                             <CardDescription>
                                Published on {format(announcement.publishedAt.toDate(), 'MMMM dd, yyyy')}
                            </CardDescription>
                        )}
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground whitespace-pre-wrap">{announcement.content}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <Megaphone className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">No Announcements</h2>
            <p className="mt-2 text-muted-foreground">
                There are no new announcements at the moment. Please check back later.
            </p>
        </div>
      )}
    </div>
  );
}
