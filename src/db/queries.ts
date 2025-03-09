import { db } from "./drizzle";
import { user, session, account } from "./schema";
import type { NewUser, NewSession, NewAccount } from "./schema";
import { and, eq } from "drizzle-orm";

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
