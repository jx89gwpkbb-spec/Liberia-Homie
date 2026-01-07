
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileText, User, Shield, Copyright, ShieldCheck, AlertTriangle, Ban, Gavel } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  const sections = [
    {
      icon: FileText,
      title: "1. Acceptance of Terms",
      content: "By accessing or using Homie Liberia, you agree to be bound by these Terms & Conditions. If you do not agree, please discontinue use of the app."
    },
    {
      icon: User,
      title: "2. User Accounts",
      content: "Users must provide accurate information when creating an account. Accounts may require email verification before full access is granted. You are responsible for maintaining the confidentiality of your login credentials."
    },
    {
      icon: Shield,
      title: "3. Use of Services",
      content: "Homie Liberia provides listings, services, and community information for personal use only. You agree not to misuse the platform for fraudulent, harmful, or illegal activities. Homie Liberia reserves the right to remove any content that violates these rules."
    },
    {
      icon: Copyright,
      title: "4. Content Ownership",
      content: "Users retain ownership of the content they post. By posting, you grant Homie Liberia a non-exclusive license to display and distribute your content within the app."
    },
    {
      icon: ShieldCheck,
      title: "5. Privacy & Data Protection",
      content: "Homie Liberia uses Firebase authentication and Firestore to secure user data. Personal information will not be shared with third parties without consent, except as required by law. For more details, refer to our Privacy Policy."
    },
    {
      icon: AlertTriangle,
      title: "6. Limitation of Liability",
      content: "Homie Liberia is provided “as is” without warranties of any kind. The app is not responsible for damages arising from use, including reliance on listings or services."
    },
    {
      icon: Ban,
      title: "7. Termination",
      content: "Homie Liberia may suspend or terminate accounts that violate these Terms. Users may delete their accounts at any time."
    },
    {
      icon: Gavel,
      title: "8. Governing Law",
      content: "These Terms & Conditions are governed by the laws of Liberia."
    }
  ];

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-headline text-primary">
            Terms & Conditions
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <Alert variant="destructive" className="mb-8">
          <AlertTitle>Legal Disclaimer</AlertTitle>
          <AlertDescription>
            This is a general draft and not legal advice, as the app is not yet published. You should consult with a lawyer to have your Terms & Conditions properly reviewed and tailored before publishing.
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
