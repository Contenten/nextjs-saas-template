// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  bearer,
  admin,
  multiSession,
  organization,
  twoFactor,
  oneTap,
  oAuthProxy,
  openAPI,
  oidcProvider,
  genericOAuth,
} from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/db/drizzle";
import { reactInvitationEmail } from "@/lib/email/invitation";
import { reactResetPasswordEmail } from "@/lib/email/reset-password";
import { resend } from "@/lib/email/resend";
import { assignRoleToUser, getRoleByName } from "@/db/queries";
import { account } from "@/db/schema";
import { and, eq } from "drizzle-orm";

const from = process.env.BETTER_AUTH_EMAIL || "delivered@wuchengwei.com";
const to = process.env.TEST_EMAIL || "";

// Let's create an alternative approach that doesn't rely on hooks
// We'll create a function to ensure all users have a role
async function ensureUserHasRole(userId: string): Promise<void> {
  try {
    // Get the "User" role
    const userRole = await getRoleByName("User");
    if (!userRole) {
      console.error("User role not found in the database");
      return;
    }

    // Assign the "User" role to the user if they don't already have it
    await assignRoleToUser({
      userId,
      roleId: userRole.id,
      createdAt: new Date(),
    });
    // console.log(`Assigned User role to user ${userId}`);
  } catch (error) {
    console.error("Error assigning role to user:", error);
  }
}

// Define a type for the signup params
interface SignupParams {
  user?: { id: string; [key: string]: any };
  [key: string]: any;
}

// Define type for OAuth callback params
interface OAuthCallbackParams {
  user?: { id: string; [key: string]: any };
  profile?: any;
  provider?: string;
  [key: string]: any;
}

// Define interface for signIn callback
interface SignInCallbackParams {
  user: { id: string; [key: string]: any } | null | undefined;
  account?: Record<string, any>;
  profile?: Record<string, any>;
}

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailVerification: {
    // async sendVerificationEmail({ user, url }) {
    //   const res = await resend.emails.send({
    //     from,
    //     to: to || user.email,
    //     subject: "Verify your email address",
    //     html: `<a href="${url}">Verify your email address</a>`,
    //   });
    // console.log(res, user.email);
    // },
  },
  emailAndPassword: {
    enabled: true,
    async sendResetPassword({ user, url }) {
      await resend.emails.send({
        from,
        to: user.email,
        subject: "Reset your password",
        react: reactResetPasswordEmail({
          username: user.email,
          resetLink: url,
        }),
      });
    },
    // Add an onSignup handler to assign roles
    async onSignup(params: SignupParams) {
      const { user } = params;
      // Assign the User role
      if (user?.id) {
        await ensureUserHasRole(user.id);
      }
      return params;
    },
  },
  socialProviders: {
    // facebook: {
    // 	clientId: process.env.FACEBOOK_CLIENT_ID || "",
    // 	clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
    // },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      redirectURI: `${process.env.BETTER_AUTH_URL || ""}/api/auth/callback/github`,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirectURI: `${process.env.BETTER_AUTH_URL || ""}/api/auth/callback/google`,
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
      redirectURI: `${process.env.BETTER_AUTH_URL || ""}/api/auth/callback/discord`,
    },
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID || "",
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
      redirectURI: `${process.env.BETTER_AUTH_URL || ""}/api/auth/callback/microsoft`,
    },
    twitch: {
      clientId: process.env.TWITCH_CLIENT_ID || "",
      clientSecret: process.env.TWITCH_CLIENT_SECRET || "",
      redirectURI: `${process.env.BETTER_AUTH_URL || ""}/api/auth/callback/twitch`,
    },
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID || "",
      clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
      redirectURI: `${process.env.BETTER_AUTH_URL || ""}/api/auth/callback/twitter`,
    },
  },
  plugins: [
    // organization({
    //   async sendInvitationEmail(data) {
    //     await resend.emails.send({
    //       from,
    //       to: data.email,
    //       subject: "You've been invited to join an organization",
    //       react: reactInvitationEmail({
    //         username: data.email,
    //         invitedByUsername: data.inviter.user.name,
    //         invitedByEmail: data.inviter.user.email,
    //         teamName: data.organization.name,
    //         inviteLink:
    //           process.env.NODE_ENV === "development"
    //             ? `http://localhost:3000/accept-invitation/${data.id}`
    //             : `${process.env.BETTER_AUTH_URL ||
    //             "https://demo.better-auth.com"
    //             }/accept-invitation/${data.id}`,
    //       }),
    //     });
    //   },
    // }),
    // twoFactor({
    //   otpOptions: {
    //     async sendOTP({ user, otp }) {
    //       await resend.emails.send({
    //         from,
    //         to: user.email,
    //         subject: "Your OTP",
    //         html: `Your OTP is ${otp}`,
    //       });
    //     },
    //   },
    // }),
    // passkey(),
    // openAPI(),
    // bearer(),
    // admin(),
    // multiSession(),
    // oAuthProxy(),
    nextCookies(),
    // oidcProvider({
    //   loginPage: "/sign-in",
    // }),
    // oneTap(),
    // stripe({
    // 	stripeClient: new Stripe(process.env.STRIPE_KEY!),
    // 	stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
    // 	subscription: {
    // 		enabled: true,
    // 		requireEmailVerification: true,
    // 		plans: [
    // 			{
    // 				name: "Starter",
    // 				priceId: STARTER_PRICE_ID.default,
    // 				annualDiscountPriceId: STARTER_PRICE_ID.annual,
    // 				freeTrial: {
    // 					days: 7,
    // 				},
    // 			},
    // 			{
    // 				name: "Professional",
    // 				priceId: PROFESSION_PRICE_ID.default,
    // 				annualDiscountPriceId: PROFESSION_PRICE_ID.annual,
    // 			},
    // 			{
    // 				name: "Enterprise",
    // 			},
    // 		],
    // 	},
    // }),
    genericOAuth({
      config: [
        // Local OAuth provider for testing
        {
          providerId: "local-oauth",
          clientId: "local-client-id",
          clientSecret: "local-client-secret",
          discoveryUrl:
            "http://localhost:3333/oauth/.well-known/openid-configuration",
          authorizationUrl: "http://localhost:3333/oauth/authorize",
          tokenUrl: "http://localhost:3333/oauth/token",
          userInfoUrl: "http://localhost:3333/oauth/userinfo",
          scopes: ["openid", "profile", "email"],
          redirectURI: `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/api/auth/callback/local-oauth`,
          // No discovery URL needed for local testing
          getUserInfo: async (tokenInfo) => {
            // console.log('Calling userinfo with token:', tokenInfo);

            try {
              const response = await fetch(
                "http://localhost:3333/oauth/userinfo",
                {
                  headers: {
                    Authorization: `${tokenInfo.tokenType} ${tokenInfo.accessToken}`,
                  },
                },
              );

              // console.log('Userinfo response status:', response.status);

              if (!response.ok) {
                console.error(
                  "Error fetching user info:",
                  response.status,
                  response.statusText,
                );
                const errorData = await response.json();
                console.error("Error details:", errorData);
                throw new Error(
                  `Failed to fetch user info: ${response.status} ${response.statusText}`,
                );
              }

              const data = await response.json();
              console.log("Userinfo data:", data);

              return {
                // TODO: confirm whether accountId should be generated by the provider or by the server
                id: data.sub,
                email: data.email,
                emailVerified: data.email_verified,
                name: data.name,
                createdAt: new Date(),
                updatedAt: new Date(),
              };
            } catch (error) {
              console.error("Exception in getUserInfo:", error);
              throw error;
            }
          },
        },
      ],
    }),
  ],
  // callbacks: {
  //   // Global hooks that run for all authentication methods
  //   async signIn(params: SignInCallbackParams) {
  //     if (params.user?.id) {
  //       await ensureUserHasRole(params.user.id);
  //     }
  //     return true;
  //   }
  // }
});

