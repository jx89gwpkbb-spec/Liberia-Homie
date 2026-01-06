'use client';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Logo } from '@/components/layout/Logo';
import { AdminNav } from '@/components/admin/AdminNav';
import { UserNav } from '@/components/auth/UserNav';
import { Home, Shield } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAdminStatus = async () => {
            if (isUserLoading) return;
            if (!user) {
                router.push('/login');
                return;
            }

            const adminRoleRef = doc(firestore, 'roles_admin', user.uid);
            try {
                const docSnap = await getDoc(adminRoleRef);
                if (docSnap.exists()) {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
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
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
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


  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <AdminNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
            <SidebarTrigger className="md:hidden" />
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              <Home className="h-5 w-5" />
              <span className="sr-only">Back to Home</span>
            </Link>
            <div className="flex-1 text-center font-semibold text-lg">
                Admin Dashboard
            </div>
            <UserNav />
        </header>
        <main className="flex-1 p-4 md:p-6">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
