"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Role } from "@/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Input } from "@/registry/new-york/ui/input";
import { Textarea } from "@/registry/new-york/ui/textarea";
import { Card } from "@/registry/new-york/ui/card";
import { toast } from "sonner";
import { Checkbox } from "@/registry/new-york/ui/checkbox";
import { Separator } from "@/registry/new-york/ui/separator";

// Common permissions that might be available
const availablePermissions = [
  { id: "user:read", label: "View Users" },
  { id: "user:create", label: "Create Users" },
  { id: "user:update", label: "Update Users" },
  { id: "user:delete", label: "Delete Users" },
  { id: "role:read", label: "View Roles" },
  { id: "role:create", label: "Create Roles" },
  { id: "role:update", label: "Update Roles" },
  { id: "role:delete", label: "Delete Roles" },
  { id: "profile:read", label: "View Profiles" },
  { id: "profile:update", label: "Update Profiles" },
  { id: "profile:delete", label: "Delete Profiles" },
  { id: "content:read", label: "View Content" },
  { id: "content:create", label: "Create Content" },
  { id: "content:update", label: "Update Content" },
  { id: "content:delete", label: "Delete Content" },
  { id: "content:moderate", label: "Moderate Content" },
];

// Role form schema
const roleFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().optional().nullable(),
  permissions: z.record(z.boolean()).default({}),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

export default function RoleEditForm({ role }: { role: Role }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Convert permissions object for form
  const rolePermissions =
    role.permissions && typeof role.permissions === "object"
      ? (role.permissions as Record<string, boolean>)
      : {};

  // Set up default values with all known permissions
  const defaultPermissions: Record<string, boolean> = {};
  availablePermissions.forEach((permission) => {
    defaultPermissions[permission.id] = rolePermissions[permission.id] || false;
  });

  // Add any custom permissions from the role that aren't in our predefined list
  Object.keys(rolePermissions).forEach((key) => {
    if (!defaultPermissions[key]) {
      defaultPermissions[key] = rolePermissions[key] || false;
    }
  });

  const defaultValues: RoleFormValues = {
    name: role.name,
    description: role.description,
    permissions: defaultPermissions,
  };

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues,
  });

  async function onSubmit(data: RoleFormValues) {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/roles/${role.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          permissions: data.permissions,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update role");
      }

      toast.success("Role updated successfully");
      router.refresh();
      router.push(`/admin/roles/${role.id}`);
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update role",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Role name"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>
                  A descriptive name for the role.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Role description"
                    className="min-h-[100px]"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>
                  A brief description of the role's purpose.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Permissions</h3>
            <p className="text-sm text-muted-foreground">
              Select the permissions for this role.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              {/* User Management Permissions */}
              <Card className="p-4">
                <h4 className="mb-2 font-medium">User Management</h4>
                <Separator className="mb-4" />
                <div className="space-y-2">
                  {availablePermissions
                    .filter((p) => p.id.startsWith("user:"))
                    .map((permission) => (
                      <FormField
                        key={permission.id}
                        control={form.control}
                        name={`permissions.${permission.id}`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {permission.label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                </div>
              </Card>

              {/* Role Management Permissions */}
              <Card className="p-4">
                <h4 className="mb-2 font-medium">Role Management</h4>
                <Separator className="mb-4" />
                <div className="space-y-2">
                  {availablePermissions
                    .filter((p) => p.id.startsWith("role:"))
                    .map((permission) => (
                      <FormField
                        key={permission.id}
                        control={form.control}
                        name={`permissions.${permission.id}`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {permission.label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                </div>
              </Card>

              {/* Profile Management Permissions */}
              <Card className="p-4">
                <h4 className="mb-2 font-medium">Profile Management</h4>
                <Separator className="mb-4" />
                <div className="space-y-2">
                  {availablePermissions
                    .filter((p) => p.id.startsWith("profile:"))
                    .map((permission) => (
                      <FormField
                        key={permission.id}
                        control={form.control}
                        name={`permissions.${permission.id}`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {permission.label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                </div>
              </Card>

              {/* Content Management Permissions */}
              <Card className="p-4">
                <h4 className="mb-2 font-medium">Content Management</h4>
                <Separator className="mb-4" />
                <div className="space-y-2">
                  {availablePermissions
                    .filter((p) => p.id.startsWith("content:"))
                    .map((permission) => (
                      <FormField
                        key={permission.id}
                        control={form.control}
                        name={`permissions.${permission.id}`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {permission.label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                </div>
              </Card>
            </div>
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
