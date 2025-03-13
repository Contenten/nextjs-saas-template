"use server";

import { MainNav } from "@/components/main-nav";
import { MobileNav } from "@/components/mobile-nav";
import Link from "next/link";
import { Button } from "@/registry/new-york/ui/button";
import { getCurrentUser } from "@/app/(app)/actions";
import { hasUserRole } from "@/app/(admin)/actions";

import { UserNav } from "@/app/(dashboard)/dashboard/components/user-nav";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const isAuthenticated = !!user;

  // Check if user has admin role directly
  const isAdmin = user ? await hasUserRole("Admin") : false;

  // Add role information to the user object if authenticated
  const userWithRole = user
    ? {
        ...user,
        role: isAdmin ? "admin" : "user",
      }
    : undefined;

  return (
    <header className="border-grid sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-wrapper">
        <div className="container flex h-14 items-center">
          <MainNav />
          <MobileNav />
          <div className="flex flex-1 items-center justify-between gap-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none"></div>
            <nav className="flex items-center gap-4">
              {isAuthenticated && userWithRole ? (
                <UserNav user={userWithRole} />
              ) : (
                <Button variant="default" size="sm" asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
