import { AuthProvider } from "@/components/auth/AuthProvider";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Login | Inner Wealth Initiate",
  description: "Sign in to access your purchased products",
};

// Auth pages have their own simpler layout without sidebar
export default function AuthLayout({
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
