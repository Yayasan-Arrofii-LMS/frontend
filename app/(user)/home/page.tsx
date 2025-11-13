"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookOpen, Users, GraduationCap, Clock, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

// Dummy classes data
const DUMMY_CLASSES = [
  {
    id: "1",
    title: "Introduction to React",
    description: "Learn the fundamentals of React including components, props, and state management.",
    teacher: "Dr. Sarah Johnson",
    students: 45,
    duration: "8 weeks",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop",
  },
  {
    id: "2",
    title: "Advanced JavaScript",
    description: "Master advanced JavaScript concepts like closures, async/await, and design patterns.",
    teacher: "Prof. Michael Chen",
    students: 32,
    duration: "10 weeks",
    image: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=250&fit=crop",
  },
  {
    id: "3",
    title: "Web Design Fundamentals",
    description: "Create beautiful and responsive web designs using modern CSS and design principles.",
    teacher: "Emily Rodriguez",
    students: 58,
    duration: "6 weeks",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop",
  },
];

export default function HomePage() {
  const currentYear = new Date().getFullYear();
  const { user, isLoading, isAuthenticated } = useAuth();

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

          {!isLoading && !isAuthenticated && (
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
          )}

          {isAuthenticated && (
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              {/* <Button size="lg" asChild>
                <Link href={user?.role === "admin" ? "/dashboard" : user?.role === "teacher" ? "/class" : "/home"}>
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button> */}
              <Button size="lg" variant="outline" asChild>
                <Link href="/classes">Browse Classes</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Featured Classes */}
      <section className="border-t px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold">Featured Classes</h2>
            <p className="text-muted-foreground">
              Explore our most popular courses and start learning today
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {DUMMY_CLASSES.map((classItem) => (
              <Card key={classItem.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  <img
                    src={classItem.image}
                    alt={classItem.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{classItem.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {classItem.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{classItem.teacher}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{classItem.students} students</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{classItem.duration}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button variant="outline" size="lg" asChild>
              <Link href="/classes">
                View All Classes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Key Features */}
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
