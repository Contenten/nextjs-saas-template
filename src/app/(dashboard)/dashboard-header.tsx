"use server";

import TeamSwitcher from "./dashboard/components/team-switcher";
import { MainNav } from "./dashboard/components/main-nav";
import { Search } from "./dashboard/components/search";
import { UserNav } from "./dashboard/components/user-nav";
import { getCurrentUser } from "@/app/(app)/actions";
import { hasUserRole } from "@/app/(admin)/actions";

export async function DashboardHeader() {
  const userData = await getCurrentUser();

  // Only proceed if we have user data
  if (!userData) {
    return null;
  }

  // Check if user has admin role
  const isAdmin = await hasUserRole("Admin");

  // Add role information to the user object
  const user = {
    ...userData,
    role: isAdmin ? "admin" : "user",
  };

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <TeamSwitcher />
        <MainNav className="mx-6" />
        <div className="ml-auto flex items-center space-x-4">
          <Search />
          <UserNav user={user} />
        </div>
      </div>
    </div>
  );
}
