'use client';
import { useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  const adminProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'admin_profiles', user.uid);
  }, [firestore, user]);

  const { data: adminProfile, isLoading: isProfileLoading } = useDoc(adminProfileRef);

  useEffect(() => {
    const createProfileIfNeeded = async () => {
      if (isUserLoading || isProfileLoading || !user || !firestore || adminProfile) {
        return;
      }
      
      if (user.email !== 'samuelknimelyjr@gmail.com') {
        return;
      }

      setIsCreatingProfile(true);
      toast({
        title: "Setting Up Admin Profile",
        description: "Please wait while we initialize your admin account.",
      });

      try {
        const batch = writeBatch(firestore);

        const adminProfileRef = doc(firestore, 'admin_profiles', user.uid);
        const roleRef = doc(firestore, 'roles_admin', user.uid);

        const adminProfileData = {
          id: user.uid,
          firstName: user.displayName?.split(' ')[0] || 'Samuel',
          lastName: user.displayName?.split(' ')[1] || 'Nimely',
          email: user.email || 'samuelknimelyjr@gmail.com',
          phoneNumber: user.phoneNumber || 'N/A',
          creationDate: serverTimestamp(),
          lastLogin: serverTimestamp(),
          role: 'superadmin',
          permissions: ['manage_properties', 'manage_users', 'view_analytics', 'full_system_management'],
        };
        
        batch.set(adminProfileRef, adminProfileData, { merge: true });
        batch.set(roleRef, { admin: true });

        await batch.commit();

        toast({ title: "Admin Profile Created", description: "Your admin account is ready. Refreshing..."});
        // The useDoc hook will update, triggering a re-render. A reload can ensure everything is synced.
        router.refresh();

      } catch (error) {
        console.error('Error creating admin profile:', error);
         toast({ title: "Profile Creation Failed", description: "Could not initialize your admin account.", variant: "destructive" });
      } finally {
         setIsCreatingProfile(false);
      }
    };
    
    createProfileIfNeeded();

  }, [adminProfile, isProfileLoading, user, isUserLoading, firestore, toast, router]);
  
  const isLoading = isUserLoading || isProfileLoading || isCreatingProfile;
  
  if (isLoading) {
    return (
        <div className="p-6">
            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </CardContent>
            </Card>
        </div>
    )
  }

  if (!user) {
     return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground mb-4">
          You must be logged in to view this page.
        </p>
        <Button onClick={() => router.push('/login')}>
          Go to Login
        </Button>
      </div>
    );
  }

  if (!adminProfile) {
    // This state should now be very brief as the profile is created automatically.
    return (
      <div className="p-6 text-center flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <h1 className="text-2xl font-bold">Setting Up Your Admin Profile...</h1>
        <p className="text-muted-foreground">
          Please wait a moment.
        </p>
      </div>
    );
  }
  
  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('');
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={`https://picsum.photos/seed/${user?.uid}/80/80`} />
            <AvatarFallback>{getInitials(adminProfile.firstName || adminProfile.email || 'A')}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-3xl">{adminProfile.firstName} {adminProfile.lastName}</CardTitle>
            <p className="text-muted-foreground">{adminProfile.email}</p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Role</p>
            <p className="font-semibold">{adminProfile.role}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
            <p className="font-semibold">{adminProfile.phoneNumber}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Member Since</p>
            <p className="font-semibold">{adminProfile.creationDate?.toDate().toLocaleDateString()}</p>
          </div>
           <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Last Login</p>
            <p className="font-semibold">{adminProfile.lastLogin?.toDate().toLocaleString()}</p>
          </div>
           <div className="space-y-1 md:col-span-2">
            <p className="text-sm font-medium text-muted-foreground">Permissions</p>
            <div className="flex flex-wrap gap-2">
                {adminProfile.permissions.map((p: string) => (
                    <div key={p} className="bg-secondary text-secondary-foreground text-xs font-semibold px-2 py-1 rounded-full">{p}</div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
