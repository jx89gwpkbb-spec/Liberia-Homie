'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const handleLocaleChange = (newLocale: string) => {
    // This regex replaces the current locale in the path with the new one.
    const newPath = pathname.replace(/^\/[a-z]{2}/, `/${newLocale}`);
    router.replace(newPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" suppressHydrationWarning>
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleLocaleChange('en')}
          disabled={locale === 'en'}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLocaleChange('es')}
          disabled={locale === 'es'}
        >
          Español
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
