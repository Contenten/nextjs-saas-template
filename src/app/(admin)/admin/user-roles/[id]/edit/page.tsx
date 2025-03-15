import { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/db/drizzle";
import { user_role, user, role } from "@/db/schema";
import { eq } from "drizzle-orm/expressions";
import { getCurrentUser } from "@/app/(app)/actions";
import { getCurrentUserWithRoles } from "@/app/(admin)/actions";
// Import the form component with the correct file name
import UserRoleEditForm from "./UserRoleEditForm";

export const metadata: Metadata = {
  title: "Edit User Role | Admin Dashboard",
  description: "Edit user role assignment",
};

export default async function EditUserRolePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  // Get the user role with related user and role information
  const userRoleData = await db
    .select({
      userRole: user_role,
      userName: user.name,
      userEmail: user.email,
      userId: user.id,
      roleName: role.name,
      roleId: role.id,
    })
    .from(user_role)
    .leftJoin(user, eq(user_role.userId, user.id))
    .leftJoin(role, eq(user_role.roleId, role.id))
    .where(eq(user_role.id, id))
    .limit(1);

  if (!userRoleData.length) {
    notFound();
  }

  const userRoleInfo = userRoleData[0];

  // Get current user with roles to check admin status
  const currentUser = await getCurrentUserWithRoles();
  if (!currentUser) {
    return <div>Authentication required</div>;
  }

  // Check if the role being edited is an admin role
  const isAdminRole = userRoleInfo?.roleName === "Admin";

  // Check if the current user is the owner of this role assignment
  const isOwnRole = currentUser?.id === userRoleInfo?.userId;

  // Admins can edit any non-admin role, users can only edit their own roles
  const canEdit = isOwnRole || (currentUser.isAdmin && !isAdminRole);

  // If not allowed to edit, prevent editing
  if (!canEdit) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit User Role</h1>
          <p className="text-muted-foreground">
            {isAdminRole
              ? "You cannot edit another admin's role"
              : "You can only edit your own role assignments"}
          </p>
        </div>
        <div className="rounded-md bg-destructive/15 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-destructive"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-destructive">
                Permission denied
              </h3>
              <div className="mt-2 text-sm text-destructive/80">
                <p>
                  {isAdminRole
                    ? `You cannot edit another admin's role. This role belongs to ${userRoleInfo?.userName}.`
                    : `You can only edit your own role assignments. This role belongs to ${userRoleInfo?.userName}.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get all available roles for the dropdown
  const availableRoles = await db.select().from(role);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit User Role</h1>
        <p className="text-muted-foreground">
          Update role assignment for {userRoleInfo?.userName}
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        {userRoleInfo && (
          <UserRoleEditForm
            userRole={userRoleInfo.userRole}
            userName={userRoleInfo.userName || ""}
            currentRoleId={userRoleInfo.roleId || ""}
            currentRoleName={userRoleInfo.roleName || ""}
            availableRoles={availableRoles}
            isAdmin={currentUser.isAdmin}
          />
        )}
      </div>
    </div>
  );
}
