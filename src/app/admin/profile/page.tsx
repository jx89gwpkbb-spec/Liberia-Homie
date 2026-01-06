'use client';
import { useMemo } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const adminProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'admin_profiles', user.uid);
  }, [firestore, user]);

  const { data: adminProfile, isLoading: isProfileLoading } = useDoc(adminProfileRef);
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
        <p className="text-muted-foreground">
          You do not have permission to view this page. If you believe this is an error, please contact support.
        </p>
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
            <p className="font-semibold">{new Date(adminProfile.creationDate).toLocaleDateString()}</p>
          </div>
           <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Last Login</p>
            <p className="font-semibold">{new Date(adminProfile.lastLogin).toLocaleString()}</p>
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
