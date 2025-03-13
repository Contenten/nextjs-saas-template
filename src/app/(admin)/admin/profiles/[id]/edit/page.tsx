import { notFound } from "next/navigation";
import { db } from "@/db/drizzle";
import { profile, user } from "@/db/schema";
import { eq } from "drizzle-orm/expressions";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/registry/new-york/ui/button";
import ProfileEditForm from "./profile-edit-form";

export const metadata: Metadata = {
  title: "Edit Profile | Admin Dashboard",
  description: "Edit user profile details",
};

export default async function ProfileEditPage({
  params,
}: {
  params: { id: string };
}) {
  const profileId = params.id;

  // Fetch profile with user info
  const profileData = await db
    .select({
      profile: profile,
      userName: user.name,
      userEmail: user.email,
    })
    .from(profile)
    .leftJoin(user, eq(profile.userId, user.id))
    .where(eq(profile.id, profileId));

  if (!profileData.length) {
    notFound();
  }

  const profileInfo = profileData[0]?.profile;
  const userName = profileData[0]?.userName;

  if (!profileInfo) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
          <p className="text-muted-foreground">
            Update profile details for {userName || "user"}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/profiles/${profileId}`}>
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>
      </div>

      <ProfileEditForm profile={profileInfo} />
    </div>
  );
}
