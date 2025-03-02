"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/registry/new-york/ui/button";
import { Input } from "@/registry/new-york/ui/input";
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
  const router = useRouter();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: process.env.DEV_EMAIL || "",
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      className="border-input"
                      type="password"
                      placeholder="********"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
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
            Don’t have an account?{" "}
            <a
              href="/sign-up"
              className="font-medium underline underline-offset-4"
            >
              Sign up
            </a>
          </p>
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
