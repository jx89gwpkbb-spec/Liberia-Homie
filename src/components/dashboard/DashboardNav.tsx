"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, PlusCircle, BookOpenCheck, Heart, FileText, UserCircle, Briefcase, CalendarCheck, Bell, Megaphone } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';

const userNavItems = [
  { href: '/dashboard/bookings', label: 'My Bookings', icon: BookOpenCheck },
  { href: '/dashboard/visits', label: 'My Visits', icon: CalendarCheck },
  { href: '/dashboard/favorites', label: 'My Favorites', icon: Heart },
  { href: '/dashboard/documents', label: 'My Documents', icon: FileText },
];

const vendorNavItems = [
    { href: '/dashboard/properties', label: 'My Properties', icon: Package },
    { href: '/dashboard/vendor-bookings', label: 'Vendor Bookings', icon: Briefcase },
]

const sharedNavItems = [
    { href: '/dashboard/announcements', label: 'Announcements', icon: Megaphone },
    { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
    { href: '/dashboard/profile', label: 'My Profile', icon: UserCircle },
];

export function DashboardNav() {
  const pathname = usePathname();
  // In a real app, we would fetch the user's role and conditionally render menu items.
  // For this demo, we will assume a user can be both a renter and a vendor and show all items.
  
  return (
    <SidebarMenu>
      {userNavItems.map((item) => (
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
      {sharedNavItems.map((item) => (
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
