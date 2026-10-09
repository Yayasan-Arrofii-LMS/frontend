"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchPublicClasses } from "@/lib/api/classes";
import { Class } from "@/types/class";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ClassesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Debounce search value
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 600);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    async function loadClasses() {
      try {
        setIsLoading(true);
        const { classes: publicClasses, meta } = await fetchPublicClasses(
          currentPage,
          debouncedSearch
        );
        setClasses(publicClasses);
        setTotalPages(meta.totalPages);
        setTotalItems(meta.totalItems);
      } catch (error) {
        console.error("Gagal memuat kelas:", error);
        toast.error("Gagal memuat kelas");
        setClasses([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadClasses();
  }, [currentPage, debouncedSearch]);

  const handleClassClick = (classId: string, e: React.MouseEvent) => {
    e.preventDefault();

    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      setShowLoginDialog(true);
    } else {
      router.push(`/classes/${classId}`);
    }
  };

  const handleLoginRedirect = () => {
    setShowLoginDialog(false);
    router.push("/login");
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl overflow-x-hidden">
      {/* Heading */}
      <div className="mb-6 text-center">
        <h1 className="mb-2 text-3xl sm:text-4xl font-bold tracking-tight">
          Semua Kelas
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground">
          Jelajahi dan temukan semua kursus yang tersedia
        </p>
      </div>

      {/* Search Bar (Full Rounded & Centered) */}
      <div className="mb-8 flex justify-center">
        <div className="relative w-full max-w-2xl flex items-center rounded-full bg-card border-2 border-muted-foreground/20 hover:border-primary/40 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 shadow-md transition-all px-4 py-1">
          <Search className="h-5 w-5 text-muted-foreground shrink-0 ml-1" />
          <Input
            type="text"
            placeholder="Cari kelas yang ingin dipelajari..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 border-0 bg-transparent text-base shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/70"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-8 flex justify-center">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {[
            "Semua",
            "Sains Alam",
            "Keterampilan Hidup",
            "Kewirausahaan",
            "Budaya",
          ].map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={
                selectedCategory === category
                  ? "font-bold shadow-xs"
                  : "font-normal text-foreground"
              }
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : classes.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg text-muted-foreground">
            {searchQuery
              ? "Tidak ada kelas yang cocok dengan pencarian Anda"
              : "Tidak ada kelas tersedia"}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((classItem) => (
            <div
              key={classItem.id}
              onClick={(e) => handleClassClick(classItem.id, e)}
              className="cursor-pointer"
            >
              <Card className="overflow-hidden transition-shadow hover:shadow-lg h-full">
                <div className="aspect-video w-full overflow-hidden bg-muted relative">
                  <Image
                    src={classItem.coverImage || "/placeholder.svg"}
                    alt={classItem.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">
                    {classItem.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {classItem.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {classItem.teacherName && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{classItem.teacherName}</span>
                    </div>
                  )}
                  {classItem.studentCount !== undefined &&
                    classItem.studentCount > 0 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{classItem.studentCount} siswa</span>
                      </div>
                    )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      {!isLoading && classes.length > 0 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Sebelumnya
          </Button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className="min-w-[40px]"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
          >
            Selanjutnya
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {!isLoading && totalItems > 0 && !searchQuery && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Menampilkan halaman {currentPage} dari {totalPages} ({totalItems}{" "}
          total kelas)
        </div>
      )}

      <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Login Diperlukan</AlertDialogTitle>
            <AlertDialogDescription>
              Anda harus login terlebih dahulu untuk melihat detail kelas.
              Silakan login atau buat akun baru untuk melanjutkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleLoginRedirect}>
              Login
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
