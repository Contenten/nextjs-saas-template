import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { role } from "@/db/schema";
import { eq } from "drizzle-orm/expressions";

// Schema for role validation
const roleUpdateSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().optional().nullable(),
  permissions: z.record(z.boolean()).default({}),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const roleId = params.id;
    const body = await request.json();

    // Validate the update data
    const { name, description, permissions } = roleUpdateSchema.parse(body);

    // Check if role exists
    const existingRole = await db
      .select()
      .from(role)
      .where(eq(role.id, roleId));

    if (!existingRole.length) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Check for duplicate name (excluding current role)
    const checkName = await db.select().from(role).where(eq(role.name, name));

    // Make sure we have a result and the ID doesn't match the current role
    if (checkName.length && checkName[0]?.id !== roleId) {
      return NextResponse.json(
        { error: "A role with this name already exists" },
        { status: 409 },
      );
    }

    // Update the role
    const updatedRole = await db
      .update(role)
      .set({
        name,
        description,
        permissions,
        updatedAt: new Date(),
      })
      .where(eq(role.id, roleId))
      .returning();

    return NextResponse.json(updatedRole[0]);
  } catch (error) {
    console.error("Error updating role:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 },
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const roleId = params.id;

    // Get a specific role
    const result = await db.select().from(role).where(eq(role.id, roleId));

    if (!result.length) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error fetching role:", error);
    return NextResponse.json(
      { error: "Failed to fetch role" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const roleId = params.id;

    // Check if role exists
    const existingRole = await db
      .select()
      .from(role)
      .where(eq(role.id, roleId));

    if (!existingRole.length) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Don't allow deletion of core roles
    if (["admin", "user", "moderator"].includes(roleId)) {
      return NextResponse.json(
        { error: "Cannot delete a core system role" },
        { status: 403 },
      );
    }

    // Delete the role
    await db.delete(role).where(eq(role.id, roleId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting role:", error);
    return NextResponse.json(
      { error: "Failed to delete role" },
      { status: 500 },
    );
  }
}
