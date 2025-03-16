import { Separator } from "@/registry/new-york/ui/separator";
import { SocialProvidersForm } from "./social-providers-form";

export default function SocialProvidersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Social Providers</h3>
        <p className="text-sm text-muted-foreground">
          Connect and manage your social accounts.
        </p>
      </div>
      <Separator />
      <SocialProvidersForm />
    </div>
  );
}
