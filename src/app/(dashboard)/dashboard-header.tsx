"use client";

import { useSession } from "@/lib/auth-client";
import TeamSwitcher from "./dashboard/components/team-switcher";
import { MainNav } from "./dashboard/components/main-nav";
import { Search } from "./dashboard/components/search";
import { UserNav } from "./dashboard/components/user-nav";

export function DashboardHeader() {
  const session = useSession();
  const user = session.data?.user!;

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
