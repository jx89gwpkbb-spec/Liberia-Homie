'use client';

import { useState } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { useTranslations } from 'next-intl';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function MyProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const t = useTranslations('MyProfile');

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore || !user.emailVerified) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } =
    useDoc<UserProfile>(userProfileRef);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      name: userProfile?.name || '',
    },
  });
  
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    }
  });


  const getInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };
  
  const onProfileSubmit = (data: ProfileFormData) => {
    if (!userProfileRef) return;
    setIsSaving(true);
    setDocumentNonBlocking(userProfileRef, { name: data.name }, { merge: true });
    toast({
        title: t('toast.profileUpdatedTitle'),
        description: t('toast.profileUpdatedDesc'),
    });
    setIsSaving(false);
  }
  
   const onPasswordSubmit = async (data: PasswordFormData) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
        toast({ title: t('toast.notAuthenticatedTitle'), description: t('toast.notAuthenticatedDesc'), variant: 'destructive'});
        return;
    }

    setIsSavingPassword(true);
    try {
        await updatePassword(currentUser, data.password);
        toast({
            title: t('toast.passwordUpdatedTitle'),
            description: t('toast.passwordUpdatedDesc'),
        });
        passwordForm.reset();
    } catch (error: any) {
        console.error('Password update failed', error);
        toast({
            title: t('toast.updateFailedTitle'),
            description: t('toast.passwordUpdateFailedDesc'),
            variant: 'destructive',
        });
    } finally {
        setIsSavingPassword(false);
    }
  };


  if (isUserLoading || isProfileLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-8 w-48" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-64" />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <Skeleton className="h-10 w-full" />
             <Skeleton className="h-10 w-full" />
             <Skeleton className="h-10 w-24 ml-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>
      <Card>
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
          <CardHeader>
             <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={userProfile?.avatar} alt={userProfile?.name} />
                <AvatarFallback>
                  {getInitials(userProfile?.name || '')}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{t('personalInfo.title')}</CardTitle>
                <CardDescription>{t('personalInfo.description')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('personalInfo.nameLabel')}</Label>
              <Input id="name" {...profileForm.register('name')} />
              {profileForm.formState.errors.name && (
                <p className="text-sm text-destructive">{profileForm.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">{t('personalInfo.emailLabel')}</Label>
                <Input id="email" type="email" value={userProfile?.email || ''} disabled />
                 <p className="text-xs text-muted-foreground">{t('personalInfo.emailHint')}</p>
            </div>
          </CardContent>
           <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('personalInfo.saveButton')}
                </Button>
            </CardFooter>
        </form>
      </Card>
      
       <Card>
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
          <CardHeader>
            <CardTitle>{t('changePassword.title')}</CardTitle>
            <CardDescription>{t('changePassword.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t('changePassword.newPasswordLabel')}</Label>
              <Input id="password" type="password" {...passwordForm.register('password')} />
              {passwordForm.formState.errors.password && (
                <p className="text-sm text-destructive">{passwordForm.formState.errors.password.message}</p>
              )}
            </div>
             <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('changePassword.confirmPasswordLabel')}</Label>
              <Input id="confirmPassword" type="password" {...passwordForm.register('confirmPassword')} />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
          </CardContent>
           <CardFooter className="flex justify-end">
                <Button type="submit" variant="secondary" disabled={isSavingPassword}>
                    {isSavingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('changePassword.updateButton')}
                </Button>
            </CardFooter>
        </form>
      </Card>
    </div>
  );
}
