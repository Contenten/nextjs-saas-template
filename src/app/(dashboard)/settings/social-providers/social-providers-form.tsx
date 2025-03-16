"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/registry/new-york/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/new-york/ui/card";
import { toast } from "@/registry/new-york/hooks/use-toast";

// Provider info
interface Provider {
  id: string;
  name: string;
}

const providers = [
  { id: "github", name: "GitHub" },
  { id: "google", name: "Google" },
  { id: "discord", name: "Discord" },
  { id: "microsoft", name: "Microsoft" },
  { id: "twitch", name: "Twitch" },
  { id: "twitter", name: "Twitter" },
];

interface ConnectedProvider {
  providerId: string;
  connectedAt: Date;
}

export function SocialProvidersForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [connectedProviders, setConnectedProviders] = useState<
    ConnectedProvider[]
  >([]);
  const user = { id: "" }; // Mock user for now

  useEffect(() => {
    // Fetch connected providers for the current user
    const fetchConnectedProviders = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/auth/accounts?userId=${user.id}`);

        if (response.ok) {
          const data = await response.json();
          setConnectedProviders(data);
        }
      } catch (error) {
        console.error("Failed to fetch connected providers", error);
      }
    };

    fetchConnectedProviders();
  }, [user?.id]);

  // Function to check if a provider is connected
  const isProviderConnected = (providerId: string) => {
    return connectedProviders.some((p) => p.providerId === providerId);
  };

  // Function to connect a provider
  const connectProvider = async (providerId: string) => {
    try {
      setIsLoading(true);

      // Construct the OAuth URL for the provider
      const baseURL = window.location.origin;
      const returnURL = encodeURIComponent(
        `${baseURL}/settings/social-providers`,
      );

      // Redirect to the auth endpoint
      window.location.href = `${baseURL}/api/auth/authorize/${providerId}?returnTo=${returnURL}`;
    } catch (error) {
      console.error(`Failed to connect ${providerId}`, error);
      toast({
        title: "Error",
        description: `Failed to connect to ${providerId}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to revoke a provider
  const revokeProvider = async (providerId: string) => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      const response = await fetch(`/api/auth/revoke-oauth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          provider: providerId,
        }),
      });

      if (response.ok) {
        // Remove from connected providers list
        setConnectedProviders((prev) =>
          prev.filter((p) => p.providerId !== providerId),
        );

        toast({
          title: "Success",
          description: `Successfully disconnected ${providerId}.`,
        });
      } else {
        throw new Error(`Failed to disconnect ${providerId}`);
      }
    } catch (error) {
      console.error(`Failed to revoke ${providerId}`, error);
      toast({
        title: "Error",
        description: `Failed to disconnect ${providerId}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {providers.map((provider) => {
          const isConnected = isProviderConnected(provider.id);

          return (
            <Card key={provider.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {provider.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <CardDescription>
                    {isConnected
                      ? `Connected to ${provider.name}`
                      : `Connect to your ${provider.name} account`}
                  </CardDescription>
                  <Button
                    variant={isConnected ? "destructive" : "outline"}
                    size="sm"
                    onClick={() =>
                      isConnected
                        ? revokeProvider(provider.id)
                        : connectProvider(provider.id)
                    }
                    disabled={isLoading}
                  >
                    {isLoading
                      ? "Loading..."
                      : isConnected
                        ? "Disconnect"
                        : "Connect"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
