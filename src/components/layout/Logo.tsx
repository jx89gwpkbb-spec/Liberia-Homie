import { Home } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <div className="rounded-lg bg-primary p-2">
        <Home className="h-6 w-6 text-primary-foreground" />
      </div>
      <span className="text-xl font-bold tracking-tight text-primary">
        Homie Stays
      </span>
    </Link>
  );
}
