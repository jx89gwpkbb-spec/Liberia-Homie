'use client';
import { useMemo, useEffect } from 'react';
import { useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import type { Setting } from '@/lib/types';

const settingsSchema = z.object({
  siteName: z.string().min(1, 'Site name is required'),
  contactEmail: z.string().email('Invalid email address'),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function AdminSettingsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const settingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'global');
  }, [firestore]);

  const { data: settings, isLoading } = useDoc<Setting>(settingsRef);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  });
  
  useEffect(() => {
    if (settings) {
        reset({
            siteName: settings.siteName,
            contactEmail: settings.contactEmail,
        });
    }
  }, [settings, reset]);
  
  const onSubmit = (data: SettingsFormData) => {
    if (!settingsRef) return;
    setDocumentNonBlocking(settingsRef, data, { merge: true });
    toast({
      title: "Settings Saved",
      description: "Global application settings have been updated.",
    });
  };
  
  if (isLoading) {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">Global Settings</h1>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-24 ml-auto" />
                </CardFooter>
            </Card>
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Global Settings</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Application Settings</CardTitle>
            <CardDescription>Manage site-wide settings for Homie Liberia.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input id="siteName" {...register('siteName')} />
              {errors.siteName && <p className="text-sm text-destructive">{errors.siteName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Public Contact Email</Label>
              <Input id="contactEmail" type="email" {...register('contactEmail')} />
              {errors.contactEmail && <p className="text-sm text-destructive">{errors.contactEmail.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Settings
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
