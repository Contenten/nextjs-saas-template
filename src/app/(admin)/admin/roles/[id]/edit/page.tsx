import { notFound } from "next/navigation";
import { db } from "@/db/drizzle";
import { role } from "@/db/schema";
import { eq } from "drizzle-orm/expressions";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/registry/new-york/ui/button";
import RoleEditForm from "./role-edit-form";

export const metadata: Metadata = {
  title: "Edit Role | Admin Dashboard",
  description: "Edit role details",
};

export default async function RoleEditPage({
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Role</h1>
          <p className="text-muted-foreground">
            Update details for {roleInfo.name} role.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/roles/${roleId}`}>
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>
      </div>

      <RoleEditForm role={roleInfo} />
    </div>
  );
}
