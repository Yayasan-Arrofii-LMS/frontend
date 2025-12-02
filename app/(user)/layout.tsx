import { PublicNavbar } from "@/components/public-navbar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
