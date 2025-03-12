import { NextRequest, NextResponse } from "next/server";
import { getUserById, updateUser, deleteUser } from "@/db/queries";
import { z } from "zod";

// Validation schema for user update
const userUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  emailVerified: z.boolean().optional(),
  image: z.string().nullable().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = await params;
    // Get user by ID
    const user = await getUserById(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = userUpdateSchema.parse(body);

    // Only update fields that were provided
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (validatedData.name !== undefined) {
      updateData.name = validatedData.name;
    }

    if (validatedData.email !== undefined) {
      updateData.email = validatedData.email;
    }

    if (validatedData.emailVerified !== undefined) {
      updateData.emailVerified = validatedData.emailVerified;
    }

    if (validatedData.image !== undefined) {
      updateData.image = validatedData.image;
    }

    // Update user in database
    const updatedUser = await updateUser(id, updateData);

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.format() },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Get user by ID
    const { id } = await params;
    const user = await getUserById(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete user from database (this will cascade to related records)
    await deleteUser(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);

    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
}
