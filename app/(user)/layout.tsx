import { PublicNavbar } from "@/components/public-navbar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PublicNavbar />
      <main>{children}</main>
    </>
  );
}
