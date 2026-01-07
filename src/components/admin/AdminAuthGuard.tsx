'use client';

import { useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAdminStatus = async () => {
            if (isUserLoading || !firestore) return;
            if (!user) {
                router.push('/login');
                return;
            }

            // Super admin check by email is the primary gate
            const isSuperAdmin = user.email === 'samuelknimelyjr@gmail.com';
            if (!isSuperAdmin) {
                 setIsAdmin(false);
                 setIsLoading(false);
                 return;
            }

            // For super admin, ensure their profile exists.
            const adminProfileRef = doc(firestore, 'admin_profiles', user.uid);
            try {
                const docSnap = await getDoc(adminProfileRef);
                if (docSnap.exists()) {
                    setIsAdmin(true);
                } else {
                    // Profile doesn't exist, so we create it.
                    toast({
                        title: "Setting up Admin Profile",
                        description: "Please wait while we initialize your admin account.",
                    });
                     const adminProfileData = {
                        id: user.uid,
                        firstName: user.displayName?.split(' ')[0] || 'Admin',
                        lastName: user.displayName?.split(' ')[1] || 'User',
                        email: user.email || 'No email',
                        phoneNumber: user.phoneNumber || 'No phone number',
                        creationDate: serverTimestamp(),
                        lastLogin: serverTimestamp(),
                        role: 'superadmin',
                        permissions: ['manage_properties', 'manage_users', 'view_analytics', 'full_system_management'],
                    };
                    // Use the non-blocking update
                    setDocumentNonBlocking(adminProfileRef, adminProfileData, { merge: true });
                    // Assume success and set admin status. The UI will catch up.
                    setIsAdmin(true);
                }
            } catch (error) {
                console.error("Error checking/creating admin profile:", error);
                setIsAdmin(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAdminStatus();
    }, [user, isUserLoading, firestore, router, toast]);

    if (isLoading || isUserLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!isAdmin) {
        return (
            <div className="flex flex-col h-screen items-center justify-center text-center p-6">
                <Shield className="w-16 h-16 text-destructive mb-4" />
                <h1 className="text-3xl font-bold">Access Denied</h1>
                <p className="text-muted-foreground mt-2">You do not have permission to view this page.</p>
                <p className="text-sm text-muted-foreground mt-1">Only the designated Super Admin can access this area.</p>
                <Button onClick={() => router.push('/')} className="mt-6">Go to Homepage</Button>
            </div>
        );
    }

    return <>{children}</>;
}
