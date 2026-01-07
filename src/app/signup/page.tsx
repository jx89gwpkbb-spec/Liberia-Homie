'use client';

import { useState } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useAuth, initiateEmailSignUp, setDocumentNonBlocking, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { updateProfile, type User as FirebaseUser, sendEmailVerification } from 'firebase/auth';
import { doc, serverTimestamp } from 'firebase/firestore';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const stepOneSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const stepTwoSchema = z.object({
    role: z.enum(['renter', 'vendor'], {
        required_error: "You need to select a role."
    }),
});

const signupSchema = stepOneSchema.merge(stepTwoSchema);

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userCredential, setUserCredential] = useState<FirebaseUser | null>(null);

  const methods = useForm<SignupFormData>({
    resolver: zodResolver(step === 1 ? stepOneSchema : signupSchema),
  });

  const {
    register,
    handleSubmit,
    trigger,
    control,
    getValues,
    formState: { errors },
  } = methods;

  const handleNext = async () => {
    const isValid = await trigger(['fullName', 'email', 'password']);
    if (isValid) {
      setIsLoading(true);
      if (!auth) {
        toast({ title: 'Error', description: 'Services not available.', variant: 'destructive' });
        setIsLoading(false);
        return;
      }
      try {
        const { email, password, fullName } = getValues();
        const userCred = await initiateEmailSignUp(auth, email, password);
        await updateProfile(userCred.user, { displayName: fullName });
        await sendEmailVerification(userCred.user);
        
        toast({
          title: 'Verification Email Sent',
          description: 'A verification link has been sent to your email address. Please check your inbox.',
        });

        setUserCredential(userCred.user);
        setStep(2);
      } catch (error: any) {
        console.error(error);
        toast({
          title: 'Sign Up Failed',
          description: error.message || 'An unexpected error occurred.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    if (!userCredential || !firestore) {
      toast({ title: 'Error', description: 'An error occurred. Please try again.', variant: 'destructive' });
      setIsLoading(false);
      return;
    }
    try {
      const userProfileRef = doc(firestore, 'users', userCredential.uid);
      const userProfileData = {
        id: userCredential.uid,
        name: data.fullName,
        email: userCredential.email,
        avatar: `https://picsum.photos/seed/${userCredential.uid}/40/40`,
        createdAt: serverTimestamp(),
        role: data.role,
      };

      setDocumentNonBlocking(userProfileRef, userProfileData, { merge: true });

      toast({
        title: 'Account Created',
        description: "You've successfully signed up! Please check your email to verify your account before logging in.",
      });
      router.push('/verify-email');
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Sign Up Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            {step === 1 ? 'Enter your information to create an account.' : 'Tell us a bit about yourself.'}
          </CardDescription>
        </CardHeader>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="grid gap-4">
              {step === 1 && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="full-name">Full name</Label>
                    <Input
                      id="full-name"
                      placeholder="John Doe"
                      {...register('fullName')}
                    />
                    {errors.fullName && (
                      <p className="text-sm text-destructive">
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      {...register('email')}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      {...register('password')}
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                  <Button type="button" className="w-full" disabled={isLoading} onClick={handleNext}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Next
                  </Button>
                </>
              )}
              {step === 2 && (
                <>
                   <div className="grid gap-4">
                    <Label>Are you here to rent or to list properties?</Label>
                    <Controller
                        name="role"
                        control={control}
                        render={({ field }) => (
                            <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                            >
                                <div className="flex items-center space-x-3 space-y-0">
                                    <RadioGroupItem value="renter" id="renter" />
                                    <Label htmlFor="renter" className="font-normal">I want to find a place to stay</Label>
                                </div>
                                <div className="flex items-center space-x-3 space-y-0">
                                    <RadioGroupItem value="vendor" id="vendor" />
                                    <Label htmlFor="vendor" className="font-normal">I want to list my property</Label>
                                </div>
                            </RadioGroup>
                        )}
                    />
                     {errors.role && (
                      <p className="text-sm text-destructive">
                        {errors.role.message}
                      </p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create an account
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                    Back
                </Button>
                </>
              )}
            </CardContent>
          </form>
        </FormProvider>
        <div className="mt-4 p-6 pt-0 text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="underline">
            Login
          </Link>
        </div>
      </Card>
    </div>
  );
}
