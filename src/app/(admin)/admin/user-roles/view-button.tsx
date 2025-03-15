"use client";

import { Button } from "@/registry/new-york/ui/button";
import Link from "next/link";

interface ViewButtonProps {
  id: string;
}

export default function ViewButton({ id }: ViewButtonProps) {
  return (
    <Link href={`/admin/user-roles/${id}`}>
      <Button variant="outline" size="sm">
        View
      </Button>
    </Link>
  );
}
