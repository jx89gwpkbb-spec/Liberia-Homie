'use client';

import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAdminStatus = async () => {
            if (isUserLoading || !firestore) return;
            if (!user) {
                router.push('/login');
                return;
            }

            const adminRoleRef = doc(firestore, 'roles_admin', user.uid);
            try {
                const docSnap = await getDoc(adminRoleRef);
                // Also check if the user is the hardcoded super-admin
                const isSuperAdmin = user.email === 'samuelknimelyjr@gmail.com';
                setIsAdmin(docSnap.exists() || isSuperAdmin);
            } catch (error) {
                console.error("Error checking admin status:", error);
                setIsAdmin(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAdminStatus();
    }, [user, isUserLoading, firestore, router]);

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
                <p className="text-sm text-muted-foreground mt-1">Please contact an administrator if you believe this is a mistake.</p>
                <Button onClick={() => router.push('/')} className="mt-6">Go to Homepage</Button>
            </div>
        );
    }

    return <>{children}</>;
}
