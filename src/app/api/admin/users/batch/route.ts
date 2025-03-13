import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { user } from "@/db/schema";
import { inArray } from "drizzle-orm";

export async function DELETE(req: NextRequest) {
  try {
    // Get user IDs from request body
    const body = await req.json();
    const { userIds } = body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "Valid user IDs array is required" },
        { status: 400 },
      );
    }

    // Delete users
    await db.delete(user).where(inArray(user.id, userIds));

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${userIds.length} users`,
    });
  } catch (error) {
    console.error("Error batch deleting users:", error);
    return NextResponse.json(
      { error: "Failed to delete users" },
      { status: 500 },
    );
  }
}
