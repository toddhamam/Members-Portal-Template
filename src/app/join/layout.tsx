import { AuthProvider } from "@/components/auth/AuthProvider";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Join Free | Inner Wealth Initiate",
  description: "Create your free account to access exclusive content and join our community",
};

export default function JoinLayout({
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
