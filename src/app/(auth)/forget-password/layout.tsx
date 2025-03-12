import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Request a password reset link",
};

export default function AppLayout({ children }: any) {
  return <>{children}</>;
}
