'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building } from 'lucide-react';
import type { UserProfile, VendorProfile } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const vendorProfileSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  businessEmail: z.string().email('A valid business email is required'),
  businessPhone: z.string().optional(),
});

type VendorProfileFormData = z.infer<typeof vendorProfileSchema>;

export default function VendorSettingsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isUserProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const vendorProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'vendors', user.uid);
  }, [firestore, user]);
  
  const { data: vendorProfile, isLoading: isVendorProfileLoading } = useDoc<VendorProfile>(vendorProfileRef);

  const form = useForm<VendorProfileFormData>({
    resolver: zodResolver(vendorProfileSchema),
    defaultValues: {
      businessName: '',
      businessEmail: '',
      businessPhone: '',
    },
  });

  useEffect(() => {
    if (vendorProfile) {
      form.reset({
        businessName: vendorProfile.businessName || '',
        businessEmail: vendorProfile.businessEmail || '',
        businessPhone: vendorProfile.businessPhone || '',
      });
    }
  }, [vendorProfile, form]);

  const onSubmit = (data: VendorProfileFormData) => {
    if (!vendorProfileRef || !user) return;
    setIsSaving(true);
    const vendorData = {
      ...data,
      userId: user.uid,
      updatedAt: serverTimestamp(),
    };
    setDocumentNonBlocking(vendorProfileRef, vendorData, { merge: true });
    toast({
        title: "Settings Saved",
        description: "Your vendor profile has been updated.",
    });
    setIsSaving(false);
  }

  const isLoading = isUserLoading || isUserProfileLoading || isVendorProfileLoading;

  if (isLoading) {
    return <SettingsPageSkeleton />;
  }
  
  if (userProfile?.role !== 'vendor') {
      return (
          <Alert>
              <Building className="h-4 w-4" />
              <AlertTitle>Vendor Access Only</AlertTitle>
              <AlertDescription>
                  This page is only for users with a vendor account.
              </AlertDescription>
          </Alert>
      )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Vendor Settings</h1>
        <p className="text-muted-foreground">Manage your public business profile and payout information.</p>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
            <CardHeader>
                <CardTitle>Business Profile</CardTitle>
                <CardDescription>This information will be displayed publicly on your property listings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="businessName">Business Name</Label>
                        <Input id="businessName" {...form.register('businessName')} placeholder="e.g. Acme Rentals Inc." />
                        {form.formState.errors.businessName && <p className="text-sm text-destructive">{form.formState.errors.businessName.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="businessEmail">Business Email</Label>
                        <Input id="businessEmail" type="email" {...form.register('businessEmail')} placeholder="contact@acmerentals.com" />
                        {form.formState.errors.businessEmail && <p className="text-sm text-destructive">{form.formState.errors.businessEmail.message}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="businessPhone">Business Phone</Label>
                        <Input id="businessPhone" {...form.register('businessPhone')} placeholder="+123456789" />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Business Info
                </Button>
            </CardFooter>
        </Card>
      </form>
       <Card>
          <CardHeader>
            <CardTitle>Payout Settings</CardTitle>
            <CardDescription>Manage how you receive payments for bookings. (This is a placeholder)</CardDescription>
          </CardHeader>
          <CardContent>
              <Alert variant="default">
                <Building className="h-4 w-4" />
                <AlertTitle>Coming Soon!</AlertTitle>
                <AlertDescription>
                    We are working hard to integrate secure payment solutions. Payout settings will be available here soon.
                </AlertDescription>
              </Alert>
          </CardContent>
        </Card>
    </div>
  );
}


function SettingsPageSkeleton() {
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
                    <div className="grid md:grid-cols-2 gap-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
                 <CardFooter className="flex justify-end pt-6">
                    <Skeleton className="h-10 w-36" />
                </CardFooter>
            </Card>
        </div>
    )
}
