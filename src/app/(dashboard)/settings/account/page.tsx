import { Separator } from "@/registry/new-york/ui/separator";
import { AccountForm } from "./account-form";

export default function SettingsAccountPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Account</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account settings, preferences, and security options. You
          can change your password, update your email, and configure your
          account preferences here.
        </p>
      </div>
      <Separator />
      <AccountForm />
    </div>
  );
}
