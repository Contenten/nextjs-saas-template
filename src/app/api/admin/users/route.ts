import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/db/queries";
import { z } from "zod";
import crypto from "crypto";

// Validation schema for user creation
const userCreateSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  emailVerified: z.boolean().default(false),
  image: z.string().nullable().optional(),
});

// Generate a UUID using native Node.js crypto
function generateId() {
  return crypto.randomUUID();
}

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const validatedData = userCreateSchema.parse(body);

    // Check if user with email already exists
    const existingUser = await getUserByEmail(validatedData.email);

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 },
      );
    }

    // Create user with validated data
    const now = new Date();
    const user = await createUser({
      id: generateId(),
      name: validatedData.name,
      email: validatedData.email,
      emailVerified: validatedData.emailVerified,
      image: validatedData.image || null,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json(user, { status: 201 });
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
