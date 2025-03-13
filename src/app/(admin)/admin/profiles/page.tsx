import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db/drizzle";
import { profile, user } from "@/db/schema";
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
  title: "Profiles | Admin Dashboard",
  description: "Manage user profiles",
};

export default async function ProfilesAdminPage({
  searchParams,
}: {
  searchParams: { page?: string; limit?: string };
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const offset = (page - 1) * limit;

  // Join with user to get the related user data
  const profiles = await db
    .select({
      profile: profile,
      userName: user.name,
      userEmail: user.email,
    })
    .from(profile)
    .leftJoin(user, eq(profile.userId, user.id))
    .limit(limit)
    .offset(offset);

  const totalCountResult = await db.select({ value: count() }).from(profile);
  const totalCount = totalCountResult[0]?.value ?? 0;

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profiles</h1>
          <p className="text-muted-foreground">
            Manage user profiles in the database.
          </p>
        </div>
        <Link href="/admin/profiles/create">
          <Button>Create Profile</Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Bio</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((item) => (
              <TableRow key={item.profile.id}>
                <TableCell className="font-mono text-xs">
                  {item.profile.id.substring(0, 8)}...
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
                  {item.profile.bio ? (
                    <span className="line-clamp-2 max-w-[200px] text-xs">
                      {item.profile.bio}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      No bio
                    </span>
                  )}
                </TableCell>
                <TableCell>{item.profile.location || "—"}</TableCell>
                <TableCell>{item.profile.company || "—"}</TableCell>
                <TableCell>
                  {item.profile.createdAt
                    ? formatDistanceToNow(new Date(item.profile.createdAt), {
                        addSuffix: true,
                      })
                    : "N/A"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/profiles/${item.profile.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    <Link href={`/admin/profiles/${item.profile.id}/edit`}>
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
          {Math.min(offset + limit, totalCount)} of {totalCount} profiles
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            asChild={page > 1}
          >
            {page > 1 ? (
              <Link href={`/admin/profiles?page=${page - 1}&limit=${limit}`}>
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
              <Link href={`/admin/profiles?page=${page + 1}&limit=${limit}`}>
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
