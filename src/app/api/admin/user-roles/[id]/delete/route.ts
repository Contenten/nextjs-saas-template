import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { user_role } from "@/db/schema";
import { eq } from "drizzle-orm/expressions";
import { redirect } from "next/navigation";

export async function GET(
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
      return new Response("User role not found", { status: 404 });
    }

    // Delete the user-role
    await db.delete(user_role).where(eq(user_role.id, userRoleId));

    // Redirect back to the user-roles list
    return NextResponse.redirect(new URL("/admin/user-roles", request.url));
  } catch (error) {
    console.error("Error deleting user role:", error);
    return new Response("Failed to delete user role", { status: 500 });
  }
}
