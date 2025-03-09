import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/new-york/ui/card";
import {
  FileText,
  KeyRound,
  CreditCard,
  LayoutDashboard,
  Users,
  Settings,
  MessageSquare,
  Database,
} from "lucide-react";
import type React from "react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <main className="container mx-auto px-4 py-16 flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-4 text-center">
          Nextjs SaaS Template
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl text-center mb-12">
          A complete SaaS starter template built with Next.js and shadcn/ui.
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 w-full max-w-4xl mb-12">
          <FeatureCard
            icon={<KeyRound className="h-6 w-6" />}
            title="User Authentication"
            description="Sign-up, sign-in, password reset, and role-based access control."
          />
          <FeatureCard
            icon={<CreditCard className="h-6 w-6" />}
            title="Subscription Management"
            description="Tiered plans, payment integration, and invoice generation."
          />
          <FeatureCard
            icon={<LayoutDashboard className="h-6 w-6" />}
            title="User Dashboard"
            description="Personalized dashboard with user-specific data and analytics."
          />
          <FeatureCard
            icon={<Users className="h-6 w-6" />}
            title="Team Management"
            description="Invite members, assign roles, and manage organizations."
          />
          <FeatureCard
            icon={<Settings className="h-6 w-6" />}
            title="Account Management"
            description="Profile settings, preferences, and notification management."
          />
          <FeatureCard
            icon={<Database className="h-6 w-6" />}
            title="Database Integration"
            description="CRUD operations with PostgreSQL or Supabase integration."
          />
          <FeatureCard
            icon={<MessageSquare className="h-6 w-6" />}
            title="Support & Documentation"
            description="Help center, API documentation, and customer support features."
          />
          <FeatureCard
            icon={<FileText className="h-6 w-6" />}
            title="Admin Panel"
            description="Manage users, subscriptions, and content with role-based security."
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
