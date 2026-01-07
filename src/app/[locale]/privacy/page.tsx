
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserCheck, Activity, Smartphone, MapPin, Share2, ShieldCheck, UserCog, AlertCircle, Mail, Phone, User, Map } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  const sections = [
    {
      icon: UserCheck,
      title: "1. Information We Collect",
      points: [
        "Personal Information: Name, email address, phone number, and account details when you sign up.",
        "Usage Data: How you interact with the app, including searches, clicks, and preferences.",
        "Device Information: Device type, operating system, and app version.",
        "Location Data: If you enable location services, we may collect your approximate location to improve recommendations."
      ]
    },
    {
      icon: Activity,
      title: "2. How We Use Your Information",
      points: [
        "Provide and improve our services.",
        "Authenticate users and secure accounts.",
        "Enable communication between users (e.g., housing listings, service providers).",
        "Send important updates, including verification emails.",
        "Comply with legal obligations."
      ]
    },
    {
      icon: Share2,
      title: "3. Sharing of Information",
      points: [
        "With service providers who help us operate the app.",
        "If required by law or to protect safety.",
        "With your consent, for specific features (e.g., sharing listings)."
      ]
    },
    {
      icon: ShieldCheck,
      title: "4. Data Security",
       points: [
        "We use Firebase Authentication and Firestore to secure user data.",
        "Access is restricted by Firestore Security Rules, ensuring only verified users can access sensitive data.",
        "While we take strong measures, no system is 100% secure."
      ]
    },
     {
      icon: UserCog,
      title: "5. Your Rights",
       points: [
        "Access and update your personal information.",
        "Request deletion of your account and data.",
        "Control email notifications and communication preferences."
      ]
    },
     {
      icon: AlertCircle,
      title: "6. Children’s Privacy",
       points: [
        "Homie Liberia is not intended for children under 13. We do not knowingly collect data from minors."
      ]
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
            Effective Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="space-y-8">
          <p className="text-center text-muted-foreground">Homie Liberia values your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our app.</p>
          {sections.map(section => (
            <Card key={section.title}>
              <CardHeader className="flex flex-row items-start gap-4">
                 <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                    <section.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle>{section.title}</CardTitle>
                     <CardDescription className="pt-2">
                        <ul className="list-disc pl-5 space-y-1">
                          {section.points.map((point, index) => (
                            <li key={index}>{point}</li>
                          ))}
                        </ul>
                    </CardDescription>
                  </div>
              </CardHeader>
            </Card>
          ))}
           <Card>
              <CardHeader>
                <CardTitle>7. Changes to This Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">We may update this Privacy Policy from time to time. Updates will be posted in the app with a revised “Effective Date.”</p>
              </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>8. Contact Us</CardTitle>
                    <CardDescription>If you have questions or concerns about this Privacy Policy, contact us at:</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <User className="h-5 w-5 text-primary"/>
                        <p className="text-muted-foreground">CEO: Samuel Nimely</p>
                    </div>
                     <div className="flex items-center gap-4">
                        <Mail className="h-5 w-5 text-primary"/>
                        <a href="mailto:samuelknimelyjr@gmail.com" className="text-muted-foreground hover:text-primary">samuelknimelyjr@gmail.com</a>
                    </div>
                     <div className="flex items-center gap-4">
                        <Phone className="h-5 w-5 text-primary"/>
                        <div className="text-muted-foreground">
                            <p>(+91) 8923274502</p>
                            <p>(+231) 770321127</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4">
                        <Map className="h-5 w-5 text-primary"/>
                        <p className="text-muted-foreground">Buchanan City, Monrovia, Liberia</p>
                    </div>
                </CardContent>
             </Card>
        </div>
      </div>
    </div>
  );
}
