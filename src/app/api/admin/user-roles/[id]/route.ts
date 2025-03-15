import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { user_role, user, role } from "@/db/schema";
import { eq } from "drizzle-orm/expressions";
import { getCurrentUser } from "@/app/(app)/actions";

// Schema for user-role update validation
const userRoleUpdateSchema = z.object({
  roleId: z.string().min(1, { message: "Role ID is required" }),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = await params;

    // Get a specific user-role with related information
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
      .where(eq(user_role.id, id));

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

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    // Get the current user with roles
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Check if current user is admin
    const adminRoles = await db
      .select()
      .from(role)
      .where(eq(role.name, "Admin"));

    const adminRoleIds = adminRoles.map((r) => r.id);

    const currentUserRoles = await db
      .select({ roleId: user_role.roleId })
      .from(user_role)
      .where(eq(user_role.userId, currentUser.id));

    const isAdmin = currentUserRoles.some((ur) =>
      adminRoleIds.includes(ur.roleId),
    );

    // Get the user role to update with related role info
    const userRoleData = await db
      .select({
        userRole: user_role,
        userId: user.id,
        roleId: role.id,
        roleName: role.name,
      })
      .from(user_role)
      .leftJoin(user, eq(user_role.userId, user.id))
      .leftJoin(role, eq(user_role.roleId, role.id))
      .where(eq(user_role.id, id))
      .limit(1);

    if (!userRoleData.length) {
      return NextResponse.json(
        { error: "User role not found" },
        { status: 404 },
      );
    }

    const userRoleInfo = userRoleData[0];

    // Check if the role being modified is an admin role
    const isAdminRole = userRoleInfo?.roleName === "Admin";

    // Check permissions:
    // 1. Users can edit their own roles
    // 2. Admins can edit any role except other admin roles
    const isOwnRole = currentUser.id === userRoleInfo?.userId;
    const canEdit = isOwnRole || (isAdmin && !isAdminRole);

    if (!canEdit) {
      return NextResponse.json(
        {
          error: isAdminRole
            ? "You cannot modify another admin's role"
            : "You can only update your own role assignments",
        },
        { status: 403 },
      );
    }

    // Parse and validate the request body
    const body = await request.json();
    const validatedData = userRoleUpdateSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validatedData.error.format() },
        { status: 400 },
      );
    }

    // Check if the requested role is an admin role (for security)
    const requestedRole = await db
      .select()
      .from(role)
      .where(eq(role.id, validatedData.data.roleId))
      .limit(1);

    if (!requestedRole.length) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    const isRequestingAdminRole = requestedRole[0]?.name === "Admin";

    // Prevent non-admins from becoming admins
    if (isRequestingAdminRole && !isAdmin) {
      return NextResponse.json(
        { error: "You don't have permission to assign admin roles" },
        { status: 403 },
      );
    }

    // Update the user role
    const updatedUserRole = await db
      .update(user_role)
      .set({
        roleId: validatedData.data.roleId,
      })
      .where(eq(user_role.id, id))
      .returning();

    return NextResponse.json(updatedUserRole[0]);
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    // Get the current user with roles
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Check if current user is admin
    const adminRoles = await db
      .select()
      .from(role)
      .where(eq(role.name, "Admin"));

    const adminRoleIds = adminRoles.map((r) => r.id);

    const currentUserRoles = await db
      .select({ roleId: user_role.roleId })
      .from(user_role)
      .where(eq(user_role.userId, currentUser.id));

    const isAdmin = currentUserRoles.some((ur) =>
      adminRoleIds.includes(ur.roleId),
    );

    // Get the user role to delete with related role info
    const userRoleData = await db
      .select({
        userRole: user_role,
        userId: user.id,
        roleId: role.id,
        roleName: role.name,
      })
      .from(user_role)
      .leftJoin(user, eq(user_role.userId, user.id))
      .leftJoin(role, eq(user_role.roleId, role.id))
      .where(eq(user_role.id, id))
      .limit(1);

    if (!userRoleData.length) {
      return NextResponse.json(
        { error: "User role not found" },
        { status: 404 },
      );
    }

    const userRoleInfo = userRoleData[0];

    // Check if the role being deleted is an admin role
    const isAdminRole = userRoleInfo?.roleName === "Admin";

    // Check permissions:
    // 1. Users can delete their own roles
    // 2. Admins can delete any role except other admin roles
    const isOwnRole = currentUser.id === userRoleInfo?.userId;
    const canDelete = isOwnRole || (isAdmin && !isAdminRole);

    if (!canDelete) {
      return NextResponse.json(
        {
          error: isAdminRole
            ? "You cannot delete another admin's role"
            : "You can only delete your own role assignments",
        },
        { status: 403 },
      );
    }

    // Delete the user role
    await db.delete(user_role).where(eq(user_role.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user role:", error);
    return NextResponse.json(
      { error: "Failed to delete user role" },
      { status: 500 },
    );
  }
}
