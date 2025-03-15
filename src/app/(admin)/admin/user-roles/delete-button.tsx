"use client";

import { useState } from "react";
import { Button } from "@/registry/new-york/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/new-york/ui/dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DeleteButtonProps {
  id: string;
  roleName: string;
  userName: string;
  isAdmin: boolean;
  currentUserIsAdmin: boolean;
  currentUserId: string;
  userId: string;
}

export default function DeleteButton({
  id,
  roleName,
  userName,
  isAdmin,
  currentUserIsAdmin,
  currentUserId,
  userId,
}: DeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Check permissions
  const isOwnRole = currentUserId === userId;
  const canDelete = currentUserIsAdmin || isOwnRole;
  const isDisabled = isAdmin && !isOwnRole; // Cannot delete other admin's roles

  const handleDelete = async () => {
    if (isDisabled) {
      toast.error("You cannot remove another admin's role");
      setOpen(false);
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`/api/admin/user-roles/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete role assignment");
      }

      toast.success("Role assignment successfully removed");
      router.refresh(); // Refresh the page data
      setOpen(false);
    } catch (error) {
      console.error("Error deleting role:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete role assignment",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          disabled={isDisabled}
          title={isDisabled ? "You cannot remove another admin's role" : ""}
        >
          Remove
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Role Removal</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove the "{roleName}" role from{" "}
            {userName}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Removing..." : "Remove Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
