import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db/drizzle";
import { user_role, user, role } from "@/db/schema";
import { Button } from "@/registry/new-york/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/new-york/ui/table";
import { formatDistanceToNow } from "date-fns";
import { count } from "drizzle-orm";
import { eq } from "drizzle-orm/expressions";

export const metadata: Metadata = {
  title: "User Roles | Admin Dashboard",
  description: "Manage user role assignments",
};

export default async function UserRolesAdminPage({
  searchParams,
}: {
  searchParams: { page?: string; limit?: string };
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const offset = (page - 1) * limit;

  // Join with user and role tables to get related data
  const userRoles = await db
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
    .limit(limit)
    .offset(offset);

  const totalCountResult = await db.select({ value: count() }).from(user_role);
  const totalCount = totalCountResult[0]?.value ?? 0;

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Roles</h1>
          <p className="text-muted-foreground">
            Manage role assignments for users.
          </p>
        </div>
        <Link href="/admin/user-roles/create">
          <Button>Assign Role</Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userRoles.map((item) => (
              <TableRow key={item.userRole.id}>
                <TableCell className="font-mono text-xs">
                  {item.userRole.id.substring(0, 8)}...
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{item.userName}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.userEmail}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{item.roleName}</div>
                    {item.roleDescription && (
                      <div className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                        {item.roleDescription}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {item.userRole.createdAt
                    ? formatDistanceToNow(new Date(item.userRole.createdAt), {
                        addSuffix: true,
                      })
                    : "N/A"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/user-roles/${item.userRole.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    <Link
                      href={`/api/admin/user-roles/${item.userRole.id}/delete`}
                    >
                      <Button variant="destructive" size="sm">
                        Remove
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {Math.min(offset + 1, totalCount)}-
          {Math.min(offset + limit, totalCount)} of {totalCount} user role
          assignments
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            asChild={page > 1}
          >
            {page > 1 ? (
              <Link href={`/admin/user-roles?page=${page - 1}&limit=${limit}`}>
                Previous
              </Link>
            ) : (
              "Previous"
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            asChild={page < totalPages}
          >
            {page < totalPages ? (
              <Link href={`/admin/user-roles?page=${page + 1}&limit=${limit}`}>
                Next
              </Link>
            ) : (
              "Next"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
