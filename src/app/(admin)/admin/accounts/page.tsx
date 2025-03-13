import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db/drizzle";
import { account, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/new-york/ui/table";
import { Badge } from "@/registry/new-york/ui/badge";
import { count } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Accounts | Admin Dashboard",
  description: "Manage user authentication accounts",
};

export default async function AccountsAdminPage({
  searchParams,
}: {
  searchParams: { page?: string; limit?: string };
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const offset = (page - 1) * limit;

  // Join accounts with users to get user details
  const accounts = await db
    .select({
      account: account,
      userName: user.name,
      userEmail: user.email,
    })
    .from(account)
    .leftJoin(user, eq(account.userId, user.id))
    .limit(limit)
    .offset(offset)
    .orderBy(account.updatedAt);

  const totalCountResult = await db.select({ value: count() }).from(account);
  const totalCount = totalCountResult[0]?.value ?? 0;

  const totalPages = Math.ceil(totalCount / limit);

  // Helper function to determine the badge color based on provider
  const getProviderBadge = (providerId: string) => {
    const providers: Record<string, { color: string; label: string }> = {
      google: {
        color: "bg-red-100 text-red-800 border-red-200",
        label: "Google",
      },
      github: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        label: "GitHub",
      },
      facebook: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        label: "Facebook",
      },
      twitter: {
        color: "bg-sky-100 text-sky-800 border-sky-200",
        label: "Twitter",
      },
      email: {
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Email",
      },
      credentials: {
        color: "bg-purple-100 text-purple-800 border-purple-200",
        label: "Password",
      },
    };

    return (
      providers[providerId] || {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        label: providerId,
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Auth Accounts</h1>
        <p className="text-muted-foreground">
          View user authentication accounts in the database.
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Account ID</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map(({ account, userName, userEmail }) => {
              const provider = getProviderBadge(account.providerId);

              return (
                <TableRow key={account.id}>
                  <TableCell className="font-mono text-xs">
                    {account.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{userName || "Unknown"}</div>
                      <div className="text-xs text-muted-foreground">
                        {userEmail}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${provider.color} border`}
                      variant="outline"
                    >
                      {provider.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {account.accountId}
                  </TableCell>
                  <TableCell>
                    {account.createdAt
                      ? format(new Date(account.createdAt), "MMM d, yyyy")
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/users/${account.userId}`}
                      className="text-sm text-blue-500 hover:underline"
                    >
                      View User
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {Math.min(offset + 1, totalCount)}-
          {Math.min(offset + limit, totalCount)} of {totalCount} accounts
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/accounts?page=${Math.max(1, page - 1)}&limit=${limit}`}
            className={`rounded-md border px-3 py-2 text-sm ${
              page <= 1 ? "pointer-events-none opacity-50" : ""
            }`}
          >
            Previous
          </Link>
          <Link
            href={`/admin/accounts?page=${page + 1}&limit=${limit}`}
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
