import { db } from "./drizzle";
import {
  user,
  session,
  account,
  verification,
  profile,
  role,
  user_role,
} from "./schema";
import type {
  NewUser,
  NewSession,
  NewAccount,
  NewVerification,
  NewProfile,
  NewRole,
  NewUserRole,
} from "./schema";
import { and, eq, inArray, sql } from "drizzle-orm";

// User queries
export async function getUserById(id: string) {
  const users = await db.select().from(user).where(eq(user.id, id)).limit(1);

  return users[0] || null;
}

export async function getUserByEmail(email: string) {
  const users = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  return users[0] || null;
}

export async function createUser(userData: NewUser) {
  const result = await db.insert(user).values(userData).returning();
  return result[0];
}

export async function updateUser(id: string, userData: Partial<NewUser>) {
  const result = await db
    .update(user)
    .set(userData)
    .where(eq(user.id, id))
    .returning();

  return result[0];
}

export async function deleteUser(id: string) {
  return db.delete(user).where(eq(user.id, id));
}

export async function listUsers(limit: number = 10, offset: number = 0) {
  return db.select().from(user).limit(limit).offset(offset);
}

// Session queries
export async function getSessionByToken(token: string) {
  const sessions = await db
    .select()
    .from(session)
    .where(eq(session.token, token))
    .limit(1);

  return sessions[0] || null;
}

export async function createSession(sessionData: NewSession) {
  const result = await db.insert(session).values(sessionData).returning();
  return result[0];
}

export async function deleteSession(id: string) {
  return db.delete(session).where(eq(session.id, id));
}

export async function getUserWithSession(userId: string) {
  const result = await db
    .select({
      user: user,
      session: session,
    })
    .from(user)
    .leftJoin(session, eq(user.id, session.userId))
    .where(eq(user.id, userId));

  return result;
}

// Account queries
export async function getAccountByUserId(userId: string) {
  const accounts = await db
    .select()
    .from(account)
    .where(eq(account.userId, userId));

  return accounts;
}

export async function getAccountByProviderIdAndAccountId(
  providerId: string,
  accountId: string,
) {
  const accounts = await db
    .select()
    .from(account)
    .where(
      and(eq(account.providerId, providerId), eq(account.accountId, accountId)),
    )
    .limit(1);

  return accounts[0] || null;
}

export async function createAccount(accountData: NewAccount) {
  const result = await db.insert(account).values(accountData).returning();
  return result[0];
}

export async function deleteAccount(id: string) {
  return db.delete(account).where(eq(account.id, id));
}

// Verification queries
export async function getVerificationByIdentifier(identifier: string) {
  const verifications = await db
    .select()
    .from(verification)
    .where(eq(verification.identifier, identifier))
    .limit(1);

  return verifications[0] || null;
}

export async function getVerificationByValue(value: string) {
  const verifications = await db
    .select()
    .from(verification)
    .where(eq(verification.value, value))
    .limit(1);

  return verifications[0] || null;
}

export async function createVerification(verificationData: NewVerification) {
  const result = await db
    .insert(verification)
    .values(verificationData)
    .returning();
  return result[0];
}

export async function deleteVerification(id: string) {
  return db.delete(verification).where(eq(verification.id, id));
}

export async function deleteExpiredVerifications() {
  return db.delete(verification).where(sql`${verification.expiresAt} < NOW()`);
}

// Profile queries
export async function getProfileByUserId(userId: string) {
  const profiles = await db
    .select()
    .from(profile)
    .where(eq(profile.userId, userId))
    .limit(1);

  return profiles[0] || null;
}

export async function createProfile(profileData: NewProfile) {
  const result = await db.insert(profile).values(profileData).returning();
  return result[0];
}

export async function updateProfile(
  id: string,
  profileData: Partial<NewProfile>,
) {
  const result = await db
    .update(profile)
    .set(profileData)
    .where(eq(profile.id, id))
    .returning();

  return result[0];
}

export async function deleteProfile(id: string) {
  return db.delete(profile).where(eq(profile.id, id));
}

// Role queries
export async function getRoleById(id: string) {
  const roles = await db.select().from(role).where(eq(role.id, id)).limit(1);

  return roles[0] || null;
}

export async function getRoleByName(name: string) {
  const roles = await db
    .select()
    .from(role)
    .where(eq(role.name, name))
    .limit(1);

  return roles[0] || null;
}

export async function createRole(roleData: NewRole) {
  const result = await db.insert(role).values(roleData).returning();
  return result[0];
}

export async function updateRole(id: string, roleData: Partial<NewRole>) {
  const result = await db
    .update(role)
    .set(roleData)
    .where(eq(role.id, id))
    .returning();

  return result[0];
}

export async function deleteRole(id: string) {
  return db.delete(role).where(eq(role.id, id));
}

