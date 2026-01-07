
import { Logo } from "./Logo";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Logo />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} Homie Liberia. All rights reserved.
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/help" className="transition-colors hover:text-primary">Help</Link>
          <Link href="/terms" className="transition-colors hover:text-primary">Terms of Service</Link>
          <Link href="/privacy" className="transition-colors hover:text-primary">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}
