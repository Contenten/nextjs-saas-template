"use client";

import { Button } from "@/registry/new-york/ui/button";
import Link from "next/link";
import { toast } from "sonner";

interface EditButtonProps {
  id: string;
  roleName: string;
  isAdmin: boolean;
  currentUserIsAdmin: boolean;
  currentUserId: string;
  userId: string;
}

export default function EditButton({
  id,
  roleName,
  isAdmin,
  currentUserIsAdmin,
  currentUserId,
  userId,
}: EditButtonProps) {
  // Check permissions
  const isOwnRole = currentUserId === userId;
  const canEdit = currentUserIsAdmin || isOwnRole;
  const isDisabled = isAdmin && !isOwnRole; // Cannot edit other admin's roles

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isDisabled) {
      e.preventDefault();
      toast.error("You cannot edit another admin's role");
    }
  };

  return (
    <Link href={`/admin/user-roles/${id}/edit`} onClick={handleClick}>
      <Button
        variant="secondary"
        size="sm"
        disabled={isDisabled}
        title={isDisabled ? "You cannot edit another admin's role" : ""}
      >
        Edit
      </Button>
    </Link>
  );
}
