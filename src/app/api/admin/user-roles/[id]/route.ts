import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { user_role, user, role } from "@/db/schema";
import { eq } from "drizzle-orm/expressions";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const userRoleId = params.id;

    // Get a specific user-role with related data
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
      .where(eq(user_role.id, userRoleId));

    if (!result.length) {
      return NextResponse.json(
        { error: "User role not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error fetching user role:", error);
    return NextResponse.json(
      { error: "Failed to fetch user role" },
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
