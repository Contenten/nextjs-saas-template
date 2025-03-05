"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon } from "lucide-react";

import { client } from "@/lib/auth-client";
import { Button } from "@/registry/new-york/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/registry/new-york/ui/form";
import { Input } from "@/registry/new-york/ui/input";
import { Icons } from "@/components/icon";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/new-york/ui/card";

// Form schema for validation
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function ForgetPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: process.env.NEXT_DEV_EMAIL || "",
    },
  });

  async function onSubmit({ email }: FormValues) {
    setIsLoading(true);
    setError(null);

    try {
      const res = await client.forgetPassword({
        email,
        redirectTo: "/reset-password",
      });
      setSuccess(true);
      // Optionally redirect after successful submission
      // router.push("/check-email")
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[500px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Reset your password
          </h1>
          <p className="text-base text-muted-foreground">
            Enter your email address and we&apos;ll send you a link to reset
            your password
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {success ? (
              <div className="flex flex-col items-center justify-center space-y-2">
                <CheckIcon className="h-8 w-8 text-green-500" />
                <p className="text-center text-base">
                  Check your email for a reset link. If you don&apos;t see it,
                  check your spam folder.
                </p>
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  {error && (
                    <div className="p-4 bg-destructive/15 text-destructive text-base rounded-md">
                      {error}
                    </div>
                  )}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="name@example.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading && (
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Send reset link
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t p-4">
            <p className="text-center text-base text-muted-foreground">
              Return to{" "}
              <a
                href="/sign-in"
                className="text-base underline underline-offset-4"
              >
                Sign In
              </a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
