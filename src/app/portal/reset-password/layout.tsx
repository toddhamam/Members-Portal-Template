import { AuthProvider } from "@/components/auth/AuthProvider";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Reset Password | Inner Wealth Initiate",
  description: "Reset your account password",
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center p-4">
        {children}
      </div>
    </AuthProvider>
  );
}