// Interface for OAuth accounts in our database
interface OAuthAccount {
  id: string;
  providerId: string;
  userId: string;
  refreshToken?: string | null;
}

// Add OAuth revocation functionality
export async function revokeOAuthAccess(userId: string, provider: string) {
  try {
    // Get the provider-specific information from the database
    const accounts = await db
      .select()
      .from(account)
      .where(and(eq(account.userId, userId), eq(account.providerId, provider)));

    if (!accounts || accounts.length === 0) {
      throw new Error(
        `No account found for user ${userId} with provider ${provider}`,
      );
    }

    const providerAccount = accounts[0];

    // Remove the provider credentials from our database
    await db
      .delete(account)
      .where(and(eq(account.userId, userId), eq(account.providerId, provider)));

    // For a complete revocation, you might also want to call the provider's revocation endpoint
    // This varies by provider, but typically involves using the refresh token or access token
    const refreshToken = providerAccount?.refreshToken;
    if (refreshToken) {
      const providerConfig = getProviderConfig(provider);
      if (providerConfig && providerConfig.revocationUrl) {
        await fetch(providerConfig.revocationUrl, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            token: refreshToken,
            client_id: providerConfig.clientId,
            client_secret: providerConfig.clientSecret,
            token_type_hint: "refresh_token",
          }).toString(),
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error(
      `Error revoking OAuth access for user ${userId} with provider ${provider}:`,
      error,
    );
    return { success: false, error };
  }
}

// Helper function to get provider-specific configuration
function getProviderConfig(provider: string) {
  const providers: Record<string, any> = {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      revocationUrl: "https://api.github.com/applications/:client_id/token",
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      revocationUrl: "https://oauth2.googleapis.com/revoke",
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
      revocationUrl: "https://discord.com/api/oauth2/token/revoke",
    },
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID || "",
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
      revocationUrl:
        "https://login.microsoftonline.com/common/oauth2/v2.0/logout",
    },
    twitch: {
      clientId: process.env.TWITCH_CLIENT_ID || "",
      clientSecret: process.env.TWITCH_CLIENT_SECRET || "",
      revocationUrl: "https://id.twitch.tv/oauth2/revoke",
    },
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID || "",
      clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
      // Twitter doesn't have a standard revocation endpoint
    },
  };

  return providers[provider];
}
