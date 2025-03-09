import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/db/queries";
import { db } from "@/db/drizzle";
import { account } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { randomBytes, pbkdf2Sync } from "crypto";

// Helper function to hash a password
function hashPassword(
  password: string,
  salt?: string,
): { hash: string; salt: string } {
  const newSalt = salt || randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, newSalt, 1000, 64, "sha512").toString(
    "hex",
  );
  return { hash, salt: newSalt };
}

// Helper function to verify a password
function verifyPassword(password: string, hash: string, salt: string): boolean {
  const { hash: newHash } = hashPassword(password, salt);
  return newHash === hash;
}

// POST /api/users/:id/password - Change password
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { id } = await params;

  try {
    const user = await getUserById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data = await request.json();
    const { currentPassword, newPassword } = data;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        {
          error: "Current password and new password are required",
        },
        { status: 400 },
      );
    }

    // Get the user's account to verify the current password
    const userAccounts = await db
      .select()
      .from(account)
      .where(eq(account.userId, id));

    const passwordAccount = userAccounts.find((acc) => acc.password);

    if (!passwordAccount || !passwordAccount.password) {
      return NextResponse.json(
        {
          error: "No password account found for this user",
        },
        { status: 400 },
      );
    }

    // TODO: Add password hashing
    // Extract password and salt from stored password (format: hash:salt)
    const [storedHash, storedSalt] = passwordAccount.password.split(":");

    if (!storedHash || !storedSalt) {
      return NextResponse.json(
        {
          error: "Invalid password format in database",
        },
        { status: 500 },
      );
    }

    // Verify current password
    if (!verifyPassword(currentPassword, storedHash, storedSalt)) {
      return NextResponse.json(
        {
          error: "Current password is incorrect",
        },
        { status: 400 },
      );
    }

    // Hash the new password
    const { hash: newHash, salt: newSalt } = hashPassword(newPassword);
    const hashedPassword = `${newHash}:${newSalt}`;

    // Update the password in the database
    await db
      .update(account)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(account.id, passwordAccount.id));

    return NextResponse.json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 },
    );
  }
}
