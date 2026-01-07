
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Toaster } from '@/components/ui/toaster';
import { ChatWidget } from '@/components/chatbot/ChatWidget';
import { NotificationManager } from '@/components/notifications/NotificationManager';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Homie Stays',
  description: 'Find your next home, for a short or long stay.',
  manifest: '/manifest.json',
  themeColor: '#5D28D2',
};

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning={true}>
        <FirebaseClientProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
            <Toaster />
            <NotificationManager />
          </NextIntlClientProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
