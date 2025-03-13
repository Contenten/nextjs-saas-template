import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { user_role, user, role } from "@/db/schema";
import { eq, and } from "drizzle-orm/expressions";

// Schema for user-role validation
const userRoleSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required" }),
  roleId: z.string().min(1, { message: "Role ID is required" }),
});

export async function GET(
  request: Request,
  { params }: { params: { id?: string } },
) {
  try {
    if (params.id) {
      // Get a specific user-role
      const result = await db
        .select({
          userRole: user_role,
          userName: user.name,
          userEmail: user.email,
          roleName: role.name,
        })
        .from(user_role)
        .leftJoin(user, eq(user_role.userId, user.id))
        .leftJoin(role, eq(user_role.roleId, role.id))
        .where(eq(user_role.id, params.id));

      if (!result.length) {
        return NextResponse.json(
          { error: "User role not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(result[0]);
    } else {
      // Get all user-roles
      const result = await db
        .select({
          userRole: user_role,
          userName: user.name,
          userEmail: user.email,
          roleName: role.name,
        })
        .from(user_role)
        .leftJoin(user, eq(user_role.userId, user.id))
        .leftJoin(role, eq(user_role.roleId, role.id));

      return NextResponse.json(result);
    }
  } catch (error) {
    console.error("Error fetching user roles:", error);
    return NextResponse.json(
      { error: "Failed to fetch user roles" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { userId, roleId } = userRoleSchema.parse(body);

    // Check if user exists
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, userId));

    if (!existingUser.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if role exists
    const existingRole = await db
      .select()
      .from(role)
      .where(eq(role.id, roleId));

    if (!existingRole.length) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Check if user already has this role
    const existingUserRole = await db
      .select()
      .from(user_role)
      .where(and(eq(user_role.userId, userId), eq(user_role.roleId, roleId)));

    if (existingUserRole.length) {
      return NextResponse.json(
        { error: "User already has this role" },
        { status: 409 },
      );
    }

    // Insert new user-role
    const result = await db.insert(user_role).values({
      userId,
      roleId,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { success: true, message: "Role assigned successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating user role:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to assign role" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const userRoleId = params.id;

    // Check if user-role exists
    const existingUserRole = await db
      .select()
      .from(user_role)
      .where(eq(user_role.id, userRoleId));

    if (!existingUserRole.length) {
      return NextResponse.json(
        { error: "User role not found" },
        { status: 404 },
      );
    }

    // Delete the user-role
    await db.delete(user_role).where(eq(user_role.id, userRoleId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user role:", error);
    return NextResponse.json(
      { error: "Failed to delete user role" },
      { status: 500 },
    );
  }
}
