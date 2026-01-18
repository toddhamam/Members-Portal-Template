import { AuthProvider } from "@/components/auth/AuthProvider";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Create Account | Inner Wealth Initiate",
  description: "Create your account to access purchased products",
};

export default function SignupLayout({
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
