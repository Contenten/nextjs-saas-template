import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getUserById } from "@/db/queries";
import EditUserForm from "./edit-user-form";

export const metadata: Metadata = {
  title: "Edit User | Admin Dashboard",
  description: "Edit user information",
};

export default async function EditUserPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const user = await getUserById(id);

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
        <p className="text-muted-foreground">
          Update information for user {user.name}
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        <EditUserForm user={user} />
      </div>
    </div>
  );
}
