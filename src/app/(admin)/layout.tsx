"use server";

import { redirect } from "next/navigation";
import { AdminHeader } from "./admin-header";
import { AdminFooter } from "./admin-footer";
import { getCurrentUserWithRoles } from "./actions";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // Check if user is authenticated and has admin role
  const user = await getCurrentUserWithRoles();

  // If not authenticated or not admin, redirect to unauthorized page
  if (!user || !user.isAdmin) {
    redirect("/unauthorized");
  }

  return (
    <div data-wrapper="" className="flex min-h-screen flex-col">
      <AdminHeader />

      <div className="flex-1">
        <div className="bg-muted/40">
          <div className="container py-6">
            <div className="rounded-lg border bg-card p-8 shadow-sm">
              {children}
            </div>
          </div>
        </div>
      </div>

      <AdminFooter />
    </div>
  );
}
