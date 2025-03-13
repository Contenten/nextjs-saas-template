import { notFound } from "next/navigation";
import { db } from "@/db/drizzle";
import { profile, user } from "@/db/schema";
import { eq } from "drizzle-orm/expressions";
import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/new-york/ui/card";
import { Button } from "@/registry/new-york/ui/button";
import Link from "next/link";
import { format } from "date-fns";

export const metadata: Metadata = {
  title: "View Profile | Admin Dashboard",
  description: "View user profile details",
};

export default async function ProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  // Fetch profile with user info
  const profileData = await db
    .select({
      profile: profile,
      userName: user.name,
      userEmail: user.email,
      userImage: user.image,
    })
    .from(profile)
    .leftJoin(user, eq(profile.userId, user.id))
    .where(eq(profile.id, id));

  if (!profileData.length) {
    notFound();
  }

  // We've confirmed profileData has at least one item
  const profileInfo = profileData[0]?.profile;
  const userName = profileData[0]?.userName;
  const userEmail = profileData[0]?.userEmail;
  const userImage = profileData[0]?.userImage;

  if (!profileInfo) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile Details</h1>
          <p className="text-muted-foreground">
            View details for user profile.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/profiles/${id}/edit`}>
            <Button>Edit Profile</Button>
          </Link>
          <Link href="/admin/profiles">
            <Button variant="outline">Back to Profiles</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {userImage && (
              <img
                src={userImage}
                alt={userName || "User"}
                className="h-10 w-10 rounded-full"
              />
            )}
            {userName || "Unnamed User"}
          </CardTitle>
          <CardDescription>{userEmail}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">Bio</h3>
            <p className="text-sm text-muted-foreground">
              {profileInfo.bio || "No bio provided"}
            </p>
          </div>

          <div>
            <h3 className="font-medium">Location</h3>
            <p className="text-sm text-muted-foreground">
              {profileInfo.location || "No location provided"}
            </p>
          </div>

          <div>
            <h3 className="font-medium">Company</h3>
            <p className="text-sm text-muted-foreground">
              {profileInfo.company || "No company provided"}
            </p>
          </div>

          {profileInfo.socialLinks && profileInfo.socialLinks.length > 0 && (
            <div>
              <h3 className="font-medium">Social Links</h3>
              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                {profileInfo.socialLinks.map((link: string, index: number) => (
                  <li key={index}>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <div className="text-xs text-muted-foreground">
            <p>
              Created:{" "}
              {profileInfo.createdAt
                ? format(profileInfo.createdAt, "PPP")
                : "Unknown"}
            </p>
            <p>
              Last Updated:{" "}
              {profileInfo.updatedAt
                ? format(profileInfo.updatedAt, "PPP")
                : "Unknown"}
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
