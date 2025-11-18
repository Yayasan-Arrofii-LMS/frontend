import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="mb-8 rounded-full bg-muted p-6">
          <FileQuestion className="h-16 w-16 text-muted-foreground" />
        </div>

        <h1 className="mb-2 text-4xl font-bold tracking-tight">404</h1>

        <h2 className="mb-4 text-2xl font-semibold tracking-tight">
          Page not found
        </h2>

        <p className="mb-8 text-muted-foreground">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. The
          page might have been removed, had its name changed, or is temporarily
          unavailable.
        </p>

        <div className="flex gap-4">
          <Button asChild>
            <Link href="/">Go to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
