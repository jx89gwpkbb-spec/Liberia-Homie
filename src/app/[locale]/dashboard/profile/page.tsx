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
import { Loader2, Camera } from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getAuth, updatePassword, updateProfile, type User as FirebaseUser } from 'firebase/auth';
import { useTranslations } from 'next-intl';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  whatsappNumber: z.string().optional(),
  country: z.string().optional(),
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
  const [isUploading, setIsUploading] = useState(false);
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
      whatsappNumber: userProfile?.whatsappNumber || '',
      country: userProfile?.country || '',
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
    setDocumentNonBlocking(userProfileRef, { 
      name: data.name,
      whatsappNumber: data.whatsappNumber,
      country: data.country,
    }, { merge: true });
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!file || !currentUser || !firestore) return;

    setIsUploading(true);
    try {
      const storage = getStorage();
      const filePath = `avatars/${currentUser.uid}/${file.name}`;
      const storageRef = ref(storage, filePath);
      
      const snapshot = await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(snapshot.ref);

      await updateProfile(currentUser, { photoURL });
      
      const userDocRef = doc(firestore, 'users', currentUser.uid);
      setDocumentNonBlocking(userDocRef, { avatar: photoURL }, { merge: true });
      
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been changed.",
      });

    } catch (error) {
      console.error("Avatar upload failed:", error);
      toast({
        title: "Upload Failed",
        description: "Could not update your profile picture. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  }


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
             <div className="flex items-center gap-6">
               <div className="relative group">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={userProfile?.avatar || user?.photoURL || ''} alt={userProfile?.name} />
                  <AvatarFallback>
                    {getInitials(userProfile?.name || '')}
                  </AvatarFallback>
                </Avatar>
                <Label htmlFor="avatar-upload" className="absolute inset-0 bg-black/50 flex items-center justify-center text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
                </Label>
                <Input id="avatar-upload" type="file" accept="image/*" className="sr-only" onChange={handleAvatarUpload} disabled={isUploading} />
              </div>
              <div>
                <CardTitle>{t('personalInfo.title')}</CardTitle>
                <CardDescription>{t('personalInfo.description')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
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
                 <div className="space-y-2">
                    <Label htmlFor="whatsappNumber">{t('personalInfo.whatsappLabel')}</Label>
                    <Input id="whatsappNumber" {...profileForm.register('whatsappNumber')} placeholder="+123456789" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="country">{t('personalInfo.countryLabel')}</Label>
                    <Input id="country" {...profileForm.register('country')} placeholder="e.g. Liberia" />
                </div>
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
