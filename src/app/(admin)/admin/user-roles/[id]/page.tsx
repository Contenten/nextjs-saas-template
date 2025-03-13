import { notFound } from "next/navigation";
import { db } from "@/db/drizzle";
import { user_role, user, role } from "@/db/schema";
import { eq } from "drizzle-orm/expressions";
import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/new-york/ui/card";
import { Button } from "@/registry/new-york/ui/button";
import Link from "next/link";
import { format } from "date-fns";

export const metadata: Metadata = {
  title: "View User Role | Admin Dashboard",
  description: "View user role assignment details",
};

export default async function UserRolePage({
  params,
}: {
  params: { id: string };
}) {
  const userRoleId = params.id;

  // Fetch user-role with related information
  const userRoleData = await db
    .select({
      userRole: user_role,
      userName: user.name,
      userEmail: user.email,
      roleName: role.name,
      roleDescription: role.description,
    })
    .from(user_role)
    .leftJoin(user, eq(user_role.userId, user.id))
    .leftJoin(role, eq(user_role.roleId, role.id))
    .where(eq(user_role.id, userRoleId));

  if (!userRoleData.length) {
    notFound();
  }

  const item = userRoleData[0];

  if (!item || !item.userRole) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            User Role Details
          </h1>
          <p className="text-muted-foreground">
            View details for user role assignment.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/user-roles">
            <Button variant="outline">Back to User Roles</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Role Assignment
          </CardTitle>
          <CardDescription>ID: {item.userRole.id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">User</h3>
              <div className="mt-1">
                <p className="font-medium">{item.userName || "Unknown User"}</p>
                <p className="text-sm text-muted-foreground">
                  {item.userEmail}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ID: {item.userRole.userId}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-medium">Role</h3>
              <div className="mt-1">
                <p className="font-medium">{item.roleName || "Unknown Role"}</p>
                <p className="text-sm text-muted-foreground">
                  {item.roleDescription || "No description"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ID: {item.userRole.roleId}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <div className="text-xs text-muted-foreground">
            <p>
              Created:{" "}
              {item.userRole.createdAt
                ? format(item.userRole.createdAt, "PPP")
                : "Unknown"}
            </p>
          </div>
          <div className="ml-auto">
            <Button variant="destructive" size="sm" asChild>
              <Link href={`/api/admin/user-roles/${item.userRole.id}/delete`}>
                Remove Role Assignment
              </Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
