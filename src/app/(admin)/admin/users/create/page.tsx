import { Metadata } from "next";
import CreateUserForm from "./create-user-form";

export const metadata: Metadata = {
  title: "Create User | Admin Dashboard",
  description: "Create a new user",
};

export default function CreateUserPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create User</h1>
        <p className="text-muted-foreground">Create a new user account</p>
      </div>

      <div className="mx-auto max-w-2xl">
        <CreateUserForm />
      </div>
    </div>
  );
}
