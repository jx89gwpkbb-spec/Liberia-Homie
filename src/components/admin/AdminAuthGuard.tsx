'use client';

import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const [authStatus, setAuthStatus] = useState<'loading' | 'admin' | 'denied' | 'initializing'>('loading');

    useEffect(() => {
        const checkAdminStatus = async () => {
            if (isUserLoading || !firestore) return;

            if (!user) {
                router.push('/login');
                return;
            }

            // Super admin email is the primary gate.
            if (user.email === 'samuelknimelyjr@gmail.com') {
                const roleRef = doc(firestore, 'roles_admin', user.uid);
                const adminProfileRef = doc(firestore, 'admin_profiles', user.uid);

                const [roleSnap, profileSnap] = await Promise.all([getDoc(roleRef), getDoc(adminProfileRef)]);

                if (roleSnap.exists() && profileSnap.exists()) {
                    setAuthStatus('admin');
                } else {
                    // Profile or role doesn't exist, so create it.
                    setAuthStatus('initializing');
                    try {
                        toast({
                            title: "Setting Up Admin Profile",
                            description: "Please wait while we initialize your admin account.",
                        });

                        const batch = writeBatch(firestore);
                        const adminProfileData = {
                            id: user.uid,
                            firstName: user.displayName?.split(' ')[0] || 'Samuel',
                            lastName: user.displayName?.split(' ')[1] || 'Nimely',
                            email: user.email,
                            phoneNumber: user.phoneNumber || 'N/A',
                            creationDate: serverTimestamp(),
                            lastLogin: serverTimestamp(),
                            role: 'superadmin',
                            permissions: ['manage_properties', 'manage_users', 'view_analytics', 'full_system_management'],
                        };
                        
                        batch.set(adminProfileRef, adminProfileData, { merge: true });
                        batch.set(roleRef, { admin: true });

                        await batch.commit();

                        toast({ title: "Admin Profile Created", description: "Your admin account is ready."});
                        setAuthStatus('admin');

                    } catch (error) {
                        console.error('Error creating admin profile:', error);
                        toast({ title: "Profile Creation Failed", description: "Could not initialize your admin account.", variant: "destructive" });
                        setAuthStatus('denied');
                    }
                }
                return;
            }
            
            // For other potential admins, check the role document.
            const otherRoleRef = doc(firestore, 'roles_admin', user.uid);
            const otherDocSnap = await getDoc(otherRoleRef);
            if (otherDocSnap.exists()) {
                setAuthStatus('admin');
            } else {
                setAuthStatus('denied');
            }
        };

        checkAdminStatus();
    }, [user, isUserLoading, firestore, router, toast]);

    if (authStatus === 'loading' || authStatus === 'initializing' || isUserLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                {authStatus === 'initializing' && <p className="ml-4">Initializing admin account...</p>}
            </div>
        );
    }
    
    if (authStatus === 'denied') {
        return (
            <div className="flex flex-col h-screen items-center justify-center text-center p-6">
                <Shield className="w-16 h-16 text-destructive mb-4" />
                <h1 className="text-3xl font-bold">Access Denied</h1>
                <p className="text-muted-foreground mt-2">You do not have permission to view this page.</p>
                <p className="text-sm text-muted-foreground mt-1">Only designated administrators can access this area.</p>
                <Button onClick={() => router.push('/')} className="mt-6">Go to Homepage</Button>
            </div>
        );
    }

    return <>{children}</>;
}
