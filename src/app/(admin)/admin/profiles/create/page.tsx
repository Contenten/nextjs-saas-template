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
  bio: z.string().optional(),
  location: z.string().optional(),
  company: z.string().optional(),
  socialLinks: z.array(z.string()).optional(),
});

export default function CreateProfilePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<
    { id: string; name: string; email: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [socialLinkCount, setSocialLinkCount] = useState(1);

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "",
      bio: "",
      location: "",
      company: "",
      socialLinks: [""],
    },
  });

  // Watch social links to determine how many are visible
  const socialLinks = form.watch("socialLinks") || [];

  // Fetch users when component mounts
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch users
        const usersResponse = await fetch("/api/admin/users");
        if (!usersResponse.ok) throw new Error("Failed to fetch users");
        const usersData = await usersResponse.json();

        // Filter out users who already have profiles
        const profilesResponse = await fetch("/api/admin/profiles");
        if (!profilesResponse.ok) throw new Error("Failed to fetch profiles");
        const profilesData = await profilesResponse.json();

        const usersWithProfiles = new Set(
          profilesData.map((profile: any) => profile.profile.userId),
        );

        const availableUsers = usersData.filter(
          (user: any) => !usersWithProfiles.has(user.id),
        );

        setUsers(availableUsers);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load users");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Add another social link input field
  const addSocialLink = () => {
    const currentLinks = form.getValues("socialLinks") || [];
    form.setValue("socialLinks", [...currentLinks, ""]);
    setSocialLinkCount((prev) => prev + 1);
  };

  // Remove a social link input field
  const removeSocialLink = (index: number) => {
    const currentLinks = form.getValues("socialLinks") || [];
    if (currentLinks.length > 1) {
      const newLinks = [...currentLinks];
      newLinks.splice(index, 1);
      form.setValue("socialLinks", newLinks);
      setSocialLinkCount((prev) => prev - 1);
    }
  };

  // Submit handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      // Clean empty social links
      const cleanedSocialLinks = (values.socialLinks || []).filter(
        (link) => link.trim() !== "",
      );

      // API call to create the profile
      const response = await fetch("/api/admin/profiles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          socialLinks: cleanedSocialLinks,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create profile");
      }

      toast.success("Profile created successfully");
      router.push("/admin/profiles");
      router.refresh();
    } catch (error) {
      console.error("Error creating profile:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create profile",
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
          <h1 className="text-3xl font-bold tracking-tight">Create Profile</h1>
          <p className="text-muted-foreground">
            Create a user profile with additional information
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Create a profile with additional user information
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
                      The user for whom this profile will be created
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="User biography or about information"
                        className="resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A brief description about the user
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="San Francisco, CA" {...field} />
                    </FormControl>
                    <FormDescription>
                      The user's location or address
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Company name" {...field} />
                    </FormControl>
                    <FormDescription>
                      The user's company or organization
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Social Links</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSocialLink}
                  >
                    Add Link
                  </Button>
                </div>
                <FormDescription className="mt-0">
                  Add URLs to the user's social media profiles
                </FormDescription>

                {socialLinks.map((_, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name={`socialLinks.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              placeholder="https://twitter.com/username"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {socialLinks.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSocialLink(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href="/admin/profiles">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button
                type="submit"
                disabled={isSubmitting || users.length === 0}
              >
                {isSubmitting ? "Creating..." : "Create Profile"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
