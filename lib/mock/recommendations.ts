import {
  InterestTopic,
  RecommendedMaterial,
  RemedialItem,
  AdvancedLearningItem,
  RecommendationHistoryItem,
} from "@/types/recommendation";

export const AVAILABLE_INTERESTS: {
  topic: InterestTopic;
  description: string;
  iconName: string;
}[] = [
    {
      topic: "Sains Alam",
      description: "Biologi, fisika terapan, ekologi & keanekaragaman flora-fauna",
      iconName: "Leaf",
    },
    {
      topic: "Pertanian",
      description: "Agronomi organik, permakultur, hidroponik & tanah subur",
      iconName: "Sprout",
    },
    {
      topic: "Lingkungan",
      description: "Konservasi air, pengelolaan sampah, energi bersih & iklim",
      iconName: "Globe2",
    },
    {
      topic: "Keterampilan Hidup",
      description: "Survival alam terbuka, kerajinan alam, PPPK & navigasi",
      iconName: "Compass",
    },
    {
      topic: "Kewirausahaan",
      description: "Agroekonomi, pemasaran hasil panen & produk ramah lingkungan",
      iconName: "Coins",
    },
    {
      topic: "Budaya",
      description: "Kearifan lokal nusantara, tradisi lisan & pelestarian adat",
      iconName: "Landmark",
    },
  ];

