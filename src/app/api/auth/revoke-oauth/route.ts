import { NextRequest, NextResponse } from "next/server";
import { revokeOAuthAccess } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { userId, provider } = await request.json();

    if (!userId || !provider) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Call revokeOAuthAccess from auth.ts
    const result = await revokeOAuthAccess(userId, provider);

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to revoke access" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error revoking OAuth access:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
