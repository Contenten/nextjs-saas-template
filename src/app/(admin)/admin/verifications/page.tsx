import { Metadata } from "next";
import { db } from "@/db/drizzle";
import { verification } from "@/db/schema";
import { format, formatDistanceToNow } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/new-york/ui/table";
import { count } from "drizzle-orm";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Verifications | Admin Dashboard",
  description: "Manage email verification records",
};

export default async function VerificationsAdminPage({
  searchParams,
}: {
  searchParams: { page?: string; limit?: string };
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const offset = (page - 1) * limit;

  const verifications = await db
    .select()
    .from(verification)
    .limit(limit)
    .offset(offset)
    .orderBy(verification.createdAt);

  const totalCountResult = await db
    .select({ value: count() })
    .from(verification);
  const totalCount = totalCountResult[0]?.value ?? 0;

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Verifications</h1>
        <p className="text-muted-foreground">
          View email verification records in the database.
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Identifier (Email)</TableHead>
              <TableHead>Token Value</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {verifications.map((verification) => {
              const isExpired =
                verification.expiresAt &&
                new Date(verification.expiresAt) < new Date();

              return (
                <TableRow key={verification.id}>
                  <TableCell className="font-mono text-xs">
                    {verification.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>{verification.identifier}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {verification.value.substring(0, 8)}...
                  </TableCell>
                  <TableCell>
                    {verification.createdAt
                      ? format(
                          new Date(verification.createdAt),
                          "MMM d, yyyy HH:mm",
                        )
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {verification.expiresAt
                      ? formatDistanceToNow(new Date(verification.expiresAt), {
                          addSuffix: true,
                        })
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {isExpired ? (
                      <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                        Expired
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        Active
                      </span>
                    )}
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
          {Math.min(offset + limit, totalCount)} of {totalCount} verifications
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/verifications?page=${Math.max(1, page - 1)}&limit=${limit}`}
            className={`rounded-md border px-3 py-2 text-sm ${
              page <= 1 ? "pointer-events-none opacity-50" : ""
            }`}
          >
            Previous
          </Link>
          <Link
            href={`/admin/verifications?page=${page + 1}&limit=${limit}`}
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
