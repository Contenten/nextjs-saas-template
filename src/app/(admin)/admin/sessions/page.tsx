import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db/drizzle";
import { session, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatDistanceToNow } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/new-york/ui/table";
import { count } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Sessions | Admin Dashboard",
  description: "Manage user sessions",
};

export default async function SessionsAdminPage({
  searchParams,
}: {
  searchParams: { page?: string; limit?: string };
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const offset = (page - 1) * limit;

  // Join sessions with users to get user details
  const sessions = await db
    .select({
      session: session,
      userName: user.name,
      userEmail: user.email,
    })
    .from(session)
    .leftJoin(user, eq(session.userId, user.id))
    .limit(limit)
    .offset(offset)
    .orderBy(session.updatedAt);

  const totalCountResult = await db.select({ value: count() }).from(session);
  const totalCount = totalCountResult[0]?.value ?? 0;

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sessions</h1>
        <p className="text-muted-foreground">
          View active user sessions in the database.
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>User Agent</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Expires</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map(({ session, userName, userEmail }) => (
              <TableRow key={session.id}>
                <TableCell className="font-mono text-xs">
                  {session.id.substring(0, 8)}...
                </TableCell>
                <TableCell>
                  <div>
                    <div>{userName || "Unknown"}</div>
                    <div className="text-xs text-muted-foreground">
                      {userEmail}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{session.ipAddress || "N/A"}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {session.userAgent || "N/A"}
                </TableCell>
                <TableCell>
                  {session.createdAt
                    ? formatDistanceToNow(new Date(session.createdAt), {
                        addSuffix: true,
                      })
                    : "N/A"}
                </TableCell>
                <TableCell>
                  {session.expiresAt
                    ? formatDistanceToNow(new Date(session.expiresAt), {
                        addSuffix: true,
                      })
                    : "N/A"}
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
          {Math.min(offset + limit, totalCount)} of {totalCount} sessions
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/sessions?page=${Math.max(1, page - 1)}&limit=${limit}`}
            className={`rounded-md border px-3 py-2 text-sm ${
              page <= 1 ? "pointer-events-none opacity-50" : ""
            }`}
          >
            Previous
          </Link>
          <Link
            href={`/admin/sessions?page=${page + 1}&limit=${limit}`}
            className={`rounded-md border px-3 py-2 text-sm ${
              page >= totalPages ? "pointer-events-none opacity-50" : ""
            }`}
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}
