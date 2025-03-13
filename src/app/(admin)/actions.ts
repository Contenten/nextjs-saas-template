import { getUserRoles, hasRole } from "@/db/queries";
import { getCurrentUser } from "../(app)/actions";

/**
 * Check if the current user has a specific role
 */
export async function hasUserRole(roleName: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) {
    return false;
  }

  return hasRole(user.id, roleName);
}

/**
 * Get the current user with their roles
 */
export async function getCurrentUserWithRoles() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return null;
    }

    const roles = await getUserRoles(user.id);

    return {
      ...user,
      roles,
      isAdmin: roles.some((role) => role.name === "Admin"),
    };
  } catch (error) {
    console.error("Error getting user with roles:", error);
    return null;
  }
}
