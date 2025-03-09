import { NextRequest, NextResponse } from "next/server";
import { getUserById, updateUser } from "@/db/queries";

// POST /api/users/:id/email - Request email change
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
    const { email } = data;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Update the user's email and set emailVerified to false
    const updatedUser = await updateUser(id, {
      email,
      emailVerified: false,
      updatedAt: new Date(),
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Failed to update email" },
        { status: 500 },
      );
    }

    // TODO: In a real implementation, you would send a verification email here
    // For now, we'll just return success

    return NextResponse.json({
      success: true,
      message: "Email updated. Please verify your new email address.",
    });
  } catch (error) {
    console.error("Error changing email:", error);
    return NextResponse.json(
      { error: "Failed to change email" },
      { status: 500 },
    );
  }
}
