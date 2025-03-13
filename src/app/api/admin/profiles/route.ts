import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { profile, user } from "@/db/schema";
import { eq } from "drizzle-orm/expressions";

// Schema for profile validation
const profileSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required" }),
  bio: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  socialLinks: z.array(z.string()).optional().nullable(),
});

export async function GET(
  request: Request,
  { params }: { params?: { id?: string } } = {},
) {
  try {
    if (params?.id) {
      // Get a specific profile
      const result = await db
        .select({
          profile: profile,
          userName: user.name,
          userEmail: user.email,
        })
        .from(profile)
        .leftJoin(user, eq(profile.userId, user.id))
        .where(eq(profile.id, params.id));

      if (!result.length) {
        return NextResponse.json(
          { error: "Profile not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(result[0]);
    } else {
      // Get all profiles
      const result = await db
        .select({
          profile: profile,
          userName: user.name,
          userEmail: user.email,
        })
        .from(profile)
        .leftJoin(user, eq(profile.userId, user.id));

      return NextResponse.json(result);
    }
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return NextResponse.json(
      { error: "Failed to fetch profiles" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validatedProfile = profileSchema.parse(body);

    // Check if user exists
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, validatedProfile.userId));

    if (!existingUser.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if profile already exists for this user
    const existingProfile = await db
      .select()
      .from(profile)
      .where(eq(profile.userId, validatedProfile.userId));

    if (existingProfile.length) {
      return NextResponse.json(
        { error: "Profile already exists for this user" },
        { status: 409 },
      );
    }

    // Insert new profile
    const result = await db.insert(profile).values({
      userId: validatedProfile.userId,
      bio: validatedProfile.bio || null,
      location: validatedProfile.location || null,
      company: validatedProfile.company || null,
      socialLinks: validatedProfile.socialLinks || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { success: true, message: "Profile created successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating profile:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create profile" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();
    const profileId = params.id;

    // Validate the request body
    const validatedProfile = profileSchema.omit({ userId: true }).parse(body);

    // Check if profile exists
    const existingProfile = await db
      .select()
      .from(profile)
      .where(eq(profile.id, profileId));

    if (!existingProfile.length) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Update the profile
    await db
      .update(profile)
      .set({
        bio: validatedProfile.bio,
        location: validatedProfile.location,
        company: validatedProfile.company,
        socialLinks: validatedProfile.socialLinks,
        updatedAt: new Date(),
      })
      .where(eq(profile.id, profileId));

    return NextResponse.json({ success: true });
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
