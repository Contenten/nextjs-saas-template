"use client";

import { GalleryVerticalEnd } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

import { SiteFooter } from "@/app/(app)/site-footer";
import { SiteHeader } from "@/app/(app)/site-header";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const session = useSession();

  // Redirect authenticated users to homepage
  useEffect(() => {
    if (session.data?.user) {
      router.push("/");
    }
  }, [session.data, router]);

  return (
    <div data-wrapper="" className="border-grid flex flex-1 flex-col">
      <SiteHeader />

      <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted dark:bg-black p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <a
            href="/"
            className="flex items-center gap-2 self-center font-medium"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Acme Inc.
          </a>

          {children}

          <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
            By clicking continue, you agree to our
            <a href="#">Terms of Service</a> and
            <a href="#">Privacy Policy</a>.
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
