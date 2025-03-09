import { SiteHeader } from "@/app/(app)/site-header";
import { SiteFooter } from "@/app/(app)/site-footer";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div data-wrapper="" className="border-grid flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter />
    </div>
  );
}
