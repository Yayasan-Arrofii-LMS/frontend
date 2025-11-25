import { PublicNavbar } from "@/components/public-navbar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <PublicNavbar />
      <main className="pt-0">{children}</main>
    </div>
  );
}
