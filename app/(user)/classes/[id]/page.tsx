"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  BookOpen, 
  FileText, 
  Lock, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { fetchStudentClassDetail } from "@/lib/api/classes";
import { enrollClass, unenrollClass } from "@/lib/api/enrollment";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Class } from "@/types/class";

interface Section {
  id: number;
  name: string;
  description: string;
  order: number;
  materials: Array<{
    id: number;
    title: string;
    type: string;
  }>;
  quizzes: Array<{
    id: number;
    title: string;
    totalQuestions: number;
  }>;
}

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const classId = params.id as string;

  const [classData, setClassData] = useState<Class | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  useEffect(() => {
    // Show login dialog if not authenticated
    if (!authLoading && !isAuthenticated) {
      setShowLoginDialog(true);
    }

    async function loadClassDetail() {
      try {
        setIsLoading(true);
        
        if (isAuthenticated) {
          // Authenticated: use student endpoint with enrollment status
          const data = await fetchStudentClassDetail(classId);
          setClassData(data.class);
          setSections(data.sections);
          setIsEnrolled(data.isEnrolled);
        } else {
          // Not authenticated: show login dialog
          setShowLoginDialog(true);
        }
      } catch (error) {
        console.error("Failed to load class detail:", error);
        toast.error("Gagal memuat detail kelas");
      } finally {
        setIsLoading(false);
      }
    }

    if (!authLoading) {
      loadClassDetail();
    }
  }, [classId, isAuthenticated, authLoading]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.error("Silakan login terlebih dahulu");
      router.push("/login");
      return;
    }

    try {
      setIsEnrolling(true);
      await enrollClass(parseInt(classId));
      setIsEnrolled(true);
      toast.success("Berhasil mendaftar ke kelas");
    } catch (error) {
      console.error("Failed to enroll:", error);
      toast.error(error instanceof Error ? error.message : "Gagal mendaftar ke kelas");
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleUnenroll = async () => {
    try {
      setIsEnrolling(true);
      await unenrollClass(parseInt(classId));
      setIsEnrolled(false);
      toast.success("Berhasil keluar dari kelas");
    } catch (error) {
      console.error("Failed to unenroll:", error);
      toast.error(error instanceof Error ? error.message : "Gagal keluar dari kelas");
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div>
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">Kelas tidak ditemukan</h2>
        <p className="text-muted-foreground mb-6">
          Kelas yang Anda cari tidak tersedia
        </p>
        <Button onClick={() => router.push("/classes")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Daftar Kelas
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              You need to login first to view class details and enroll in courses.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button onClick={() => router.push("/login")} className="w-full">
              Login
            </Button>
            <Button onClick={() => router.push("/register")} variant="outline" className="w-full">
              Create Account
            </Button>
            <Button onClick={() => router.push("/classes")} variant="ghost" className="w-full">
              Back to Classes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Button
        variant="ghost"
        onClick={() => router.push("/classes")}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali ke Daftar Kelas
      </Button>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Class Header */}
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
            <Image
              src={classData.coverImage || "/placeholder.svg"}
              alt={classData.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div>
            <h1 className="text-4xl font-bold mb-4">{classData.title}</h1>
            <p className="text-lg text-muted-foreground">
              {classData.description}
            </p>
          </div>

          <Separator />

          {/* Sections */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Konten Kelas</h2>
            <div className="space-y-4">
              {sections.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Belum ada konten di kelas ini
                    </p>
                  </CardContent>
                </Card>
              ) : (
                sections.map((section) => (
                  <Card key={section.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span>{section.name}</span>
                        {!isEnrolled && (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Materials */}
                      {section.materials.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 text-sm">Materi</h4>
                          <div className="space-y-2">
                            {section.materials.map((material) => (
                              <div
                                key={material.id}
                                className={`flex items-center gap-3 p-3 rounded-lg border ${
                                  isEnrolled
                                    ? "hover:bg-accent cursor-pointer"
                                    : "bg-muted/50 cursor-not-allowed"
                                }`}
                              >
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="flex-1 text-sm">
                                  {material.title}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {material.type}
                                </Badge>
                                {!isEnrolled && (
                                  <Lock className="h-3 w-3 text-muted-foreground" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quizzes */}
                      {section.quizzes.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 text-sm">Kuis</h4>
                          <div className="space-y-2">
                            {section.quizzes.map((quiz) => (
                              <div
                                key={quiz.id}
                                className={`flex items-center gap-3 p-3 rounded-lg border ${
                                  isEnrolled
                                    ? "hover:bg-accent cursor-pointer"
                                    : "bg-muted/50 cursor-not-allowed"
                                }`}
                              >
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                                <span className="flex-1 text-sm">
                                  {quiz.title}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {quiz.totalQuestions} pertanyaan
                                </Badge>
                                {!isEnrolled && (
                                  <Lock className="h-3 w-3 text-muted-foreground" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {section.materials.length === 0 &&
                        section.quizzes.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Belum ada konten di section ini
                          </p>
                        )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Informasi Kelas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enrollment Status */}
              {isAuthenticated && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                  {isEnrolled ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">
                        Anda terdaftar di kelas ini
                      </span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        Belum terdaftar
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Enrollment Button */}
              {!authLoading && (
                <>
                  {!isAuthenticated ? (
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => router.push("/login")}
                    >
                      Login untuk Mendaftar
                    </Button>
                  ) : isEnrolled ? (
                    <Button
                      className="w-full"
                      size="lg"
                      variant="outline"
                      onClick={handleUnenroll}
                      disabled={isEnrolling}
                    >
                      {isEnrolling ? "Memproses..." : "Keluar dari Kelas"}
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleEnroll}
                      disabled={isEnrolling}
                    >
                      {isEnrolling ? "Mendaftar..." : "Daftar Sekarang"}
                    </Button>
                  )}
                </>
              )}

              <Separator />

              {/* Class Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Section
                  </span>
                  <span className="font-semibold">{sections.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Materi
                  </span>
                  <span className="font-semibold">
                    {sections.reduce(
                      (acc, section) => acc + section.materials.length,
                      0
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Kuis
                  </span>
                  <span className="font-semibold">
                    {sections.reduce(
                      (acc, section) => acc + section.quizzes.length,
                      0
                    )}
                  </span>
                </div>
              </div>

              {!isEnrolled && (
                <>
                  <Separator />
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground text-center">
                      <Lock className="h-4 w-4 inline mr-1" />
                      Daftar ke kelas ini untuk mengakses semua materi dan kuis
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
