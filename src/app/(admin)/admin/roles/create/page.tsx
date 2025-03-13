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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/new-york/ui/card";
import { Checkbox } from "@/registry/new-york/ui/checkbox";
import { toast } from "sonner";

// Define the form schema
const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Role name is required" }),
  description: z.string().optional(),
  permissions: z.record(z.boolean()).default({}),
});

// Available permissions
const availablePermissions = [
  { id: "admin.access", label: "Admin Access" },
  { id: "users.view", label: "View Users" },
  { id: "users.create", label: "Create Users" },
  { id: "users.edit", label: "Edit Users" },
  { id: "users.delete", label: "Delete Users" },
  { id: "roles.view", label: "View Roles" },
  { id: "roles.create", label: "Create Roles" },
  { id: "roles.edit", label: "Edit Roles" },
  { id: "roles.delete", label: "Delete Roles" },
  { id: "profiles.view", label: "View Profiles" },
  { id: "profiles.create", label: "Create Profiles" },
  { id: "profiles.edit", label: "Edit Profiles" },
  { id: "profiles.delete", label: "Delete Profiles" },
];

export default function CreateRolePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);

    try {
      // Generate a unique ID if not provided
      const roleData = {
        ...values,
        id: values.id || nanoid(),
      };

      // API call to create the role
      const response = await fetch("/api/admin/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roleData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create role");
      }

      toast.success("Role created successfully");
      router.push("/admin/roles");
      router.refresh();
    } catch (error) {
      console.error("Error creating role:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create role",
      );
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Role Information</CardTitle>
              <CardDescription>
                Enter the basic information for the new role
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                      Optional custom ID for the role. If not provided, a unique
                      ID will be generated.
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>
                Select the permissions to grant to this role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availablePermissions.map((permission) => (
                  <FormField
                    key={permission.id}
                    control={form.control}
                    name={`permissions.${permission.id}`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>{permission.label}</FormLabel>
                          <FormDescription>{permission.id}</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href="/admin/roles">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Role"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
