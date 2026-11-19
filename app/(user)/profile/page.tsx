"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { updateProfile, changeUserPassword } from "@/lib/api/profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User as UserIcon,
  Mail,
  ShieldCheck,
  KeyRound,
  Save,
  CheckCircle2,
  Calendar,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, checkAuth } = useAuth();

  // Profile Form state
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Sync state with user data
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setUsername(user.username || "");
      setEmail(user.email || "");
    }
  }, [user]);

  // Auth protection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Silakan login terlebih dahulu untuk mengakses profil");
      router.push("/login?from=/profile");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  const getInitials = (val?: string) => {
    if (!val) return "U";
    return val
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nama lengkap tidak boleh kosong");
      return;
    }

    try {
      setIsSavingProfile(true);
      await updateProfile({
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
      });

      await checkAuth();
      toast.success("Profil berhasil diperbarui!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memperbarui profil";
      toast.error(msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 8) {
      toast.error("Password baru minimal 8 karakter");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }

    try {
      setIsSavingPassword(true);
      await changeUserPassword({
        currentPassword: currentPassword || undefined,
        newPassword,
        confirmPassword,
      });

      toast.success("Kata sandi berhasil diperbarui!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memperbarui kata sandi";
      toast.error(msg);
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Pengaturan Akun</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Kelola informasi identitas pribadi dan keamanan akun Anda di LMS Sekolah Alam.
        </p>
      </div>

      {/* Profile Overview Card */}
      <Card className="rounded-2xl border bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <Avatar className="h-24 w-24 border-4 border-background shadow-md">
            <AvatarImage src={user?.profilePicture || undefined} alt={user?.name} />
            <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-2xl font-bold">{user?.name}</h2>
              <Badge variant="secondary" className="w-fit mx-auto sm:mx-0 font-semibold px-2.5 py-0.5">
                <ShieldCheck className="h-3.5 w-3.5 mr-1 text-primary" />
                {user?.role || "Siswa"}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="h-4 w-4" />
              {user?.email}
            </p>

            <p className="text-xs text-muted-foreground/80 flex items-center justify-center sm:justify-start gap-1.5">
              <UserIcon className="h-3.5 w-3.5" />
              @{user?.username || "pengguna"}
            </p>
          </div>
        </div>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="general" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-2 rounded-xl p-1 bg-muted/60 max-w-md">
          <TabsTrigger value="general" className="rounded-lg text-xs sm:text-sm font-semibold gap-2">
            <UserIcon className="h-4 w-4" />
            Data Pribadi
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg text-xs sm:text-sm font-semibold gap-2">
            <KeyRound className="h-4 w-4" />
            Keamanan Sandi
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Data Pribadi */}
        <TabsContent value="general">
          <Card className="rounded-2xl border shadow-xs">
            <CardHeader>
              <CardTitle className="text-lg">Informasi Profil</CardTitle>
              <CardDescription>
                Perbarui nama lengkap, username, dan foto profil yang tampil di platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Nama Lengkap
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium">
                      Username
                    </Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Masukkan username"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-sm font-medium">
                      Peran / Role Akun
                    </Label>
                    <Input
                      id="role"
                      value={user?.role || "Siswa"}
                      disabled
                      className="bg-muted text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <Button type="submit" disabled={isSavingProfile} className="gap-2 font-semibold shadow-xs">
                    <Save className="h-4 w-4" />
                    {isSavingProfile ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Keamanan Sandi */}
        <TabsContent value="security">
          <Card className="rounded-2xl border shadow-xs">
            <CardHeader>
              <CardTitle className="text-lg">Perbarui Kata Sandi</CardTitle>
              <CardDescription>
                Pastikan akun Anda tetap aman dengan menggunakan kata sandi yang kuat dan unik (minimal 8 karakter).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-5">
                <div className="space-y-2 max-w-md">
                  <Label htmlFor="newPassword">Kata Sandi Baru</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    required
                  />
                </div>

                <div className="space-y-2 max-w-md">
                  <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi Baru</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi baru"
                    required
                  />
                </div>

                <div className="flex justify-start pt-3">
                  <Button type="submit" disabled={isSavingPassword} className="gap-2 font-semibold shadow-xs">
                    <KeyRound className="h-4 w-4" />
                    {isSavingPassword ? "Memperbarui..." : "Perbarui Kata Sandi"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
