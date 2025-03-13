import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/registry/new-york/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/registry/new-york/ui/card";
import { getUserById, getAccountByUserId } from "@/db/queries";
import { format } from "date-fns";

export const metadata: Metadata = {
  title: "User Details | Admin Dashboard",
  description: "View user details",
};

export default async function UserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const user = await getUserById(id);

  if (!user) {
    notFound();
  }

  const accounts = await getAccountByUserId(user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
          <p className="text-muted-foreground">
            View details for user {user.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/users/${user.id}/edit`}>
            <Button>Edit User</Button>
          </Link>
          <Link href="/admin/users">
            <Button variant="outline">Back to Users</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-1">
              <div className="text-sm font-medium text-muted-foreground">
                ID
              </div>
              <div className="font-mono text-xs">{user.id}</div>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div className="text-sm font-medium text-muted-foreground">
                Name
              </div>
              <div>{user.name}</div>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div className="text-sm font-medium text-muted-foreground">
                Email
              </div>
              <div>{user.email}</div>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div className="text-sm font-medium text-muted-foreground">
                Email Verified
              </div>
              <div>
                {user.emailVerified ? (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                    Not Verified
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div className="text-sm font-medium text-muted-foreground">
                Image
              </div>
              <div>{user.image || "No image"}</div>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div className="text-sm font-medium text-muted-foreground">
                Created At
              </div>
              <div>
                {user.createdAt
                  ? format(new Date(user.createdAt), "PPP p")
                  : "N/A"}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div className="text-sm font-medium text-muted-foreground">
                Updated At
              </div>
              <div>
                {user.updatedAt
                  ? format(new Date(user.updatedAt), "PPP p")
                  : "N/A"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Linked Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            {accounts.length > 0 ? (
              <div className="space-y-4">
                {accounts.map((account) => (
                  <div key={account.id} className="rounded-md border p-4">
                    <div className="grid grid-cols-2 gap-1">
                      <div className="text-sm font-medium text-muted-foreground">
                        Provider
                      </div>
                      <div>{account.providerId}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div className="text-sm font-medium text-muted-foreground">
                        Account ID
                      </div>
                      <div className="font-mono text-xs">
                        {account.accountId}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div className="text-sm font-medium text-muted-foreground">
                        Created
                      </div>
                      <div>
                        {account.createdAt
                          ? format(new Date(account.createdAt), "PPP")
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No linked accounts found
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
