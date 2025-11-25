"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookOpen, Users, GraduationCap } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { fetchPublicClasses } from "@/lib/api/classes";
import { Class } from "@/types/class";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function HomePage() {
  const currentYear = new Date().getFullYear();
  const { isLoading, isAuthenticated } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);

  useEffect(() => {
    async function loadClasses() {
      try {
        setIsLoadingClasses(true);
        const { classes: publicClasses } = await fetchPublicClasses(1);
        // Show first 8 classes for featured section
        setClasses(publicClasses.slice(0, 8));
      } catch (error) {
        console.error("Failed to load classes:", error);
        toast.error("Gagal memuat kelas");
        setClasses([]);
      } finally {
        setIsLoadingClasses(false);
      }
    }

    loadClasses();
  }, []);

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

          {isLoadingClasses ? (
            <div className="mb-8 overflow-x-auto">
              <div className="flex gap-6 pb-4" style={{ width: 'max-content' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Card key={i} className="overflow-hidden w-[320px] flex-shrink-0">
                    <Skeleton className="aspect-video w-full" />
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : classes.length > 0 ? (
            <div className="mb-8 overflow-x-auto">
              <div className="flex gap-6 pb-4" style={{ width: 'max-content' }}>
                {classes.map((classItem) => (
                  <Card key={classItem.id} className="overflow-hidden transition-shadow hover:shadow-lg w-[320px] flex-shrink-0">
                    <div className="aspect-video w-full overflow-hidden bg-muted relative">
                      <Image
                        src={classItem.coverImage || "/placeholder.svg"}
                        alt={classItem.title}
                        fill
                        className="object-cover"
                        sizes="320px"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{classItem.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {classItem.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {classItem.teacherName && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{classItem.teacherName}</span>
                        </div>
                      )}
                      {classItem.studentCount !== undefined && classItem.studentCount > 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{classItem.studentCount} students</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Tidak ada kelas tersedia</p>
            </div>
          )}

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
