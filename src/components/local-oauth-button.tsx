"use client";

import { Button } from "@/registry/new-york/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/new-york/ui/tooltip";
import { signIn } from "@/lib/auth-client";

export function LocalOAuthButton() {
  const handleLocalOAuth = async () => {
    await signIn.oauth2({
      providerId: "local-oauth",
      callbackURL: "/dashboard",
    });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="gap-2 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50"
            onClick={handleLocalOAuth}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1.2em"
              height="1.2em"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M7 7h.01" />
              <path d="M12 7h.01" />
              <path d="M17 7h.01" />
              <path d="M7 12h.01" />
              <path d="M12 12h.01" />
              <path d="M17 12h.01" />
              <path d="M7 17h.01" />
              <path d="M12 17h.01" />
              <path d="M17 17h.01" />
            </svg>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Sign In with Local OAuth (for testing)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
