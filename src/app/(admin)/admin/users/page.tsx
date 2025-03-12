import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db/drizzle";
import { user } from "@/db/schema";
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

export const metadata: Metadata = {
  title: "Users | Admin Dashboard",
  description: "Manage user accounts",
};

export default async function UsersAdminPage({
  searchParams,
}: {
  searchParams: { page?: string; limit?: string };
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const offset = (page - 1) * limit;

  const users = await db.select().from(user).limit(limit).offset(offset);
  const totalCountResult = await db.select({ value: count() }).from(user);
  const totalCount = totalCountResult[0]?.value ?? 0;

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts in the database.
          </p>
        </div>
        <Link href="/admin/users/create">
          <Button>Create User</Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Email Verified</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-mono text-xs">
                  {user.id.substring(0, 8)}...
                </TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.emailVerified ? (
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                      Not Verified
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {user.createdAt
                    ? formatDistanceToNow(new Date(user.createdAt), {
                        addSuffix: true,
                      })
                    : "N/A"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/users/${user.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    <Link href={`/admin/users/${user.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
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
          {Math.min(offset + limit, totalCount)} of {totalCount} users
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            asChild={page > 1}
          >
            {page > 1 ? (
              <Link href={`/admin/users?page=${page - 1}&limit=${limit}`}>
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
              <Link href={`/admin/users?page=${page + 1}&limit=${limit}`}>
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
