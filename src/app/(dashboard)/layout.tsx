import { Metadata } from "next";
import Image from "next/image";
import { DashboardHeader } from "./dashboard-header";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard and settings pages for the application.",
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="md:hidden">
        <Image
          src="/examples/dashboard-light.png"
          width={1280}
          height={866}
          alt="Dashboard"
          className="block dark:hidden"
        />
        <Image
          src="/examples/dashboard-dark.png"
          width={1280}
          height={866}
          alt="Dashboard"
          className="hidden dark:block"
        />
      </div>
      <div className="hidden flex-col md:flex flex-1">
        <DashboardHeader />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
