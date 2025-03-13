"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/new-york/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/new-york/ui/select";
import { toast } from "sonner";

// Define the form schema
const formSchema = z.object({
  userId: z.string().min(1, { message: "User is required" }),
  roleId: z.string().min(1, { message: "Role is required" }),
});

export default function CreateUserRolePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<
    { id: string; name: string; email: string }[]
  >([]);
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "",
      roleId: "",
    },
  });

  // Fetch users and roles when component mounts
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch users
        const usersResponse = await fetch("/api/admin/users");
        if (!usersResponse.ok) throw new Error("Failed to fetch users");
        const usersData = await usersResponse.json();

        // Fetch roles
        const rolesResponse = await fetch("/api/admin/roles");
        if (!rolesResponse.ok) throw new Error("Failed to fetch roles");
        const rolesData = await rolesResponse.json();

        // Check if usersData is an array, otherwise try to extract the array from the response
        const usersArray = Array.isArray(usersData)
          ? usersData
          : usersData.data || usersData.users || [];

        // Check if rolesData is an array, otherwise try to extract the array from the response
        const rolesArray = Array.isArray(rolesData)
          ? rolesData
          : rolesData.data || rolesData.roles || [];

        setUsers(usersArray);
        setRoles(rolesArray);

        // Log for debugging
        console.log("Users data structure:", usersData);
        console.log("Processed users array:", usersArray);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load users or roles");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Submit handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      // API call to create the user-role assignment
      const response = await fetch("/api/admin/user-roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to assign role");
      }

      toast.success("Role assigned successfully");
      router.push("/admin/user-roles");
      router.refresh();
    } catch (error) {
      console.error("Error assigning role:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to assign role",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assign Role</h1>
          <p className="text-muted-foreground">Assign a role to a user</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Role Assignment</CardTitle>
              <CardDescription>
                Select a user and role to assign
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={users.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The user who will receive the role
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="roleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={roles.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The role to assign to the user
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href="/admin/user-roles">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button
                type="submit"
                disabled={
                  isSubmitting || users.length === 0 || roles.length === 0
                }
              >
                {isSubmitting ? "Assigning..." : "Assign Role"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
