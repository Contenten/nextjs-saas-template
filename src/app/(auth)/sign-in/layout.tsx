import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your account",
};

export default function AppLayout({ children }: any) {
  return <>{children}</>;
}
