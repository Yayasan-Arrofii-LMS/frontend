import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Target, Users, Heart } from "lucide-react";

export default function AboutPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold">Tentang Sekolah Alam</h1>
          <p className="text-lg text-muted-foreground">
            Memberdayakan pendidikan melalui alam dan teknologi
          </p>
        </div>

        <div className="prose dark:prose-invert mx-auto mb-12">
          <h2>Kisah Kami</h2>
          <p>
            Sekolah Alam didirikan dengan visi untuk merevolusi pendidikan dengan
            menggabungkan pembelajaran berbasis alam dan teknologi modern.
            Kami percaya bahwa setiap siswa berhak mendapatkan akses ke pendidikan
            berkualitas yang tidak hanya mengasah pikiran mereka, tetapi juga memupuk
            koneksi mereka dengan alam.
          </p>

          <h2>Misi Kami</h2>
          <p>
            Menyediakan sistem manajemen pembelajaran inovatif yang memberdayakan
            para pendidik untuk menciptakan kurikulum yang menarik dan terinspirasi
            dari alam, sambil memberikan siswa alat yang mereka butuhkan untuk berkembang
            di era digital. Kami berupaya membuat pendidikan menjadi lebih mudah diakses,
            menyenangkan, dan bermakna bagi semua orang.
          </p>
        </div>

        <div className="mb-12 grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Visi Kami</h3>
              <p className="text-muted-foreground">
                Menjadi platform terdepan yang menjembatani pendidikan berbasis alam
                tradisional dengan alat pembelajaran digital yang canggih, menciptakan
                pengalaman belajar yang holistik dan bermakna.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Nilai Kami</h3>
              <p className="text-muted-foreground">
                Inovasi, aksesibilitas, keberlanjutan, dan pembelajaran yang berpusat
                pada siswa adalah inti dari semua yang kami lakukan. Kami berkomitmen
                untuk menciptakan lingkungan belajar yang inklusif dan menginspirasi.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-12">
          <h2 className="mb-6 text-center text-3xl font-bold">Mengapa Memilih Kami?</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Pendidik Ahli</h3>
              <p className="text-sm text-muted-foreground">
                Platform kami dirancang oleh pendidik berpengalaman yang memahami
                tantangan pengajaran modern dan kebutuhan pembelajaran kontemporer.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Komunitas Aktif</h3>
              <p className="text-sm text-muted-foreground">
                Bergabunglah dengan komunitas yang dinamis dari para pembelajar dan
                pendidik yang bersemangat tentang pendidikan berkualitas dan pelestarian alam.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Fokus pada Siswa</h3>
              <p className="text-sm text-muted-foreground">
                Setiap fitur dirancang dengan kesuksesan dan keterlibatan siswa sebagai
                prioritas utama, memastikan pengalaman belajar yang optimal.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-muted/50 p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold">Mari Terhubung</h2>
          <p className="mb-4 text-muted-foreground">
            Punya pertanyaan atau ingin mengetahui lebih lanjut tentang Sekolah Alam?
            Kami siap membantu Anda memulai perjalanan pembelajaran yang luar biasa.
          </p>
        </div>
      </div>

      <footer className="mt-16 border-t pt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {currentYear} Sekolah Alam. Hak cipta dilindungi.</p>
      </footer>
    </div>
  );
}
