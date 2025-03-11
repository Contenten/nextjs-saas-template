import TeamSwitcher from "./dashboard/components/team-switcher";
import { MainNav } from "./dashboard/components/main-nav";
import { Search } from "./dashboard/components/search";
import { UserNav } from "./dashboard/components/user-nav";

export function DashboardHeader() {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <TeamSwitcher />
        <MainNav className="mx-6" />
        <div className="ml-auto flex items-center space-x-4">
          <Search />
          <UserNav />
        </div>
      </div>
    </div>
  );
}
