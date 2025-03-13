import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { profile } from "@/db/schema";
import { eq } from "drizzle-orm/expressions";

// Schema for profile validation
const profileUpdateSchema = z.object({
  bio: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  socialLinks: z.array(z.string()).optional().nullable(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const profileId = params.id;
    const body = await request.json();

    // Validate the update data
    const { bio, location, company, socialLinks } =
      profileUpdateSchema.parse(body);

    // Check if profile exists
    const existingProfile = await db
      .select()
      .from(profile)
      .where(eq(profile.id, profileId));

    if (!existingProfile.length) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Update the profile
    const updatedProfile = await db
      .update(profile)
      .set({
        bio,
        location,
        company,
        socialLinks,
        updatedAt: new Date(),
      })
      .where(eq(profile.id, profileId))
      .returning();

    return NextResponse.json(updatedProfile[0]);
  } catch (error) {
    console.error("Error updating profile:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const profileId = params.id;

    // Get a specific profile
    const result = await db
      .select()
      .from(profile)
      .where(eq(profile.id, profileId));

    if (!result.length) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const profileId = params.id;

    // Check if profile exists
    const existingProfile = await db
      .select()
      .from(profile)
      .where(eq(profile.id, profileId));

    if (!existingProfile.length) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Delete the profile
    await db.delete(profile).where(eq(profile.id, profileId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting profile:", error);
    return NextResponse.json(
      { error: "Failed to delete profile" },
      { status: 500 },
    );
  }
}
