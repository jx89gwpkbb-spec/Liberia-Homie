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
    const [authStatus, setAuthStatus] = useState<'loading' | 'admin' | 'denied'>('loading');

    useEffect(() => {
        const checkAdminStatus = async () => {
            if (isUserLoading || !firestore) return;

            if (!user) {
                router.push('/login');
                return;
            }

            // Super admin email check is the primary gate.
            if (user.email === 'samuelknimelyjr@gmail.com') {
                 const roleRef = doc(firestore, 'roles_admin', user.uid);
                try {
                    const docSnap = await getDoc(roleRef);
                    if (docSnap.exists()) {
                        setAuthStatus('admin');
                    } else {
                        // The profile page will handle creation. For now, deny access until it's created.
                        // This prevents race conditions or errors if they land on a different admin page first.
                        router.push('/admin/profile'); 
                    }
                } catch (error) {
                    console.error("Error checking admin role:", error);
                    setAuthStatus('denied');
                }
            } else {
                setAuthStatus('denied');
            }
        };

        checkAdminStatus();
    }, [user, isUserLoading, firestore, router]);

    if (authStatus === 'loading' || isUserLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
