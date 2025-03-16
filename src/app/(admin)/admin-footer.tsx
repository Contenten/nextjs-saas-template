import pkg from "@/../package.json";
import { siteConfig } from "@/config/site";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";

export function AdminFooter() {
  return (
    <footer className="border-grid border-t py-4 mt-auto">
      <div className="container">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {siteConfig.name}. Admin Portal.
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
              Back to Site
            </Link>

            <Link
              href="/admin/help"
              className="text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
              Admin Help
            </Link>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ModeToggle />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
