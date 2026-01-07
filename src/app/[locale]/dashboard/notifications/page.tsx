'use client';

import { useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { UserProfile, NotificationSettings } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

const notificationsSchema = z.object({
  newListingAlerts: z.boolean().default(false),
  priceDropAlerts: z.boolean().default(false),
  rentReminders: z.boolean().default(false),
  marketingEmails: z.boolean().default(false),
});

type NotificationsFormData = z.infer<typeof notificationsSchema>;

export default function MyNotificationsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore || !user.emailVerified) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } =
    useDoc<UserProfile>(userProfileRef);

  const form = useForm<NotificationsFormData>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: {
      newListingAlerts: false,
      priceDropAlerts: false,
      rentReminders: false,
      marketingEmails: false,
    },
  });

  useEffect(() => {
    if (userProfile?.notificationSettings) {
      form.reset(userProfile.notificationSettings);
    }
  }, [userProfile, form]);

  const onSubmit = (data: NotificationsFormData) => {
    if (!userProfileRef || !user) return;
    setDocumentNonBlocking(userProfileRef, { 
      id: user.uid, // Add this line to satisfy security rule
      notificationSettings: data 
    }, { merge: true });
    toast({
      title: "Preferences Saved",
      description: "Your notification settings have been updated.",
    });
  };

  if (isUserLoading || isProfileLoading) {
    return <NotificationsPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Notification Preferences</h1>
        <p className="text-muted-foreground">Manage how you receive communications from us.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Property Alerts</CardTitle>
            <CardDescription>Get notified about properties that matter to you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="newListingAlerts" className="text-base">New Listing Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications when new properties match your saved searches.
                </p>
              </div>
              <Switch
                id="newListingAlerts"
                checked={form.watch('newListingAlerts')}
                onCheckedChange={(checked) => form.setValue('newListingAlerts', checked)}
              />
            </div>
             <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="priceDropAlerts" className="text-base">Price Drop Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get alerts when prices drop for your favorited properties.
                </p>
              </div>
              <Switch
                id="priceDropAlerts"
                checked={form.watch('priceDropAlerts')}
                onCheckedChange={(checked) => form.setValue('priceDropAlerts', checked)}
              />
            </div>
          </CardContent>
          <Separator />
           <CardHeader>
            <CardTitle>Account & Booking Alerts</CardTitle>
            <CardDescription>Stay informed about your account and booking activity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="rentReminders" className="text-base">Rent Reminders</Label>
                 <p className="text-sm text-muted-foreground">
                  Receive reminders for upcoming rent payments on long-term stays.
                </p>
              </div>
              <Switch
                id="rentReminders"
                checked={form.watch('rentReminders')}
                onCheckedChange={(checked) => form.setValue('rentReminders', checked)}
              />
            </div>
          </CardContent>
           <Separator />
           <CardHeader>
            <CardTitle>Marketing & Promotions</CardTitle>
            <CardDescription>Receive news, offers, and promotions from Homie Stays.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="marketingEmails" className="text-base">Marketing Emails</Label>
                 <p className="text-sm text-muted-foreground">
                  Get emails about new features, special offers, and promotions.
                </p>
              </div>
              <Switch
                id="marketingEmails"
                checked={form.watch('marketingEmails')}
                onCheckedChange={(checked) => form.setValue('marketingEmails', checked)}
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end border-t pt-6">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Preferences
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}


function NotificationsPageSkeleton() {
    return (
        <div className="space-y-6">
            <div>
                <Skeleton className="h-9 w-72" />
                <Skeleton className="h-4 w-96 mt-2" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-80 mt-1" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                </CardContent>
                 <CardFooter className="flex justify-end border-t pt-6">
                    <Skeleton className="h-10 w-36" />
                </CardFooter>
            </Card>
        </div>
    )
}