export const INITIAL_RECOMMENDED_MATERIALS: RecommendedMaterial[] = [
  {
    id: "rec-1",
    title: "Mengenal Ekosistem Hutan",
    category: "Sains Alam",
    mediaType: "Video",
    durationMinutes: 15,
    difficulty: "Pemula",
    thumbnail:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
    description:
      "Pelajari struktur kanopi hutan hujan tropis, peran dekomposer, dan jaring-jaring makanan dalam menjaga keseimbangan alam.",
    recommendationType: "Berdasarkan Minat",
    reason: "Sesuai dengan minatmu pada Sains Alam dan eksplorasi hutan.",
    detailedReason: {
      overview:
        "Sistem mendeteksi tingginya ketertarikanmu pada topik Sains Alam dan ekologi lingkungan sekolah.",
      targetCompetency:
        "Mampu mengidentifikasi tingkatan trofik ekosistem hutan dan peran mutualisme spesies.",
      learningPathMatch:
        "Merupakan materi pembuka yang sangat ideal untuk jalur pembelajaran Penjelajah Alam Lestari.",
      interestRelevance:
        "Relevansi 96% terhadap minat terpilih: Sains Alam & Lingkungan.",
    },
    progressPercentage: 0,
    contentPreview: {
      summary:
        "Video interaktif 15 menit ini membawa siswa menjelajahi lapisan hutan dari lantai dasar hingga tajuk teratas kanopi tropis.",
      keyPoints: [
        "Strata vegetasi hutan hujan tropis: tajuk pohon emergensi, kanopi, understory, dan serasah lantai hutan.",
        "Rantai makanan alami serta peran organisme perombak (dekomposer).",
        "Pentingnya menjaga keanekaragaman genetik flora dan fauna endemik.",
      ],
      practicalExercise:
        "Lakukan observasi pohon rindang terdekat di pekarangan sekolah dan catat 3 jenis organisme yang hidup di sekitarnya.",
    },
  },
  {
    id: "rec-2",
    title: "Cara Membuat Kompos Organik",
    category: "Pertanian",
    mediaType: "Artikel",
    durationMinutes: 10,
    difficulty: "Pemula",
    thumbnail:
      "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80",
    description:
      "Panduan praktis mengolah sisa daun kering dan limbah dapur sekolah menjadi pupuk kompos kaya nutrisi bagi tanaman.",
    recommendationType: "Berdasarkan Minat",
    reason: "Sesuai dengan minatmu pada Pertanian berkelanjutan.",
    detailedReason: {
      overview:
        "Rekomendasi ini disusun untuk menunjang aktivitas bercocok tanam organik yang relevan dengan minat Pertanianmu.",
      targetCompetency:
        "Memahami perbandingan bahan cokelat (karbon) dan bahan hijau (nitrogen) dalam proses pengomposan aerobik.",
      learningPathMatch:
        "Menyediakan dasar praktik mandiri sebelum memulai budidaya tanaman hortikultura.",
      interestRelevance:
        "Relevansi 92% terhadap minat Pertanian dan Lingkungan Hidup.",
    },
    progressPercentage: 40,
    contentPreview: {
      summary:
        "Artikel terstruktur dengan diagram tahapan fermentasi kompos menggunakan metode keranjang Takakura dan drum aerob.",
      keyPoints: [
        "Rasio ideal C:N (Karbon dan Nitrogen) berkisar antara 25:1 hingga 30:1.",
        "Pengontrolan kelembapan (seperti spons basah yang diperas) dan aerasi pembalikan rutin.",
        "Ciri kompos matang: warna cokelat kehitaman, aroma tanah segar, dan suhu stabil.",
      ],
      practicalExercise:
        "Kumpulkan 1 karung daun kering dan setengah ember sisa sayuran untuk mulai membuat tumpukan komposter kelas.",
    },
  },
  {
    id: "rec-3",
    title: "Mengelola Sampah di Lingkungan",
    category: "Lingkungan",
    mediaType: "Video",
    durationMinutes: 12,
    difficulty: "Pemula",
    thumbnail:
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80",
    description:
      "Terapkan prinsip 3R (Reduce, Reuse, Recycle) untuk menuntaskan masalah timbulan sampah di lingkungan sekolah dan rumah tangga.",
    recommendationType: "Berdasarkan Progres",
    reason: "Direkomendasikan berdasarkan progres belajarmu di topik lingkungan hidup.",
    detailedReason: {
      overview:
        "Berdasarkan aktivitas modul kebersihan lingkungan terakhirmu, materi ini mengisi pemahaman pemilahan sampah di sumbernya.",
      targetCompetency:
        "Mampu membedakan kategori limbah organik, anorganik terdaur-ulang, dan residu berbahaya.",
      learningPathMatch:
        "Melanjutkan penguatan pemahaman setelah meninjau isu sanitasi ekologis.",
      interestRelevance:
        "Relevansi 88% terhadap progres pembelajaran dan rekam jejak kuis siswa.",
    },
    progressPercentage: 10,
    contentPreview: {
      summary:
        "Dokumenter pendek aksi nyata pengelolaan sampah berbasis komunitas di sekolah alam percontohan.",
      keyPoints: [
        "Siklus hidup plastik sekali pakai dan dampaknya terhadap kesuburan tanah mikroba.",
        "Teknik pemilahan 5 ember di lingkungan belajar sekolah alam.",
        "Strategi 'Zero Waste Picnic' saat kegiatan outdoor dan ekspedisi alam.",
      ],
      practicalExercise:
        "Audit sampah pribadi selama 24 jam dan catat persentase material yang dapat dikompos atau didaur ulang.",
    },
  },
  {
    id: "rec-4",
    title: "Dasar-Dasar Budidaya Tanaman",
    category: "Pertanian",
    mediaType: "Materi Interaktif",
    durationMinutes: 20,
    difficulty: "Menengah",
    thumbnail:
      "https://images.unsplash.com/photo-1592417817098-8f3d6eb22530?auto=format&fit=crop&w=800&q=80",
    description:
      "Eksplorasi interaktif tentang pemilihan benih unggul, persiapan media tanam gembur, pola penyiraman, dan rotasi tanaman.",
    recommendationType: "Berdasarkan Minat",
    reason: "Materi interaktif untuk memperkuat pemahaman praktik agronomi mandiri.",
    detailedReason: {
      overview:
        "Model interaktif ini dirancang khusus untuk memandu simulasi penyemaian dan pemeliharaan bibit tanaman hortikultura.",
      targetCompetency:
        "Mendiagnosis kebutuhan nutrisi primer tanaman (NPK) dan teknik persemaian benih berkecambah.",
      learningPathMatch:
        "Terkoneksi langsung dengan minat Pertanian dan proyek kebun belajar siswa.",
      interestRelevance:
        "Relevansi 95% terhadap minat Pertanian Berkelanjutan.",
    },
    progressPercentage: 0,
    contentPreview: {
      summary:
        "Simulasi interaktif memilih jenis tanah, mengukur kelembapan media semai, dan mengatur pencahayaan matahari bibit muda.",
      keyPoints: [
        "Formula media tanam seimbang: 1 bagian tanah subur + 1 bagian kompos matang + 1 bagian sekam bakar.",
        "Masa dormansi benih dan teknik 'sketsing' untuk mempercepat perkecambahan biji keras.",
        "Pola penyiraman kabut (misting) untuk mencegah erosi permukaan pot semai.",
      ],
      practicalExercise:
        "Semai 5 butir biji kangkung atau cabai rawit pada polybag kecil dan amati pertumbuhannya selama 7 hari.",
    },
  },
  {
    id: "rec-5",
    title: "Mengenal Peluang Usaha Hasil Panen",
    category: "Kewirausahaan",
    mediaType: "Artikel",
    durationMinutes: 15,
    difficulty: "Menengah",
    thumbnail:
      "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80",
    description:
      "Pelajari cara mengemas, menentukan harga adil, dan memasarkan hasil panen kebun organik sekolah ke komunitas sekitar.",
    recommendationType: "Berdasarkan Minat",
    reason: "Sesuai dengan minatmu pada Kewirausahaan hasil bumi sekolah alam.",
    detailedReason: {
      overview:
        "Mengembangkan jiwa entrepreneurship hijau (ecopreneurship) dengan memaksimalkan nilai tambah komoditas kebun sekolah.",
      targetCompetency:
        "Menghitung harga pokok produksi (HPP) panen dan mendesain kemasan ramah lingkungan berbahan daun/kertas.",
      learningPathMatch:
        "Cocok untuk siswa yang ingin menghubungkan hobi bercocok tanam dengan kemandirian finansial.",
      interestRelevance:
        "Relevansi 90% terhadap minat Kewirausahaan dan Keterampilan Hidup.",
    },
    progressPercentage: 0,
    contentPreview: {
      summary:
        "Studi kasus mini tentang penjualan sayur segar organik saat hari pasar sekolah (Market Day).",
      keyPoints: [
        "Perbedaan nilai jual sayur mentah vs produk olahan herbal siap saji.",
        "Prinsip 'Fair Trade' dan kejujuran timbangan dalam bertransaksi.",
        "Edukasi storytelling tentang proses tanam organik sebagai daya tarik konsumen.",
      ],
      practicalExercise:
        "Rancang selebaran informasi satu halaman untuk memasarkan selada hidroponik hasil kebun kelas.",
    },
  },
  {
    id: "rec-6",
    title: "Pengelolaan Sampah Organik untuk Pemula",
    category: "Lingkungan",
    mediaType: "Modul Praktik",
    durationMinutes: 18,
    difficulty: "Pemula",
    thumbnail:
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
    description:
      "Panduan remedial terarah untuk menuntaskan kompetensi pengelompokan sampah organik dan pemanfaatan biopori.",
    recommendationType: "Remedial",
    reason: "Materi ini membantu memperkuat kompetensi yang belum mencapai target kelulusan.",
    detailedReason: {
      overview:
        "Hasil simulasi kuis terakhirmu pada kompetensi 'Pengelolaan Sampah' mencatat skor 55/100 (target: 75/100). Modul ini fokus mereview konsep yang masih keliru.",
      targetCompetency:
        "Mampu memilah 10 jenis sampah organik dapur dan menerapkan lubang biopori pekarangan.",
      learningPathMatch:
        "Remedial intensif berdurasi singkat untuk memulihkan capaian belajar.",
      interestRelevance:
        "Direkomendasikan langsung oleh sistem pemantauan remedial belajar siswa.",
    },
    progressPercentage: 55,
    contentPreview: {
      summary:
        "Modul pemantapan remedial dilengkapi soal latihan interaktif dan panduan video langkah demi langkah pembuatan biopori.",
      keyPoints: [
        "Identifikasi material yang aman dimasukkan ke biopori (daun kering, sisa buah) vs yang dihindari (tulang keras, minyak).",
        "Menjaga mikroorganisme tanah agar dekomposisi berlangsung tanpa bau menyengat.",
        "Teknik pengukuran infiltrasi air hujan melalui lubang biopori tanah.",
      ],
      practicalExercise:
        "Kerjakan 5 soal studi kasus pemilahan sampah organik dan lakukan uji pemahaman ulang.",
    },
  },
  {
    id: "rec-7",
    title: "Teknik Konservasi & Restorasi Ekosistem Lanjutan",
    category: "Sains Alam",
    mediaType: "Materi Interaktif",
    durationMinutes: 25,
    difficulty: "Mahir",
    thumbnail:
      "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80",
    description:
      "Tingkatkan pemahamanmu ke strategi pemulihan habitat alami, reboisasi tanaman endemik, dan pemantauan satwa liar.",
    recommendationType: "Materi Lanjutan",
    reason: "Materi lanjutan setelah kamu menyelesaikan topik ekosistem dasar dengan capaian sangat baik.",
    detailedReason: {
      overview:
        "Kamu telah menuntaskan topik 'Dasar Pengamatan Ekosistem' dengan capaian nilai 90/100. Materi ini membuka wawasan aksi konservasi riil.",
      targetCompetency:
        "Mampu menyusun rencana pemulihan tutupan lahan terdegradasi dan indeks keanekaragaman Shannon-Wiener sederhana.",
      learningPathMatch:
        "Jalur lanjutan menuju sertifikasi Duta Konservasi Sekolah Alam.",
      interestRelevance:
        "Direkomendasikan otomatis setelah prasyarat modul ekologi dasar terpenuhi.",
    },
    progressPercentage: 0,
    contentPreview: {
      summary:
        "Materi pengayaan tingkat mahir dengan studi kasus reboisasi lereng gunung dan koridor satwa liar.",
      keyPoints: [
        "Metode suksesi vegetasi alami vs penanaman pionir buatan.",
        "Teknik konservasi tanah terasering ramah lereng menggunakan tanaman vetiver.",
        "Penggunaan kamera jebak (camera trap) untuk memantau kembalinya fauna pasca-restorasi.",
      ],
      practicalExercise:
        "Petakan area gundul di sekitar sekolah dan buat proposal mini penanaman 10 pohon endemik peneduh.",
    },
  },
  {
    id: "rec-8",
    title: "Kearifan Lokal Hutan Adat Nusantara",
    category: "Budaya",
    mediaType: "Artikel",
    durationMinutes: 14,
    difficulty: "Pemula",
    thumbnail:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    description:
      "Mendalami aturan adat lubuk larangan dan zonasi hutan larangan dalam menjaga kelestarian mata air generasi masa depan.",
    recommendationType: "Berdasarkan Minat",
    reason: "Sesuai dengan minatmu pada Budaya dan nilai luhur pelestarian alam nusantara.",
    detailedReason: {
      overview:
        "Materi ini menggabungkan pengetahuan budaya kearifan lokal dengan sains pelestarian ekosistem adat nusantara.",
      targetCompetency:
        "Menjelaskan konsep 'Lubuk Larangan' dan 'Hutan Larangan' sebagai instrumen konservasi tradisional.",
      learningPathMatch:
        "Pengayaan wawasan kebudayaan nusantara dalam konteks sekolah alam.",
      interestRelevance:
        "Relevansi 91% terhadap minat Budaya dan Sains Alam.",
    },
    progressPercentage: 0,
    contentPreview: {
      summary:
        "Kajian naratif budaya tentang bagaimana nenek moyang nusantara membagi wilayah hutan menjadi hutan larangan, hutan tutupan, dan hutan garapan.",
      keyPoints: [
        "Prinsip tabu dan sanksi sosial adat yang efektif menjaga kelestarian hutan selama ratusan tahun.",
        "Ritual pelepasan benih ikan lokal pada lubuk larangan di DAS Sumatera.",
        "Integrasi kearifan lokal ke dalam kebijakan pelestarian lingkungan modern.",
      ],
      practicalExercise:
        "Wawancarai orang tua atau tetua lingkungan tentang pantangan alam yang pernah berlaku di daerah asalmu.",
    },
  },
];

