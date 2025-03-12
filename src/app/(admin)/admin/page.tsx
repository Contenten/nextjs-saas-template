import { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/new-york/ui/card";
import { db } from "@/db/drizzle";
import { user, session, account, verification } from "@/db/schema";
import { count } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Overview of database tables",
};

async function getDatabaseStats() {
  const userResults = await db.select({ value: count() }).from(user);
  const sessionResults = await db.select({ value: count() }).from(session);
  const accountResults = await db.select({ value: count() }).from(account);
  const verificationResults = await db
    .select({ value: count() })
    .from(verification);

  return {
    users: userResults[0]?.value ?? 0,
    sessions: sessionResults[0]?.value ?? 0,
    accounts: accountResults[0]?.value ?? 0,
    verifications: verificationResults[0]?.value ?? 0,
  };
}

export default async function AdminDashboard() {
  const stats = await getDatabaseStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Database administration interface for managing tables and records.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/users">
          <Card className="h-full cursor-pointer transition-colors hover:bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{stats.users}</CardTitle>
              <CardDescription>Users</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View and manage user accounts
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/sessions">
          <Card className="h-full cursor-pointer transition-colors hover:bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{stats.sessions}</CardTitle>
              <CardDescription>Sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View active user sessions
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/accounts">
          <Card className="h-full cursor-pointer transition-colors hover:bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{stats.accounts}</CardTitle>
              <CardDescription>Accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View user authentication accounts
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/verifications">
          <Card className="h-full cursor-pointer transition-colors hover:bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{stats.verifications}</CardTitle>
              <CardDescription>Verifications</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View email verification records
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="rounded-lg border p-4">
        <h2 className="text-lg font-medium mb-2">About Admin Access</h2>
        <p className="text-sm text-muted-foreground mb-2">
          Currently, all users have access to this admin dashboard. In the
          future, role-based access control will be implemented to restrict
          access to authorized administrators only.
        </p>
        <p className="text-sm text-muted-foreground">
          To add role-based access control, we&apos;ll need to:
        </p>
        <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground">
          <li>Add a &quot;role&quot; field to the user table</li>
          <li>Implement middleware to check user roles</li>
          <li>Create a role management interface</li>
        </ul>
      </div>
    </div>
  );
}
