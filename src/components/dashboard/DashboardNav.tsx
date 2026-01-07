"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, PlusCircle, BookOpenCheck, Heart, FileText, UserCircle, Briefcase } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';

const navItems = [
  { href: '/dashboard/bookings', label: 'My Bookings', icon: BookOpenCheck },
  { href: '/dashboard/favorites', label: 'My Favorites', icon: Heart },
  { href: '/dashboard/documents', label: 'My Documents', icon: FileText },
  { href: '/dashboard/profile', label: 'My Profile', icon: UserCircle },
];

const vendorNavItems = [
    { href: '/dashboard/properties', label: 'My Properties', icon: Package },
    { href: '/dashboard/vendor-bookings', label: 'Vendor Bookings', icon: Briefcase },
    { href: '/dashboard/properties/new', label: 'Add Property', icon: PlusCircle },
]

export function DashboardNav() {
  const pathname = usePathname();
  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.label}>
          <Link href={item.href} passHref>
              <SidebarMenuButton isActive={pathname.startsWith(item.href)} tooltip={item.label}>
                <item.icon className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
              </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
      {vendorNavItems.map((item) => (
         <SidebarMenuItem key={item.label}>
            <Link href={item.href} passHref>
                <SidebarMenuButton isActive={pathname.startsWith(item.href)} tooltip={item.label}>
                    <item.icon className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                </SidebarMenuButton>
            </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