export const INITIAL_REMEDIAL_DATA: RemedialItem = {
  id: "rem-1",
  competency: "Pengelolaan Sampah",
  currentScore: 55,
  targetScore: 75,
  materialTitle: "Pengelolaan Sampah Organik untuk Pemula",
  category: "Lingkungan",
  mediaType: "Modul Praktik",
  durationMinutes: 18,
  reason:
    "Materi ini dapat membantu memperkuat kompetensi yang belum mencapai target ketuntasan (55/100).",
  description:
    "Fokus penguatan pada identifikasi sampah organik dapur, pemisahan residu anorganik, dan metode lubang resapan biopori sekolah.",
  actionText: "Pelajari Kembali",
  recommendedMaterialId: "rec-6",
};

export const INITIAL_ADVANCED_LEARNING_DATA: AdvancedLearningItem = {
  id: "adv-1",
  previousMaterial: "Dasar Pengamatan Ekosistem Hutan",
  competencyAchieved: "Identifikasi Flora & Fauna Alam (Skor 90/100)",
  nextMaterialTitle: "Teknik Konservasi & Restorasi Ekosistem Lanjutan",
  prerequisites: "Telah menyelesaikan Modul Ekologi Dasar dengan nilai di atas 80",
  accessStatus: "Siap Dipelajari",
  category: "Sains Alam",
  mediaType: "Materi Interaktif",
  durationMinutes: 25,
  description:
    "Kamu telah menguasai dasar rantai makanan dan stratifikasi hutan. Sekarang saatnya melangkah ke strategi restorasi habitat dan pemulihan keanekaragaman hayati.",
  recommendedMaterialId: "rec-7",
};

