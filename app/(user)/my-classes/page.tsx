"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { fetchMyClasses, type EnrolledClass } from "@/lib/api/enrollment";
import { toast } from "sonner";
import { BookOpen, Users, GraduationCap } from "lucide-react";

export default function MyClassesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [classes, setClasses] = useState<EnrolledClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Silakan login terlebih dahulu");
      router.push("/login");
      return;
    }

    async function loadMyClasses() {
      if (!isAuthenticated) return;

      try {
        setIsLoading(true);
        const data = await fetchMyClasses();
        setClasses(data);
      } catch (error) {
        console.error("Failed to load enrolled classes:", error);
        toast.error("Gagal memuat kelas yang diikuti");
      } finally {
        setIsLoading(false);
      }
    }

    if (isAuthenticated) {
      loadMyClasses();
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full rounded-t-lg" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <GraduationCap className="h-8 w-8" />
          <h1 className="text-4xl font-bold">Kelas Saya</h1>
        </div>
        <p className="text-muted-foreground">
          Daftar kelas yang sedang Anda ikuti
        </p>
      </div>

      {/* Empty State */}
      {classes.length === 0 ? (
        <Card className="py-16">
          <CardContent className="text-center">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Belum Ada Kelas</h2>
            <p className="text-muted-foreground mb-6">
              Anda belum mendaftar ke kelas apapun. Mulai belajar dengan
              mendaftar ke kelas yang tersedia.
            </p>
            <Button onClick={() => router.push("/classes")}>
              Jelajahi Kelas
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Classes Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {classes.map((enrollment) => {
              const classData = enrollment.class;
              const imageUrl = classData.image_path?.startsWith("http")
                ? classData.image_path
                : `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(
                    "/api/v1",
                    ""
                  )}/${classData.image_path}`;

              return (
                <Card
                  key={enrollment.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/classes/${classData.id}`)}
                >
                  {/* Cover Image */}
                  <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    <Image
                      src={imageUrl || "/placeholder.svg"}
                      alt={classData.name}
                      fill
                      className="object-cover"
                    />
                    {/* Role Badge */}
                    <div className="absolute top-2 right-2">
                      <Badge
                        variant="secondary"
                        className="bg-background/80 backdrop-blur"
                      >
                        {enrollment.role}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle className="line-clamp-1">
                      {classData.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {classData.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{classData.Section?.length || 0} Section</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{classData._count?.User_Class || 0} Siswa</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