export async function listRoles(limit: number = 10, offset: number = 0) {
  return db.select().from(role).limit(limit).offset(offset);
}

// UserRole queries
export async function assignRoleToUser(userRoleData: NewUserRole) {
  const result = await db.insert(user_role).values(userRoleData).returning();
  return result[0];
}

export async function removeRoleFromUser(userId: string, roleId: string) {
  return db
    .delete(user_role)
    .where(and(eq(user_role.userId, userId), eq(user_role.roleId, roleId)));
}

export async function getUserRoles(userId: string) {
  const result = await db
    .select({
      role: role,
    })
    .from(user_role)
    .innerJoin(role, eq(user_role.roleId, role.id))
    .where(eq(user_role.userId, userId));

  return result.map((r) => r.role);
}

export async function getUsersWithRole(roleId: string) {
  const result = await db
    .select({
      user: user,
    })
    .from(user_role)
    .innerJoin(user, eq(user_role.userId, user.id))
    .where(eq(user_role.roleId, roleId));

  return result.map((u) => u.user);
}

// RBAC system functions
export async function hasPermission(
  userId: string,
  permission: string,
): Promise<boolean> {
  const userRoles = await getUserRoles(userId);

  // Check if user has any role with the required permission
  for (const userRole of userRoles) {
    const permissions = userRole.permissions as Record<string, boolean>;
    if (permissions[permission]) {
      return true;
    }
  }

  return false;
}

export async function hasRole(
  userId: string,
  roleName: string,
): Promise<boolean> {
  const userRoles = await getUserRoles(userId);
  return userRoles.some((r) => r.name === roleName);
}

export async function hasAnyRole(
  userId: string,
  roleNames: string[],
): Promise<boolean> {
  const userRoles = await getUserRoles(userId);
  return userRoles.some((r) => roleNames.includes(r.name));
}

export async function addPermissionToRole(
  roleId: string,
  permission: string,
): Promise<void> {
  const roleData = await getRoleById(roleId);
  if (!roleData) return;

  const permissions = roleData.permissions as Record<string, boolean>;
  permissions[permission] = true;

  await updateRole(roleId, { permissions });
}

export async function removePermissionFromRole(
  roleId: string,
  permission: string,
): Promise<void> {
  const roleData = await getRoleById(roleId);
  if (!roleData) return;

  const permissions = roleData.permissions as Record<string, boolean>;
  delete permissions[permission];

  await updateRole(roleId, { permissions });
}

export async function getUserPermissions(userId: string): Promise<string[]> {
  const userRoles = await getUserRoles(userId);

  // Collect all permissions from all roles
  const permissionSet = new Set<string>();
  for (const userRole of userRoles) {
    const permissions = userRole.permissions as Record<string, boolean>;
    Object.keys(permissions).forEach((permission) => {
      if (permissions[permission]) {
        permissionSet.add(permission);
      }
    });
  }

  return Array.from(permissionSet);
}

// Role management helpers
export async function createDefaultRoles() {
  const defaultRoles = [
    {
      id: "admin",
      name: "Admin",
      description: "Administrator with full access",
      permissions: {
        "user:read": true,
        "user:create": true,
        "user:update": true,
        "user:delete": true,
        "role:read": true,
        "role:create": true,
        "role:update": true,
        "role:delete": true,
      },
    },
    {
      id: "user",
      name: "User",
      description: "Regular user with limited access",
      permissions: {
        "user:read": true,
        "profile:read": true,
        "profile:update": true,
      },
    },
    {
      id: "moderator",
      name: "Moderator",
      description: "Moderator with content management access",
      permissions: {
        "user:read": true,
        "profile:read": true,
        "content:read": true,
        "content:update": true,
        "content:moderate": true,
      },
    },
  ];

  for (const roleData of defaultRoles) {
    const existingRole = await getRoleById(roleData.id);
    if (!existingRole) {
      await createRole(roleData);
    }
  }
}

// Authentication middleware helper
export async function checkPermission(
  userId: string,
  permission: string,
): Promise<void> {
  const hasAccess = await hasPermission(userId, permission);
  if (!hasAccess) {
    throw new Error(`Access denied: Missing permission ${permission}`);
  }
}

export async function checkRole(
  userId: string,
  requiredRole: string,
): Promise<void> {
  const hasRequiredRole = await hasRole(userId, requiredRole);
  if (!hasRequiredRole) {
    throw new Error(`Access denied: Missing role ${requiredRole}`);
  }
}

export async function checkAnyRole(
  userId: string,
  requiredRoles: string[],
): Promise<void> {
  const hasAnyRequiredRole = await hasAnyRole(userId, requiredRoles);
  if (!hasAnyRequiredRole) {
    throw new Error(
      `Access denied: Must have one of these roles: ${requiredRoles.join(", ")}`,
    );
  }
}
