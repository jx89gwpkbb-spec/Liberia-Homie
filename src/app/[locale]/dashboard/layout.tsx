import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Logo } from '@/components/layout/Logo';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { UserNav } from '@/components/auth/UserNav';
import { Home } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
