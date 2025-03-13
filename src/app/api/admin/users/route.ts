import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { user } from "@/db/schema";
import { count } from "drizzle-orm";
import { z } from "zod";
import crypto from "crypto";

// Validation schema for user creation
const userCreateSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  emailVerified: z.boolean().default(false),
  image: z.string().nullable().optional(),
});

// Generate a UUID
function generateId() {
  return crypto.randomUUID();
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    // Fetch users with pagination
    const users = await db.select().from(user).limit(limit).offset(offset);

    // Get total count for pagination
    const totalCountResult = await db.select({ value: count() }).from(user);
    const total = totalCountResult[0]?.value ?? 0;

    return NextResponse.json({ users, total });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request body
    const validatedData = userCreateSchema.parse(body);

    // Generate ID and timestamps
    const userId = generateId();
    const now = new Date();

    // Create user
    const result = await db
      .insert(user)
      .values({
        id: userId,
        name: validatedData.name,
        email: validatedData.email,
        emailVerified: validatedData.emailVerified,
        image: validatedData.image,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error creating user:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.format() },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}
