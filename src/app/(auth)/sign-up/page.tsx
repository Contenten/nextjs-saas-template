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
import { Eye, EyeOff } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/registry/new-york/ui/form";
import { Card, CardContent } from "@/registry/new-york/ui/card";

const signupSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[\W_]/, "Password must contain at least one special character"),
    passwordConfirmation: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[\W_]/, "Password must contain at least one special character"),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signUpStatus, setSignUpStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: process.env.NEXT_DEV_EMAIL || "",
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
    <div className="flex items-center justify-center">
      <div className="flex flex-col gap-6">
        <Card className="overflow-hidden w-full max-w-md">
          <CardContent className="grid p-0">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="p-6 md:p-8"
              >
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center text-center">
                    <h1 className="text-2xl font-bold">Create an account</h1>
                    <p className="text-balance text-muted-foreground">
                      Sign up for your Acme Inc account
                    </p>
                    {error && (
                      <p className="text-red-500 text-center">{error}</p>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
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
                      <FormItem className="grid gap-2">
                        <FormLabel>Password</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
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

                  <FormField
                    control={form.control}
                    name="passwordConfirmation"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel>Confirm Password</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type={
                                showPasswordConfirmation ? "text" : "password"
                              }
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
                            onClick={() =>
                              setShowPasswordConfirmation(
                                !showPasswordConfirmation,
                              )
                            }
                            disabled={isLoading}
                          >
                            {showPasswordConfirmation ? (
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
                    {isLoading ? "Creating account..." : "Sign Up"}
                  </Button>

                  <div className="text-center text-sm">
                    Already have an account?{" "}
                    <a href="/sign-in" className="underline underline-offset-4">
                      Sign in
                    </a>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
          By clicking continue, you agree to our &nbsp;
          <a href="#">Terms of Service</a> and &nbsp;
          <a href="#">Privacy Policy</a>.
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
