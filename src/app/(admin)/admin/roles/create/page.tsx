"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { nanoid } from "nanoid";

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
import { Card, CardContent } from "@/registry/new-york/ui/card";
import { Checkbox } from "@/registry/new-york/ui/checkbox";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/registry/new-york/ui/alert";
import { Separator } from "@/registry/new-york/ui/separator";

// Define the form schema
const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Role name is required" }),
  description: z.string().optional(),
  permissions: z.record(z.boolean()).default({}),
});

// Group the permissions by category for better organization
const permissionGroups = [
  {
    name: "Users",
    permissions: [
      { id: "user:read", label: "View Users" },
      { id: "user:create", label: "Create Users" },
      { id: "user:update", label: "Edit Users" },
      { id: "user:delete", label: "Delete Users" },
    ],
  },
  {
    name: "Roles",
    permissions: [
      { id: "role:read", label: "View Roles" },
      { id: "role:create", label: "Create Roles" },
      { id: "role:update", label: "Edit Roles" },
      { id: "role:delete", label: "Delete Roles" },
    ],
  },
  {
    name: "Profiles",
    permissions: [
      { id: "profile:read", label: "View Profiles" },
      { id: "profile:create", label: "Create Profiles" },
      { id: "profile:update", label: "Edit Profiles" },
      { id: "profile:delete", label: "Delete Profiles" },
    ],
  },
  {
    name: "Content",
    permissions: [
      { id: "content:read", label: "View Content" },
      { id: "content:create", label: "Create Content" },
      { id: "content:update", label: "Update Content" },
      { id: "content:delete", label: "Delete Content" },
      { id: "content:moderate", label: "Moderate Content" },
    ],
  },
];

// Flatten the permissions for initializing form values
const availablePermissions = permissionGroups.flatMap(
  (group) => group.permissions,
);

export default function CreateRolePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      name: "",
      description: "",
      permissions: availablePermissions.reduce(
        (acc, perm) => {
          acc[perm.id] = false;
          return acc;
        },
        {} as Record<string, boolean>,
      ),
    },
  });

  // Submit handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("onSubmit function called with values:", values);
    setIsSubmitting(true);
    setError(null);

    try {
      // Generate a unique ID if not provided
      const roleData = {
        ...values,
        id: values.id || nanoid(),
      };

      console.log("Submitting role data:", roleData);

      // API call to create the role
      const response = await fetch("/api/admin/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roleData),
        credentials: "include", // Add this to include cookies
      });

      console.log("API response status:", response.status);

      const responseData = await response.json();
      console.log("API response data:", responseData);

      if (!response.ok) {
        throw new Error(
          responseData.error ||
            `Failed to create role: ${response.status} ${response.statusText}`,
        );
      }

      toast.success("Role created successfully");
      router.push("/admin/roles");
      router.refresh();
    } catch (error) {
      console.error("Error creating role:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create role";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Role</h1>
          <p className="text-muted-foreground">Add a new role to the system</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="p-6">
        <CardContent className="grid p-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <p className="text-sm text-muted-foreground">
                  Enter the basic information for the new role
                </p>

                <FormField
                  control={form.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="admin" {...field} />
                      </FormControl>
                      <FormDescription>
                        Optional custom ID for the role. If not provided, a
                        unique ID will be generated.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Administrator" {...field} />
                      </FormControl>
                      <FormDescription>
                        The display name for the role
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
                          placeholder="Full system administrator with all permissions"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A brief description of the role's purpose
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Permissions</h3>
                <p className="text-sm text-muted-foreground">
                  Select the permissions to grant to this role
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  {permissionGroups.map((group) => (
                    <Card key={group.name} className="p-4">
                      <h4 className="mb-2 font-medium">
                        {group.name} Management
                      </h4>
                      <Separator className="mb-4" />
                      <div className="space-y-2">
                        {group.permissions.map((permission) => (
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
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Link href="/admin/roles">
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Role"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
