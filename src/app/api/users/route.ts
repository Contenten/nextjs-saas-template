import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/middleware/auth";
import {
  getUserById,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  hasRole,
} from "@/db/queries";

export async function GET(req: NextRequest) {
  try {
    // Parse query parameters
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const userId = url.searchParams.get("id");

    // Basic authentication check
    const authResult = await authenticate(req);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    if (!authResult.auth || !authResult.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // If user is requesting a specific user
    if (userId) {
      // If user is requesting their own data, always allow
      if (userId === authResult.user.id) {
        const user = await getUserById(userId);
        if (!user) {
          return NextResponse.json(
            { error: "User not found" },
            { status: 404 },
          );
        }
        return NextResponse.json({ user });
      }

      // Otherwise, check if user has Admin role
      const isAdmin = await hasRole(authResult.user.id, "Admin");
      if (!isAdmin) {
        return NextResponse.json(
          { error: "You can only view your own user information" },
          { status: 403 },
        );
      }

      // Admin can view any user
      const user = await getUserById(userId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      return NextResponse.json({ user });
    }

    // If listing all users, require Admin role
    const isAdmin = await hasRole(authResult.user.id, "Admin");
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access required to list all users" },
        { status: 403 },
      );
    }

    const users = await listUsers(limit, offset);
    return NextResponse.json({ users, total: users.length });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  // Check authentication and permissions
  const authResult = await authenticate(req, {
    permissions: ["user:create"],
  });

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  if (!authResult.auth) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const data = await req.json();

    // Validate required fields
    if (!data.name || !data.email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(data.email);
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 },
      );
    }

    // Create the user
    const newUser = await createUser({
      ...data,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Check authentication
    const authResult = await authenticate(req);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    if (!authResult.auth || !authResult.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Allow users to update their own profile
    if (userId === authResult.user.id) {
      const data = await req.json();
      const updatedUser = await updateUser(userId, {
        ...data,
        updatedAt: new Date(),
      });

      if (!updatedUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({ user: updatedUser });
    }

    // For updating other users, require Admin role
    const isAdmin = await hasRole(authResult.user.id, "Admin");
    if (!isAdmin) {
      return NextResponse.json(
        { error: "You can only update your own user information" },
        { status: 403 },
      );
    }

    const data = await req.json();
    const updatedUser = await updateUser(userId, {
      ...data,
      updatedAt: new Date(),
    });

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Check authentication
    const authResult = await authenticate(req);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    if (!authResult.auth || !authResult.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Don't allow users to delete themselves
    if (userId === authResult.user.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account through this API" },
        { status: 403 },
      );
    }

    // For deleting other users, require Admin role
    const isAdmin = await hasRole(authResult.user.id, "Admin");
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only administrators can delete user accounts" },
        { status: 403 },
      );
    }

    await deleteUser(userId);

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
}
