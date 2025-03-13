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
} from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/db/drizzle";
import { reactInvitationEmail } from "@/lib/email/invitation";
import { reactResetPasswordEmail } from "@/lib/email/reset-password";
import { resend } from "@/lib/email/resend";
import { assignRoleToUser, getRoleByName } from "@/db/queries";

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
    console.log(`Assigned User role to user ${userId}`);
  } catch (error) {
    console.error("Error assigning role to user:", error);
  }
}

// Define a type for the signup params
interface SignupParams {
  user?: { id: string; [key: string]: any };
  [key: string]: any;
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
    //   console.log(res, user.email);
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
  ],
});
