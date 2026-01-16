'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import dynamic from 'next/dynamic';

const ChatWidget = dynamic(
  () => import('@/components/chatbot/ChatWidget').then(mod => mod.ChatWidget),
  { ssr: false }
);

export default function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
