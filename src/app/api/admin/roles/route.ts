import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { role } from "@/db/schema";
import { eq } from "drizzle-orm/expressions";

// Schema for role validation
const roleSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "Role name is required" }),
  description: z.string().optional(),
  permissions: z.record(z.boolean()).default({}),
});

export async function GET(
  request: Request,
  { params }: { params?: { id?: string } } = {},
) {
  try {
    if (params?.id) {
      // Get a specific role
      const result = await db.select().from(role).where(eq(role.id, params.id));

      if (!result.length) {
        return NextResponse.json({ error: "Role not found" }, { status: 404 });
      }

      return NextResponse.json(result[0]);
    } else {
      // Get all roles
      const result = await db.select().from(role);
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      { error: "Failed to fetch roles" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log("POST request to /api/admin/roles");
    const body = await request.json();
    console.log("Request body:", body);

    const validatedRole = roleSchema.parse(body);
    console.log("Validated role:", validatedRole);

    // Check if role with same ID already exists
    const existingRole = await db
      .select()
      .from(role)
      .where(eq(role.id, validatedRole.id));

    if (existingRole.length) {
      console.log("Role with ID already exists:", validatedRole.id);
      return NextResponse.json(
        { error: "Role with this ID already exists" },
        { status: 409 },
      );
    }

    // Insert new role
    console.log("Inserting new role:", validatedRole);
    const result = await db.insert(role).values({
      id: validatedRole.id,
      name: validatedRole.name,
      description: validatedRole.description,
      permissions: validatedRole.permissions,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("Role created successfully");

    return NextResponse.json(
      { success: true, role: validatedRole },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating role:", error);

    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors);
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create role" },
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
    const roleId = params.id;

    // Validate the request body (excluding id which we already have)
    const { name, description, permissions } = roleSchema
      .omit({ id: true })
      .parse(body);

    // Check if role exists
    const existingRole = await db
      .select()
      .from(role)
      .where(eq(role.id, roleId));

    if (!existingRole.length) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Update the role
    await db
      .update(role)
      .set({
        name,
        description,
        permissions,
        updatedAt: new Date(),
      })
      .where(eq(role.id, roleId));

    return NextResponse.json({ success: true });
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
