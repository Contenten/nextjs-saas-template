"use client";

import { useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUp } from "@/lib/auth-client";
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

const signupSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    passwordConfirmation: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [signUpStatus, setSignUpStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: process.env.DEV_EMAIL || "",
      password: process.env.DEV_PASSWORD || "",
      passwordConfirmation: process.env.DEV_PASSWORD || "",
    },
  });

  const onSubmit = async ({ email, password }: SignupForm) => {
    const { data, error } = await signUp.email(
      {
        email,
        password,
        name: email.split("@")[0]!,
        callbackURL: "/dashboard",
      },
      {
        onRequest: (ctx) => {
          setIsLoading(true);
          setError(null);
          setIsDialogOpen(true);
          setSignUpStatus("idle");
        },
        onSuccess: (ctx) => {
          setIsLoading(false);
          setSignUpStatus("success");
          router.push("/dashboard");
          setIsDialogOpen(false);
        },
        onError: (ctx) => {
          setIsLoading(false);
          setIsDialogOpen(false);
          setError(ctx.error.message);
        },
      },
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 rounded-lg shadow-md border">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          Sign Up
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
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="passwordConfirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      className="border-input"
                      type="password"
                      placeholder="********"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Sign Up
            </Button>
          </form>
        </Form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <a
              href="/sign-in"
              className="font-medium underline underline-offset-4"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>

      <LoadingDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        isLoading={isLoading}
        status={signUpStatus}
        successMessage="Sign-up successful! Redirecting..."
        idleMessage="Please wait while we process your request..."
        errorMessage="Sign-up failed. Please try again."
      />
    </div>
  );
}
