"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Profile } from "@/db/schema";
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

// Profile form schema for the actual form fields
const profileFormSchema = z.object({
  bio: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  // Keep socialLinks as string in the form
  socialLinksString: z.string().optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileEditForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Convert social links array to newline-separated string for the form
  const defaultValues: ProfileFormValues = {
    bio: profile.bio,
    location: profile.location,
    company: profile.company,
    socialLinksString: profile.socialLinks
      ? profile.socialLinks.join("\n")
      : "",
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  });

  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true);

    // Parse social links from the form string
    const socialLinks = data.socialLinksString
      ? data.socialLinksString
          .split("\n")
          .map((link) => link.trim())
          .filter(Boolean)
      : [];

    try {
      const response = await fetch(`/api/admin/profiles/${profile.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bio: data.bio,
          location: data.location,
          company: data.company,
          socialLinks: socialLinks,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }

      toast.success("Profile updated successfully");
      router.refresh();
      router.push(`/admin/profiles/${profile.id}`);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile",
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
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about the user..."
                    className="min-h-[120px]"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>
                  A brief description about the user.
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
                  <Input
                    placeholder="City, Country"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>Where the user is located.</FormDescription>
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
                  <Input
                    placeholder="Company name"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>
                  The user's company or organization.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="socialLinksString"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Social Links</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="https://twitter.com/username&#10;https://github.com/username"
                    className="min-h-[120px]"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>Add one social link per line.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-4">
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
