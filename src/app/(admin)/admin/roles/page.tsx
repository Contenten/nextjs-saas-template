import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db/drizzle";
import { role } from "@/db/schema";
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
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm/expressions";
import { DeleteRoleButton } from "./components/delete-role-button";

export const metadata: Metadata = {
  title: "Roles | Admin Dashboard",
  description: "Manage system roles",
};

// Define default/core roles that cannot be deleted or edited
const CORE_ROLES = ["admin", "user", "moderator"];

// Server action to delete a role
async function deleteRole(formData: FormData) {
  "use server";

  const roleId = formData.get("roleId") as string;

  try {
    // Check if role is a core role
    if (CORE_ROLES.includes(roleId)) {
      console.error("Cannot delete a core system role");
      return; // Return void to match the expected type
    }

    // Check if role exists
    const existingRole = await db
      .select()
      .from(role)
      .where(eq(role.id, roleId));

    if (!existingRole.length) {
      console.error("Role not found");
      return;
    }

    // Delete the role
    await db.delete(role).where(eq(role.id, roleId));

    // Revalidate the current path to refresh the data
    revalidatePath("/admin/roles");
  } catch (error) {
    console.error("Error deleting role:", error);
  }
}

export default async function RolesAdminPage({
  searchParams,
}: {
  searchParams: { page?: string; limit?: string };
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const offset = (page - 1) * limit;

  const roles = await db.select().from(role).limit(limit).offset(offset);
  const totalCountResult = await db.select({ value: count() }).from(role);
  const totalCount = totalCountResult[0]?.value ?? 0;

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles</h1>
          <p className="text-muted-foreground">
            Manage system roles and permissions.
          </p>
        </div>
        <Link href="/admin/roles/create">
          <Button>Create Role</Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => {
              const isCoreRole = CORE_ROLES.includes(role.id);

              return (
                <TableRow key={role.id}>
                  <TableCell className="font-mono text-xs">{role.id}</TableCell>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>
                    {role.description ? (
                      <span className="line-clamp-2 max-w-[200px] text-sm">
                        {role.description}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        No description
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {Object.keys(role.permissions as Record<string, boolean>)
                      .length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {Object.entries(
                          role.permissions as Record<string, boolean>,
                        )
                          .filter(([_, value]) => value)
                          .slice(0, 3)
                          .map(([key]) => (
                            <span
                              key={key}
                              className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20"
                            >
                              {key}
                            </span>
                          ))}
                        {Object.keys(
                          role.permissions as Record<string, boolean>,
                        ).length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +
                            {Object.keys(
                              role.permissions as Record<string, boolean>,
                            ).length - 3}{" "}
                            more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        None
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {role.createdAt
                      ? formatDistanceToNow(new Date(role.createdAt), {
                          addSuffix: true,
                        })
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/roles/${role.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>

                      {!isCoreRole && (
                        <>
                          <Link href={`/admin/roles/${role.id}/edit`}>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </Link>

                          <DeleteRoleButton
                            roleId={role.id}
                            roleName={role.name}
                            deleteAction={deleteRole}
                          />
                        </>
                      )}

                      {isCoreRole && (
                        <span className="text-xs text-muted-foreground ml-2">
                          (Core role - cannot be modified)
                        </span>
                      )}
                    </div>
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
          {Math.min(offset + limit, totalCount)} of {totalCount} roles
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            asChild={page > 1}
          >
            {page > 1 ? (
              <Link href={`/admin/roles?page=${page - 1}&limit=${limit}`}>
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
              <Link href={`/admin/roles?page=${page + 1}&limit=${limit}`}>
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
