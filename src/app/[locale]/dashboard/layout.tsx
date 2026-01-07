
'use client';

import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Logo } from '@/components/layout/Logo';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { UserNav } from '@/components/auth/UserNav';
import { Home, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Wait until the auth state is loaded
    if (isUserLoading) {
      return;
    }

    // If there's no user, redirect to login
    if (!user) {
      router.push('/login');
      return;
    }

    // If the user exists but their email is not verified, redirect to verification page
    if (user && !user.emailVerified) {
      router.push('/verify-email');
      return;
    }
  }, [user, isUserLoading, router]);

  // While loading auth state, show a loader
  if (isUserLoading || !user || (user && !user.emailVerified)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Once verified, render the dashboard
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <DashboardNav />
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
                Dashboard
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
