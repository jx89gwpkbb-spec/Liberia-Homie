'use client';

import { useUser, useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { sendEmailVerification } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MailCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function VerifyEmailPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (user) {
        await user.reload();
        if (user.emailVerified) {
          clearInterval(interval);
          toast({
            title: "Email Verified!",
            description: "You can now access the full application.",
          });
          router.push('/dashboard');
        }
      }
    }, 3000);

    if (isUserLoading) return;
    
    if (user && user.emailVerified) {
      clearInterval(interval);
      router.push('/dashboard');
    } else {
      setIsChecking(false);
    }
    
    return () => clearInterval(interval);
  }, [user, isUserLoading, router, toast]);

  const handleResend = async () => {
    if (!user) {
      toast({
        title: 'Not logged in',
        description: 'Please log in to resend the verification email.',
        variant: 'destructive',
      });
      return;
    }
    setIsSending(true);
    try {
      await sendEmailVerification(user);
      toast({
        title: 'Email Sent!',
        description: 'A new verification link has been sent to your email address.',
      });
    } catch (error) {
      console.error('Error resending verification email:', error);
      toast({
        title: 'Error',
        description: 'Failed to send verification email. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };
  
  if (isUserLoading || isChecking) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <MailCheck className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="mt-4 text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            A verification link has been sent to{' '}
            <span className="font-bold text-foreground">{user?.email}</span>.
            Please check your inbox (and spam folder) to continue. This page will automatically redirect after you verify.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Didn&apos;t receive the email?
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleResend}
            disabled={isSending}
          >
            {isSending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Resend Verification Email
          </Button>
        </CardContent>
        <CardFooter className="justify-center">
           <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Back to Login</Link>
           </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
