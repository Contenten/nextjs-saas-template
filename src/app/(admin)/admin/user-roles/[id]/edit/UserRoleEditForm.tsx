"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { UserRole, Role } from "@/db/schema";
import { Button } from "@/registry/new-york/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/registry/new-york/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/new-york/ui/select";
import { Card } from "@/registry/new-york/ui/card";
import { toast } from "sonner";

// Form validation schema
const formSchema = z.object({
  roleId: z.string().min(1, { message: "Role is required" }),
});

type FormValues = z.infer<typeof formSchema>;

interface UserRoleEditFormProps {
  userRole: UserRole;
  userName: string;
  currentRoleId: string;
  currentRoleName: string;
  availableRoles: Role[];
  isAdmin: boolean;
}

export default function UserRoleEditForm({
  userRole,
  userName,
  currentRoleId,
  currentRoleName,
  availableRoles,
  isAdmin,
}: UserRoleEditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Filter out admin roles for non-admin users
  const filteredRoles = isAdmin
    ? availableRoles
    : availableRoles.filter((role) => role.name !== "Admin");

  // Initialize form with current values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roleId: currentRoleId,
    },
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);

    try {
      // Only proceed if the role has changed
      if (data.roleId === currentRoleId) {
        toast.info("No changes were made");
        router.back();
        return;
      }

      // Check if selected role is admin role and user is not admin
      const selectedRole = availableRoles.find(
        (role) => role.id === data.roleId,
      );
      if (selectedRole?.name === "Admin" && !isAdmin) {
        toast.error("You don't have permission to assign admin roles");
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/admin/user-roles/${userRole.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roleId: data.roleId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update user role");
      }

      toast.success("User role updated successfully");
      router.push("/admin/user-roles");
      router.refresh();
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update user role",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">User Information</h3>
              <p className="text-sm text-muted-foreground">
                You are editing the role for {userName}
              </p>
            </div>

            <div className="rounded-md bg-muted p-4">
              <div className="text-sm">
                <div className="font-medium">Current Role</div>
                <div className="mt-1">{currentRoleName}</div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredRoles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose a new role to assign to this user.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
