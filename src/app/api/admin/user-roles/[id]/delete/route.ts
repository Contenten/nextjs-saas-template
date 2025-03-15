import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { user_role, user } from "@/db/schema";
import { eq } from "drizzle-orm/expressions";
import { getCurrentUser } from "@/app/(app)/actions";
import { redirect } from "next/navigation";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = await params;

    // Get the current user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get the user role to delete
    const userRoleData = await db
      .select({
        userRole: user_role,
        userId: user.id,
      })
      .from(user_role)
      .leftJoin(user, eq(user_role.userId, user.id))
      .where(eq(user_role.id, id))
      .limit(1);

    if (!userRoleData.length) {
      return NextResponse.json(
        { error: "User role not found" },
        { status: 404 },
      );
    }

    const userRoleInfo = userRoleData[0];

    // Check if the current user is the owner of this role assignment
    if (currentUser.id !== userRoleInfo?.userId) {
      return NextResponse.json(
        { error: "You can only delete your own role assignments" },
        { status: 403 },
      );
    }

    // Delete the user role
    await db.delete(user_role).where(eq(user_role.id, id));

    // Redirect back to the user roles page
    redirect("/admin/user-roles");
  } catch (error) {
    console.error("Error deleting user role:", error);
    return NextResponse.json(
      { error: "Failed to delete user role" },
      { status: 500 },
    );
  }
}
