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
import { Card, CardContent } from "@/registry/new-york/ui/card";
import { LoadingDialog } from "../loading-dialog";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [resetStatus, setResetStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );

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
    setIsDialogOpen(true);
    setResetStatus("idle");

    try {
      const res = await client.forgetPassword({
        email,
        redirectTo: "/reset-password",
      });
      setSuccess(true);
      setResetStatus("success");
      // Wait a moment to show the success message
      setTimeout(() => {
        setIsDialogOpen(false);
      }, 1500);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setResetStatus("error");
      setIsDialogOpen(false);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center">
      <Card className="overflow-hidden w-full max-w-md">
        <CardContent className="grid p-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Reset your password</h1>
                  <p className="text-balance text-muted-foreground">
                    Enter your email address and we'll send you a link to reset
                    your password
                  </p>
                  {error && <p className="text-red-500 text-center">{error}</p>}
                </div>

                {success ? (
                  <div className="flex flex-col items-center justify-center space-y-4 py-4">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-center text-base">
                      Check your email for a reset link. If you don't see it,
                      check your spam folder.
                    </p>
                  </div>
                ) : (
                  <>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="grid gap-2">
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
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                          Sending reset link...
                        </>
                      ) : (
                        "Send reset link"
                      )}
                    </Button>
                  </>
                )}

                <div className="text-center text-sm">
                  Return to{" "}
                  <a href="/sign-in" className="underline underline-offset-4">
                    Sign In
                  </a>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <LoadingDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        isLoading={isLoading}
        status={resetStatus}
        successMessage="Reset link sent! Check your email."
        idleMessage="Sending password reset link..."
        errorMessage="Failed to send reset link. Please try again."
      />
    </div>
  );
}
