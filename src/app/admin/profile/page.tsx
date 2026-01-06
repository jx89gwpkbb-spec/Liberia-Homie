'use client';
import { useMemo, useEffect, useState } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function AdminProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  const adminProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'admin_profiles', user.uid);
  }, [firestore, user]);

  const { data: adminProfile, isLoading: isProfileLoading } = useDoc(adminProfileRef);

  const handleCreateProfile = async () => {
    if (!user || !firestore) return;
    setIsCreatingProfile(true);
    try {
      const adminProfileData = {
        id: user.uid,
        firstName: user.displayName?.split(' ')[0] || 'Admin',
        lastName: user.displayName?.split(' ')[1] || 'User',
        email: user.email || 'No email',
        phoneNumber: user.phoneNumber || 'No phone number',
        creationDate: serverTimestamp(),
        lastLogin: serverTimestamp(),
        role: 'superadmin',
        permissions: ['manage_properties', 'manage_users', 'view_analytics'],
      };
      
      const roleRef = doc(firestore, 'roles_admin', user.uid);
      
      // Use non-blocking writes
      setDoc(adminProfileRef, adminProfileData, { merge: true }).catch(err => console.error(err));
      setDoc(roleRef, { admin: true }).catch(err => console.error(err));

    } catch (error) {
      console.error('Error creating admin profile:', error);
    } finally {
      // Optimistic UI, we don't wait for the write to complete
      setIsCreatingProfile(false);
    }
  };
  
  const isLoading = isUserLoading || isProfileLoading;
  
  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('');
  }

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

  if (!adminProfile) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground mb-4">
          You do not have an admin profile. Create one to gain access.
        </p>
        <Button onClick={handleCreateProfile} disabled={isCreatingProfile}>
          {isCreatingProfile ? 'Creating Profile...' : 'Create Admin Profile'}
        </Button>
      </div>
    );
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
