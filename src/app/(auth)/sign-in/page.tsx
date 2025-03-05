"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { DiscordLogoIcon, GitHubLogoIcon } from "@radix-ui/react-icons";
import { Eye, EyeOff } from "lucide-react";

import { signIn } from "@/lib/auth-client";
import { Button } from "@/registry/new-york/ui/button";
import { Input } from "@/registry/new-york/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/new-york/ui/tooltip";
import { LoadingDialog } from "../loading-dialog";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/registry/new-york/ui/form";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function LoginPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: process.env.NEXT_DEV_EMAIL || "",
      password: process.env.DEV_PASSWORD || "",
    },
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    setError(null);
    setIsDialogOpen(true);
    setLoginStatus("idle");

    try {
      const response = await signIn.email({
        email: data.email,
        password: data.password,
      });
      if (response) {
        setLoginStatus("success");
        setTimeout(() => {
          router.push("/dashboard");
          setIsDialogOpen(false);
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
      setIsLoading(false);
      setTimeout(() => setIsDialogOpen(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 rounded-lg shadow-md border border">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          Sign In
        </h1>
        {error && <p className="text-red-500 text-center">{error}</p>}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      className="border-input"
                      type="email"
                      placeholder="you@example.com"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Password</FormLabel>
                    <a
                      href="/forget-password"
                      className="text-sm underline underline-offset-4"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <div className="relative">
                    <FormControl>
                      <Input
                        className="border-input pr-10"
                        type={showPassword ? "text" : "password"}
                        placeholder="********"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Sign In"}
            </Button>
          </form>
        </Form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <a
              href="/sign-up"
              className="font-medium underline underline-offset-4"
            >
              Sign up
            </a>
          </p>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={async () => {
                    await signIn.social({
                      provider: "github",
                      callbackURL: "/dashboard",
                    });
                  }}
                >
                  <GitHubLogoIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sign In with Github</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={async () => {
                    await signIn.social({
                      provider: "discord",
                    });
                  }}
                >
                  <DiscordLogoIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sign In with Discord</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={async () => {
                    await signIn.social({
                      provider: "google",
                      callbackURL: "/dashboard",
                    });
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="0.98em"
                    height="1em"
                    viewBox="0 0 256 262"
                    className="dark:text-white text-black"
                  >
                    <path
                      className="fill-current"
                      d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                    />
                    <path
                      className="fill-current"
                      d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                    />
                    <path
                      className="fill-current"
                      d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
                    />
                    <path
                      className="fill-current"
                      d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                    />
                  </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sign In with Google</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={async () => {
                    const { data } = await signIn.social({
                      provider: "microsoft",
                      callbackURL: "/dashboard",
                    });
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1.2em"
                    height="1.2em"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M2 3h9v9H2zm9 19H2v-9h9zM21 3v9h-9V3zm0 19h-9v-9h9z"
                    ></path>
                  </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sign In with Microsoft</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={async () => {
                    await signIn.social({
                      provider: "twitch",
                      callbackURL: "/dashboard",
                    });
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1.2em"
                    height="1.2em"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M11.64 5.93h1.43v4.28h-1.43m3.93-4.28H17v4.28h-1.43M7 2L3.43 5.57v12.86h4.28V22l3.58-3.57h2.85L20.57 12V2m-1.43 9.29l-2.85 2.85h-2.86l-2.5 2.5v-2.5H7.71V3.43h11.43Z"
                    ></path>
                  </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sign In with Twitch</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={async () => {
                    await signIn.social({
                      provider: "facebook",
                      callbackURL: "/dashboard",
                    });
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1.3em"
                    height="1.3em"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95"
                    ></path>
                  </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sign In with Facebook</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={async () => {
                    await signIn.social({
                      provider: "twitter",
                      callbackURL: "/dashboard",
                    });
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    viewBox="0 0 14 14"
                  >
                    <g fill="none">
                      <g clipPath="url(#primeTwitter0)">
                        <path
                          fill="currentColor"
                          d="M11.025.656h2.147L8.482 6.03L14 13.344H9.68L6.294 8.909l-3.87 4.435H.275l5.016-5.75L0 .657h4.43L7.486 4.71zm-.755 11.4h1.19L3.78 1.877H2.504z"
                        ></path>
                      </g>
                      <defs>
                        <clipPath id="primeTwitter0">
                          <path fill="#fff" d="M0 0h14v14H0z"></path>
                        </clipPath>
                      </defs>
                    </g>
                  </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sign In with Twitter</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <LoadingDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        isLoading={isLoading}
        status={loginStatus}
        successMessage="Login successful! Redirecting..."
        idleMessage="Please wait while we process your request..."
        errorMessage="Login failed. Please try again."
      />
    </div>
  );
}
