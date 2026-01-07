
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Database, Lock, UserCheck, Info } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  const sections = [
    {
      icon: Info,
      title: "Introduction",
      content: "This Privacy Policy outlines how Homie Liberia collects, uses, and protects your personal information when you use our application. Your privacy is important to us, and we are committed to safeguarding your data."
    },
    {
      icon: Database,
      title: "Information We Collect",
      content: "We collect information you provide directly, such as your name, email, and any content you post. We also use Firebase services which may collect data for authentication and analytics purposes as outlined in their own privacy policies."
    },
    {
      icon: UserCheck,
      title: "How We Use Your Information",
      content: "Your information is used to provide and improve our services, facilitate communication between users, and ensure the security of our platform. We do not sell your personal data to third parties."
    },
    {
      icon: Lock,
      title: "Data Security",
      content: "We rely on Firebase's robust security infrastructure, including Firestore Security Rules and Firebase Authentication, to protect your data from unauthorized access. While no system is perfectly secure, we take all reasonable measures to protect your information."
    },
  ];

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-headline text-primary">
            Privacy Policy
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <Alert variant="default" className="mb-8">
          <AlertTitle>External Privacy Information</AlertTitle>
          <AlertDescription>
            This app is built using Firebase services. For more details on how data is handled by the underlying platform, you can refer to the <Link href="https://firebase.google.com/support/privacy" className="font-semibold underline" target="_blank">Firebase Privacy Policy</Link>.
          </AlertDescription>
        </Alert>

        <div className="space-y-8">
          {sections.map(section => (
            <Card key={section.title}>
              <CardHeader className="flex flex-row items-center gap-4">
                 <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <section.icon className="h-6 w-6" />
                  </div>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{section.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
