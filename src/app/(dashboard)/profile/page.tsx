"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/registry/new-york/ui/button";
import { Input } from "@/registry/new-york/ui/input";
import { Label } from "@/registry/new-york/ui/label";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/registry/new-york/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/registry/new-york/ui/card";
import { Badge } from "@/registry/new-york/ui/badge";
import { toast } from "sonner";
import {
  Mail,
  Calendar,
  Link as LinkIcon,
  Settings,
  PenSquare,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/registry/new-york/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Textarea } from "@/registry/new-york/ui/textarea";

// Interface for user profile data
interface UserProfile {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string; // ISO date string
  // Additional fields that might be fetched
  bio?: string;
  urls?: { value: string }[];
}

const ProfilePage = () => {
  const sessionData = useSession();
  const isLoading = sessionData.isPending;
  const session = sessionData.data;
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [refreshProfile, setRefreshProfile] = useState(0);

  useEffect(() => {
    // If we have a session, fetch the user profile
    if (session?.user) {
      fetchUserProfile(session.user.id);
    }
  }, [session, refreshProfile]);

  // Fetch user profile from the database
  const fetchUserProfile = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Failed to load profile. Please try again.");
    }
  };

  // Handle quick profile update
  const handleQuickUpdate = async (data: z.infer<typeof profileFormSchema>) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.displayName,
          bio: data.bio,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      toast.success("Profile updated successfully");
      setIsEditing(false);
      // Trigger a refresh of the profile data
      setRefreshProfile((prev) => prev + 1);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-lg">Loading profile...</div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to view your profile.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Profile Form Schema
  const profileFormSchema = z.object({
    displayName: z.string().min(1, {
      message: "Display name is required",
    }),
    bio: z.string().optional(),
  });

  // Display profile information
  const DisplayedProfile = () => {
    return (
      <div className="flex flex-col items-center gap-2">
        {user?.emailVerified ? (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 hover:bg-green-200"
          >
            Email Verified
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="bg-amber-100 text-amber-800 hover:bg-amber-200"
          >
            Email Not Verified
          </Badge>
        )}
        <p className="text-sm text-muted-foreground flex items-center mt-4">
          <Calendar className="h-4 w-4 mr-2" />
          Member since{" "}
          {user?.createdAt
            ? format(new Date(user.createdAt), "MMMM yyyy")
            : "N/A"}
        </p>
        <Button className="mt-4" onClick={() => setIsEditing(true)}>
          <PenSquare className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </div>
    );
  };

  // Profile Edit Form
  const ProfileForm = () => {
    const form = useForm<z.infer<typeof profileFormSchema>>({
      resolver: zodResolver(profileFormSchema),
      defaultValues: {
        displayName: user?.name || "",
        bio: user?.bio || "",
      },
    });

    const onSubmit = (data: z.infer<typeof profileFormSchema>) => {
      handleQuickUpdate(data);
    };

    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 w-full"
        >
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem className="flex flex-col items-start">
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem className="flex flex-col items-start">
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us a little about yourself"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Update Profile</Button>
          </div>
        </form>
      </Form>
    );
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/settings/account">
            <Settings className="mr-2 h-4 w-4" />
            Account Settings
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Profile Summary Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Avatar className="w-24 h-24 mx-auto">
                {user?.image ? (
                  <AvatarImage src={user.image} alt={user.name} />
                ) : (
                  <AvatarFallback className="text-2xl">
                    {user?.name?.charAt(0) || "?"}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
            {isEditing ? null : <CardTitle>{user?.name}</CardTitle>}
            <CardDescription className="flex items-center justify-center">
              <Mail className="h-4 w-4 mr-1" />
              {user?.email}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {isEditing ? <ProfileForm /> : <DisplayedProfile />}
          </CardContent>
        </Card>

        {/* Additional Profile Details Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>
              Additional information about your profile and account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Bio Section */}
              <div>
                <h3 className="text-lg font-medium mb-2">About</h3>
                <p className="text-sm text-muted-foreground">
                  {user?.bio || "No bio information provided yet."}
                </p>
              </div>

              {/* Social Media Links Placeholder */}
              <div>
                <h3 className="text-lg font-medium mb-2">Social Media</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center p-2 rounded-md border">
                    <LinkIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      No links added yet
                    </span>
                  </div>
                </div>
              </div>

              {/* Account Statistics Placeholder */}
              <div>
                <h3 className="text-lg font-medium mb-2">Account Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-md border">
                    <p className="text-xs text-muted-foreground">
                      Account Type
                    </p>
                    <p className="font-medium">Free</p>
                  </div>
                  <div className="p-3 rounded-md border">
                    <p className="text-xs text-muted-foreground">
                      Member Since
                    </p>
                    <p className="font-medium">
                      {user?.createdAt
                        ? format(new Date(user.createdAt), "MMMM d, yyyy")
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/settings">Manage Full Profile</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
