'use client';
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserNav } from "../auth/UserNav";
import { useUser } from "@/firebase";

export function Header() {
  const { user, isUserLoading } = useUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Logo />
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
             <Link href="/properties" className="text-muted-foreground transition-colors hover:text-primary">
              Properties
            </Link>
            <Link href="/#about" className="text-muted-foreground transition-colors hover:text-primary">
              About
            </Link>
            <Link href="/#contact" className="text-muted-foreground transition-colors hover:text-primary">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            {isUserLoading ? (
              <div className="h-8 w-20 rounded-md bg-muted animate-pulse" />
            ) : user ? (
              <UserNav />
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