export const INITIAL_HISTORY_DATA: RecommendationHistoryItem[] = [
  {
    id: "hist-1",
    materialId: "rec-1",
    materialTitle: "Mengenal Ekosistem Hutan",
    date: "26 Okt 2026",
    recommendationType: "Berdasarkan Minat",
    reason: "Sesuai dengan minatmu pada Sains Alam.",
    interactionStatus: "Dibuka",
    feedback: "Relevan",
  },
  {
    id: "hist-2",
    materialId: "rec-3",
    materialTitle: "Mengelola Sampah di Lingkungan",
    date: "25 Okt 2026",
    recommendationType: "Berdasarkan Progres",
    reason: "Direkomendasikan berdasarkan progres belajarmu di topik lingkungan.",
    interactionStatus: "Dipelajari",
    feedback: "Relevan",
  },
  {
    id: "hist-3",
    materialId: "rec-6",
    materialTitle: "Pengelolaan Sampah Organik untuk Pemula",
    date: "24 Okt 2026",
    recommendationType: "Remedial",
    reason: "Membantu menuntaskan kompetensi evaluasi Pengelolaan Sampah.",
    interactionStatus: "Belum Dibuka",
  },
  {
    id: "hist-4",
    materialId: "rec-2",
    materialTitle: "Cara Membuat Kompos Organik",
    date: "23 Okt 2026",
    recommendationType: "Berdasarkan Minat",
    reason: "Sesuai dengan minatmu pada Pertanian berkelanjutan.",
    interactionStatus: "Selesai",
    feedback: "Relevan",
  },
  {
    id: "hist-5",
    materialId: "rec-7",
    materialTitle: "Teknik Konservasi & Restorasi Ekosistem Lanjutan",
    date: "22 Okt 2026",
    recommendationType: "Materi Lanjutan",
    reason: "Materi lanjutan setelah kamu menyelesaikan modul ekologi dasar.",
    interactionStatus: "Belum Dibuka",
  },
];
