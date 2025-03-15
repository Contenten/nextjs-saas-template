"use client";

import { useState } from "react";
import { Button } from "@/registry/new-york/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/registry/new-york/ui/alert-dialog";

interface DeleteRoleButtonProps {
  roleId: string;
  roleName: string;
  deleteAction: (formData: FormData) => Promise<void>;
}

export function DeleteRoleButton({
  roleId,
  roleName,
  deleteAction,
}: DeleteRoleButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        type="button"
        className="text-red-500 hover:bg-red-50 hover:text-red-600"
        onClick={() => setIsOpen(true)}
      >
        Delete
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the role &quot;{roleName}
              &quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <form action={deleteAction}>
              <input type="hidden" name="roleId" value={roleId} />
              <AlertDialogAction type="submit">Delete</AlertDialogAction>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
