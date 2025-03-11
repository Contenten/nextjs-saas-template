"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/registry/new-york/ui/avatar";
import { Button } from "@/registry/new-york/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/new-york/ui/dropdown-menu";
import { CrossPlatformShortcut } from "@/registry/new-york/ui/cross-platform-shortcut";
import Link from "next/link";
import { useShortcut } from "@/lib/shortcuts/hooks/useShortcut";
import { useRouter } from "next/navigation";

export function UserNav() {
  const router = useRouter();

  // Define shortcuts
  useShortcut({
    id: "user-profile",
    description: "Go to user profile",
    keyCombos: [{ key: "p", modifiers: ["shift", "meta"] }],
    handler: () => {
      router.push("/profile");
    },
    preventDefault: true,
  });

  useShortcut({
    id: "user-billing",
    description: "Go to billing page",
    keyCombos: [{ key: "b", modifiers: ["meta"] }],
    handler: () => {
      router.push("/billing");
    },
    preventDefault: true,
  });

  useShortcut({
    id: "user-settings",
    description: "Go to settings page",
    keyCombos: [{ key: "s", modifiers: ["meta"] }],
    handler: () => {
      router.push("/settings");
    },
    preventDefault: true,
  });

  useShortcut({
    id: "user-sign-out",
    description: "Sign out from the application",
    keyCombos: [{ key: "q", modifiers: ["meta", "alt"] }],
    handler: () => {
      handleSignOut();
    },
    preventDefault: true,
    stopPropagation: true,
  });

  const handleSignOut = () => {
    window.location.href = "/";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/avatars/01.png" alt="@shadcn" />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">shadcn</p>
            <p className="text-xs leading-none text-muted-foreground">
              m@example.com
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">
              Profile
              <CrossPlatformShortcut
                keyCombo={{ key: "p", modifiers: ["shift", "meta"] }}
              />
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/billing">
              Billing
              <CrossPlatformShortcut
                keyCombo={{ key: "b", modifiers: ["meta"] }}
              />
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">
              Settings
              <CrossPlatformShortcut
                keyCombo={{ key: "s", modifiers: ["meta"] }}
              />
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/new-team">New Team</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          Sign out
          <CrossPlatformShortcut
            keyCombo={{ key: "q", modifiers: ["meta", "alt"] }}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
