// Force dynamic rendering since this page uses useSearchParams
export const dynamic = "force-dynamic";

export default function ThankYouLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
