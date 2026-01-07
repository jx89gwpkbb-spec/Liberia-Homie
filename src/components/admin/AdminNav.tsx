"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Users, BookOpenCheck, UserCircle, Store, Shield, Settings, Megaphone, LifeBuoy } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';

const navItems = [
  { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/vendors', label: 'Vendors', icon: Store },
  { href: '/admin/admins', label: 'Admins', icon: Shield },
  { href: '/admin/properties', label: 'Properties', icon: Package },
  { href: '/admin/bookings', label: 'Bookings', icon: BookOpenCheck },
  { href: '/admin/notifications', label: 'Notifications', icon: Megaphone },
  { href: '/admin/support', label: 'Support', icon: LifeBuoy },
  { href: '/admin/profile', label: 'My Profile', icon: UserCircle },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();
  // Remove locale from pathname for comparison
  const basePath = pathname.split('/').slice(2).join('/');
  
  return (
    <SidebarMenu>
      {navItems.map((item) => {
        const itemPath = item.href.startsWith('/') ? item.href.substring(1) : item.href;
        const isActive = basePath === itemPath;
        return (
          <SidebarMenuItem key={item.label}>
            <Link href={item.href} passHref>
                <SidebarMenuButton isActive={isActive} tooltip={item.label}>
                  <item.icon className="h-5 w-5" />
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  );
}
