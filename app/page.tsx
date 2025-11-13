import { redirect } from "next/navigation";

export default function RootPage() {
  // Redirect to landing page in (user) group
  redirect("/home");
}
