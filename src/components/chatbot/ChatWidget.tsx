'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, X, Loader2 } from 'lucide-react';
import { ChatBubble } from './ChatBubble';
import { faqChatbot } from '@/ai/flows/faq-chatbot';
import { homieStaysAgent } from '@/ai/flows/homie-stays-agent';
import { useUser } from '@/firebase';

type Message = {
  id: string;
  role: 'user' | 'model';
  text: string;
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();

  const initialMessage: Message = {
    id: '1',
    role: 'model',
    text: 'Hi there! I am Agent231. How can I help you with Homie Stays today?',
  };

  const [messages, setMessages] = useState<Message[]>([initialMessage]);

  useEffect(() => {
    // Reset chat when the sheet is closed
    if (!isOpen) {
      setTimeout(() => setMessages([initialMessage]), 300);
    }
  }, [isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      let response;
      // If the user is logged in, use the more powerful agent.
      // Otherwise, use the simple FAQ bot.
      if (user) {
        response = await homieStaysAgent({ question: currentInput, userId: user.uid });
      } else {
        response = await faqChatbot({ question: currentInput });
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.answer,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I'm sorry, I'm having trouble connecting. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <MessageSquare />}
          <span className="sr-only">Toggle Chat</span>
        </Button>
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="right"
          className="flex w-full flex-col sm:max-w-md"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <SheetHeader className="pr-10">
            <SheetTitle>Chat with Agent231</SheetTitle>
            <SheetDescription>
              Your personal AI assistant for Homie Stays.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-4 p-4">
                {messages.map((message) => (
                  <ChatBubble key={message.id} {...message} />
                ))}
                {isLoading && (
                   <div className="flex justify-start">
                        <ChatBubble role="model" text="..." />
                   </div>
                )}
              </div>
            </ScrollArea>
          </div>
          <SheetFooter>
            <form onSubmit={handleSendMessage} className="flex w-full gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
              </Button>
            </form>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
