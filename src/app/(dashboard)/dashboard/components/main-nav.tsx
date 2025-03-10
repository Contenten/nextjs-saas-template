"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/registry/new-york/ui/button";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="/dashboard"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          pathname === "/dashboard" ? "" : "text-muted-foreground",
          "text-sm font-medium transition-colors hover:text-primary",
        )}
      >
        Overview
      </Link>

      <Link
        href="/customers"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          pathname === "/customers" ? "" : "text-muted-foreground",
          "text-sm font-medium transition-colors hover:text-primary",
        )}
      >
        Customers
      </Link>
      <Link
        href="/products"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          pathname === "/products" ? "" : "text-muted-foreground",
          "text-sm font-medium transition-colors hover:text-primary",
        )}
      >
        Products
      </Link>

      <Link
        href="/settings"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          pathname === "/settings" ? "" : "text-muted-foreground",
          "text-sm font-medium transition-colors hover:text-primary",
        )}
      >
        Settings
      </Link>
    </nav>
  );
}
