import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your account password",
};

export default function AppLayout({ children }: any) {
  return <>{children}</>;
}
