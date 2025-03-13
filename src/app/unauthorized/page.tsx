import Link from "next/link";
import { Button } from "@/registry/new-york/ui/button";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <div className="max-w-md mx-auto">
        <div className="flex justify-center mb-6">
          <ShieldAlert className="h-24 w-24 text-red-500" />
        </div>

        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Access Denied
        </h1>

        <p className="text-lg text-muted-foreground mb-8">
          You don't have the necessary permissions to access this page. Please
          contact your administrator if you believe this is an error.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="default">
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>

          <Button asChild variant="outline">
            <Link href="/">Go to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
