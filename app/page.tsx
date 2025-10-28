import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Users, GraduationCap } from "lucide-react";

export default function Home() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex min-h-screen flex-col">
      <section className="flex flex-1 items-center justify-center px-4 py-12 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-flex items-center rounded-full border bg-muted px-4 py-1.5 text-sm">
            <GraduationCap className="mr-2 h-4 w-4" />
            <span>Sekolah Alam Learning Management System</span>
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Sekolah Alam
            </span>
          </h1>

          <p className="mb-8 text-lg text-muted-foreground sm:text-xl md:mb-12">
            A modern learning management system designed to empower educators
            and inspire students. Access your courses, manage your classes, and
            track your progress all in one place.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/login">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/register">Create Account</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/50 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold">Key Features</h2>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Course Management</h3>
              <p className="text-muted-foreground">
                Easily create, organize, and manage your courses with our
                intuitive interface.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Teacher Portal</h3>
              <p className="text-muted-foreground">
                Comprehensive tools for teachers to manage students and track
                their progress.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Student Dashboard</h3>
              <p className="text-muted-foreground">
                Access all your courses, assignments, and resources in one
                central location.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t px-4 py-8">
        <div className="mx-auto max-w-6xl text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} Sekolah Alam. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
