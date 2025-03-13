import { notFound } from "next/navigation";
import { db } from "@/db/drizzle";
import { role } from "@/db/schema";
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
import { Badge } from "@/registry/new-york/ui/badge";

export const metadata: Metadata = {
  title: "View Role | Admin Dashboard",
  description: "View role details",
};

export default async function RolePage({
  params,
}: {
  params: { id: string };
}) {
  const roleId = params.id;

  // Fetch role information
  const roleData = await db.select().from(role).where(eq(role.id, roleId));

  if (!roleData.length) {
    notFound();
  }

  const roleInfo = roleData[0];

  if (!roleInfo) {
    notFound();
  }

  // Helper to safely show permissions
  const permissionsObject =
    roleInfo.permissions && typeof roleInfo.permissions === "object"
      ? (roleInfo.permissions as Record<string, boolean>)
      : {};

  const hasEnabledPermissions = Object.values(permissionsObject).some(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Details</h1>
          <p className="text-muted-foreground">View details for role.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/roles/${roleId}/edit`}>
            <Button>Edit Role</Button>
          </Link>
          <Link href="/admin/roles">
            <Button variant="outline">Back to Roles</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {roleInfo.name}
          </CardTitle>
          <CardDescription>{roleInfo.id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">Description</h3>
            <p className="text-sm text-muted-foreground">
              {roleInfo.description || "No description provided"}
            </p>
          </div>

          <div>
            <h3 className="font-medium">Permissions</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.keys(permissionsObject).length > 0 ? (
                hasEnabledPermissions ? (
                  Object.entries(permissionsObject).map(
                    ([permission, enabled]) => {
                      if (enabled) {
                        return (
                          <Badge key={permission} variant="outline">
                            {permission}
                          </Badge>
                        );
                      }
                      return null;
                    },
                  )
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No permissions enabled
                  </p>
                )
              ) : (
                <p className="text-sm text-muted-foreground">
                  No permissions defined
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <div className="text-xs text-muted-foreground">
            <p>
              Created:{" "}
              {roleInfo.createdAt
                ? format(roleInfo.createdAt, "PPP")
                : "Unknown"}
            </p>
            <p>
              Last Updated:{" "}
              {roleInfo.updatedAt
                ? format(roleInfo.updatedAt, "PPP")
                : "Unknown"}
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
