"use client";

import { useState } from "react";
import { Button } from "@/registry/new-york/ui/button";
import { Input } from "@/registry/new-york/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, CheckIcon } from "lucide-react";

import { client } from "@/lib/auth-client";
import { Icons } from "@/components/icon";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from "@/registry/new-york/ui/form";
import { Card, CardContent } from "@/registry/new-york/ui/card";
import { LoadingDialog } from "../loading-dialog";

// Form schema for validation
const formSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter",
      })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[\W_]/, {
        message: "Password must contain at least one special character",
      }),
    confirmPassword: z
      .string()
      .min(8, { message: "Please confirm your password" })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter",
      })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[\W_]/, {
        message: "Password must contain at least one special character",
      }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [resetStatus, setResetStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError(null);
    setIsDialogOpen(true);
    setResetStatus("idle");

    try {
      const res = await client.resetPassword({
        newPassword: data.newPassword,
        token: new URLSearchParams(window.location.search).get("token")!,
      });

      if (res.error) {
        setResetStatus("error");
        if (res.error.code === "INVALID_TOKEN") {
          setError(
            "The link has expired. Please request a new password reset link.",
          );
        } else if (res.error?.status === 400) {
          setError("Invalid token. Please request a new password reset link.");
        } else if (res.error?.status === 500) {
          setError("Internal server error. Please try again later.");
        } else {
          setError(
            "An error occurred. Please request a new password reset link.",
          );
        }
        setIsDialogOpen(false);
      } else {
        setSuccess(true);
        setResetStatus("success");
        // TODO: directly redirect to homepage or dashboard page
        setTimeout(() => {
          window.location.href = "/sign-in";
        }, 2000);
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      setResetStatus("error");
      setIsDialogOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <Card className="overflow-hidden w-full max-w-md">
        <CardContent className="grid p-0">
          {success ? (
            <div className="flex flex-col items-center justify-center space-y-4 p-6 md:p-8">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckIcon className="h-6 w-6 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-center">
                Password Reset Complete
              </h1>
              <p className="text-center text-balance text-muted-foreground">
                Your password has been reset successfully. You'll be redirected
                to sign in shortly.
              </p>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="p-6 md:p-8"
              >
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center text-center">
                    <h1 className="text-2xl font-bold">Reset Your Password</h1>
                    <p className="text-balance text-muted-foreground">
                      Enter your new password.
                    </p>
                    {error && (
                      <p className="text-red-500 text-center">{error}</p>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel>New Password</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              id="new-password"
                              type={showNewPassword ? "text" : "password"}
                              placeholder="New password"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            disabled={isLoading}
                          >
                            {showNewPassword ? (
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
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel>Confirm Password</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              id="confirm-password"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm password"
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
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            disabled={isLoading}
                          >
                            {showConfirmPassword ? (
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

                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <>
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        Resetting Password...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>

                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>Password requirements:</p>
                    <ul className="list-disc list-inside text-xs space-y-1">
                      <li>At least 8 characters</li>
                      <li>At least one lowercase letter</li>
                      <li>At least one uppercase letter</li>
                      <li>At least one number</li>
                      <li>At least one special character</li>
                    </ul>
                  </div>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>

      <LoadingDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        isLoading={isLoading}
        status={resetStatus}
        successMessage="Password reset successful! Redirecting to login..."
        idleMessage="Resetting your password..."
        errorMessage="Failed to reset password. Please try again."
      />
    </div>
  );
}
