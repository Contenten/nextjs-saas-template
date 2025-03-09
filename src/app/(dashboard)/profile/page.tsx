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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/new-york/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/new-york/ui/tabs";
import { toast } from "sonner";

// Interface for user profile data
interface UserProfile {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
}

const ProfilePage = () => {
  const sessionData = useSession();
  const isLoading = sessionData.isPending;
  const session = sessionData.data;
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [refreshProfile, setRefreshProfile] = useState(0);

  // Form states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

      // Set form values
      setUsername(userData.name || "");
      setEmail(userData.email || "");
      setAvatarUrl(userData.image || "");
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Failed to load profile. Please try again.");
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: username,
          // TODO: Add image upload to static server, such as Cloudflare R2
          image: avatarUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      toast.success("Profile updated successfully");
      // Trigger a refresh of the profile data
      setRefreshProfile((prev) => prev + 1);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle email change request
  const handleEmailChangeRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/users/${user.id}/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to request email change");
      }

      setShowEmailVerification(false);
      toast.success("Verification email sent. Please check your inbox.");
    } catch (error) {
      console.error("Error requesting email change:", error);
      toast.error("Failed to request email change. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle password change request
  const handlePasswordChangeRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/users/${user.id}/password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to request password change");
      }

      setShowPasswordChange(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success(
        "Verification email sent. Please check your inbox to complete password change.",
      );
    } catch (error) {
      console.error("Error requesting password change:", error);
      toast.error("Failed to request password change. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading profile...
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Please sign in to view your profile.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your profile information and avatar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-col items-center mb-6 sm:flex-row sm:items-start">
                  <Avatar className="w-24 h-24 mb-4 sm:mr-6 sm:mb-0">
                    {user?.image ? (
                      <AvatarImage src={user.image} alt={user.name} />
                    ) : (
                      <AvatarFallback>
                        {user?.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div className="flex-1">
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Name</Label>
                        <Input
                          id="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Your name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="avatarUrl">Avatar URL</Label>
                        <Input
                          id="avatarUrl"
                          value={avatarUrl}
                          onChange={(e) => setAvatarUrl(e.target.value)}
                          placeholder="https://example.com/avatar.jpg"
                        />
                      </div>

                      <div>
                        <Button type="submit" disabled={isUpdating}>
                          {isUpdating ? "Updating..." : "Update Profile"}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      {/* manually add a verification badge */}
                      <h3 className="text-lg font-medium">Email Address</h3>
                      <p className="text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                      {!user?.emailVerified && (
                        <p className="text-sm text-red-500 mt-1">
                          Email not verified
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setShowEmailVerification(!showEmailVerification)
                      }
                    >
                      Change Email
                    </Button>
                  </div>

                  {showEmailVerification && (
                    <form
                      onSubmit={handleEmailChangeRequest}
                      className="space-y-4 p-4 border rounded-md"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="email">New Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="new-email@example.com"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        You will receive a verification email to confirm this
                        change.
                      </p>
                      <Button type="submit" disabled={isUpdating}>
                        {isUpdating ? "Sending..." : "Send Verification"}
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your security settings and change your password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-medium">Password</h3>
                  <p className="text-sm text-muted-foreground">
                    Change your password and keep your account secure
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordChange(!showPasswordChange)}
                >
                  Change Password
                </Button>
              </div>

              {showPasswordChange && (
                <form
                  onSubmit={handlePasswordChangeRequest}
                  className="space-y-4 p-4 border rounded-md"
                >
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    {/* TODO: add a visibility toggle */}
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    {/* TODO: add a visibility toggle */}
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <p className="text-sm text-muted-foreground">
                    You will receive a verification email to confirm this
                    change.
                  </p>

                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? "Processing..." : "Change Password"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
