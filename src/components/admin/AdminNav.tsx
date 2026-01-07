"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Users, BookOpenCheck, UserCircle, Store, Shield } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';

const navItems = [
  { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/vendors', label: 'Vendors', icon: Store },
  { href: '/admin/admins', label: 'Admins', icon: Shield },
  { href: '/admin/properties', label: 'Properties', icon: Package },
  { href: '/admin/bookings', label: 'Bookings', icon: BookOpenCheck },
  { href: '/admin/profile', label: 'My Profile', icon: UserCircle },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.label}>
          <Link href={item.href} passHref>
              <SidebarMenuButton isActive={pathname === item.href} tooltip={item.label}>
                <item.icon className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
              </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
