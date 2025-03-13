"use client";

import Link from "next/link";
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
import React from "react";
import { useState, useEffect } from "react";
import { Checkbox } from "@/registry/new-york/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/registry/new-york/ui/alert-dialog";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export default function UsersAdminPage({
  searchParams,
}: {
  searchParams: { page?: string; limit?: string };
}) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [users, setUsers] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // @ts-expect-error
  const params = React.use<any>(searchParams);

  useEffect(() => {
    // Initialize page and limit from search params
    const pageParam = params.page ? parseInt(params.page) : 1;
    const limitParam = params.limit ? parseInt(params.limit) : 10;

    setPage(pageParam);
    setLimit(limitParam);

    fetchUsers(pageParam, limitParam);
  }, [searchParams]);

  const fetchUsers = async (page: number, limit: number) => {
    setIsLoading(true);
    try {
      const offset = (page - 1) * limit;
      const response = await fetch(
        `/api/admin/users?limit=${limit}&offset=${offset}`,
      );
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users || []);
        setTotalCount(data.total || 0);
      } else {
        console.error("Failed to fetch users:", data.error);
        toast.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error fetching users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("User deleted successfully");
        // Refresh the user list
        fetchUsers(page, limit);
      } else {
        const data = await response.json();
        toast.error(`Failed to delete user: ${data.error}`);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Error deleting user");
    }

    setUserToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleBatchDelete = async () => {
    if (selectedUsers.length === 0) {
      toast.error("No users selected");
      return;
    }

    try {
      const response = await fetch("/api/admin/users/batch", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userIds: selectedUsers }),
      });

      if (response.ok) {
        toast.success(`Successfully deleted ${selectedUsers.length} users`);
        setSelectedUsers([]);
        fetchUsers(page, limit);
      } else {
        const data = await response.json();
        toast.error(`Failed to delete users: ${data.error}`);
      }
    } catch (error) {
      console.error("Error batch deleting users:", error);
      toast.error("Error deleting users");
    }

    setBatchDeleteDialogOpen(false);
  };

  const handleSelectUser = (userId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    }
  };

  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked) {
      setSelectedUsers(users.map((user) => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const totalPages = Math.ceil(totalCount / limit);
  const offset = (page - 1) * limit;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts in the database.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedUsers.length > 0 && (
            <AlertDialog
              open={batchDeleteDialogOpen}
              onOpenChange={setBatchDeleteDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  Delete Selected ({selectedUsers.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Selected Users</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {selectedUsers.length}{" "}
                    users? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleBatchDelete}
                    className="bg-destructive text-destructive-foreground"
                  >
                    Delete Users
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Link href="/admin/users/create">
            <Button>Create User</Button>
          </Link>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  onCheckedChange={(checked) =>
                    handleSelectAll(checked === true)
                  }
                  checked={
                    selectedUsers.length === users.length && users.length > 0
                  }
                />
              </TableHead>
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
                <TableCell>
                  <Checkbox
                    onCheckedChange={(checked) =>
                      handleSelectUser(user.id, checked === true)
                    }
                    checked={selectedUsers.includes(user.id)}
                  />
                </TableCell>
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
                    <AlertDialog
                      open={deleteDialogOpen && userToDelete === user.id}
                      onOpenChange={(open) => {
                        setDeleteDialogOpen(open);
                        if (!open) setUserToDelete(null);
                      }}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive"
                          onClick={() => {
                            setUserToDelete(user.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete User</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this user? This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteUser(user.id)}
                            className="bg-destructive text-destructive-foreground"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
