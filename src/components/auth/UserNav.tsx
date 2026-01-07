'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { Shield } from 'lucide-react';

export function UserNav() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  
  const adminRoleRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'roles_admin', user.uid);
  }, [user, firestore]);
  
  const { data: adminRole } = useDoc(adminRoleRef);
  const isAdmin = !!adminRole;

  const handleLogout = () => {
    if (auth) {
        signOut(auth);
    }
    router.push('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  if (isUserLoading) {
    return <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />;
  }
  
  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            {user.photoURL ? (
                <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />
            ) : (
                <AvatarImage src={`https://picsum.photos/seed/${user.uid}/40/40`} alt={user.displayName || 'User'} data-ai-hint="person portrait" />
            )}
            <AvatarFallback>
              {user.displayName ? getInitials(user.displayName) : user.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.displayName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/dashboard" passHref>
            <DropdownMenuItem>Dashboard</DropdownMenuItem>
          </Link>
          <Link href="/dashboard/properties" passHref>
            <DropdownMenuItem>My Properties</DropdownMenuItem>
          </Link>
           {isAdmin && (
            <Link href="/admin" passHref>
              <DropdownMenuItem className="text-primary font-semibold">
                <Shield className="mr-2 h-4 w-4" />
                Admin Panel
              </DropdownMenuItem>
            </Link>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
