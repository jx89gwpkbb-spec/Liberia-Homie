'use client';
import { useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { AdminProfile } from '@/lib/types';


const adminProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().optional(),
});

type AdminProfileFormData = z.infer<typeof adminProfileSchema>;

export default function AdminProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const adminProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'admin_profiles', user.uid);
  }, [firestore, user]);

  const { data: adminProfile, isLoading: isProfileLoading } = useDoc<AdminProfile>(adminProfileRef);

  const form = useForm<AdminProfileFormData>({
    resolver: zodResolver(adminProfileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: ''
    }
  });

   useEffect(() => {
    if (adminProfile) {
      form.reset({
        firstName: adminProfile.firstName || '',
        lastName: adminProfile.lastName || '',
        phoneNumber: adminProfile.phoneNumber || '',
      });
    }
  }, [adminProfile, form]);
  
  const onSubmit = (data: AdminProfileFormData) => {
    if (!adminProfileRef) return;
    setIsSaving(true);
    setDocumentNonBlocking(adminProfileRef, {
        ...data,
        lastLogin: serverTimestamp(),
    }, { merge: true });
    toast({
      title: "Profile Updated",
      description: "Your admin profile has been updated.",
    });
    setIsSaving(false);
  };

  const getInitials = (name: string) => {
    if (!name) return 'A';
    return name.split(' ').map((n) => n[0]).join('');
  }

  const isLoading = isUserLoading || isProfileLoading;

  if (isLoading) {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">My Admin Profile</h1>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Skeleton className="h-10 w-24" />
                </CardFooter>
            </Card>
        </div>
    )
  }
  
   if (!adminProfile) {
    return (
      <div className="p-6 text-center flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <h1 className="text-2xl font-bold">Admin Profile Not Found</h1>
        <p className="text-muted-foreground">
          Your admin profile could not be loaded. This might be a permission issue.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline">My Admin Profile</h1>
        <p className="text-muted-foreground">View and manage your administrator profile.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
             <CardHeader>
                <CardTitle>Profile Details</CardTitle>
                <CardDescription>Update your personal information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={`https://picsum.photos/seed/${user?.uid}/80/80`} />
                        <AvatarFallback>{getInitials(adminProfile.firstName)}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-0.5">
                        <p className="font-semibold">{adminProfile.firstName} {adminProfile.lastName}</p>
                        <p className="text-sm text-muted-foreground">{adminProfile.email}</p>
                        <p className="text-xs text-muted-foreground uppercase">{adminProfile.role}</p>
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" {...form.register('firstName')} />
                         {form.formState.errors.firstName && <p className="text-sm text-destructive">{form.formState.errors.firstName.message}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" {...form.register('lastName')} />
                         {form.formState.errors.lastName && <p className="text-sm text-destructive">{form.formState.errors.lastName.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input id="phoneNumber" {...form.register('phoneNumber')} />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </CardFooter>
        </Card>
      </form>
    </div>
  );
}
