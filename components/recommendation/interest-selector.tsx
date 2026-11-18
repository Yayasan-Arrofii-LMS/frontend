"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InterestTopic, BackendCategoryItem } from "@/types/recommendation";
import {
  Leaf,
  Sprout,
  Globe2,
  Compass,
  Coins,
  Landmark,
  Check,
  Save,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";

interface InterestSelectorProps {
  selectedInterests: InterestTopic[];
  onSaveInterests: (interests: InterestTopic[]) => void;
  availableCategories?: BackendCategoryItem[];
}

// Metadata deskripsi dan ikon untuk kategori resmi
const CATEGORY_UI_METADATA: Record<
  string,
  { description: string; iconName: string }
> = {
  "Sains Alam": {
    description: "Biologi, fisika terapan, ekologi & keanekaragaman flora-fauna",
    iconName: "Leaf",
  },
  Pertanian: {
    description: "Agronomi organik, permakultur, hidroponik & tanah subur",
    iconName: "Sprout",
  },
  Lingkungan: {
    description: "Konservasi air, pengelolaan sampah, energi bersih & iklim",
    iconName: "Globe2",
  },
  "Teknologi & Lingkungan": {
    description:
      "Konservasi air, energi bersih, daur ulang & teknologi ramah lingkungan",
    iconName: "Globe2",
  },
  "Keterampilan Hidup": {
    description: "Survival alam terbuka, kerajinan alam, PPPK & navigasi",
    iconName: "Compass",
  },
  Kewirausahaan: {
    description:
      "Agroekonomi, pemasaran hasil panen & produk ramah lingkungan",
    iconName: "Coins",
  },
  Budaya: {
    description: "Kearifan lokal nusantara, tradisi lisan & pelestarian adat",
    iconName: "Landmark",
  },
};

export function InterestSelector({
  selectedInterests,
  onSaveInterests,
  availableCategories = [],
}: InterestSelectorProps) {
  const [localInterests, setLocalInterests] =
    useState<InterestTopic[]>(selectedInterests);
  const [hasChanges, setHasChanges] = useState(false);

  // Sinkronkan localInterests jika data dari server tiba dan user belum melakukan perubahan lokal
  useEffect(() => {
    if (!hasChanges) {
      setLocalInterests(selectedInterests);
    }
  }, [selectedInterests, hasChanges]);

  // Bangun daftar opsi minat dari kategori backend
  const displayAvailableInterests =
    availableCategories.length > 0
      ? availableCategories.map((cat) => {
          const meta = CATEGORY_UI_METADATA[cat.name] || {
            description: `Eksplorasi modul dan materi pembelajaran topik ${cat.name}`,
            iconName: "Sparkles",
          };
          return {
            topic: cat.name as InterestTopic,
            description: meta.description,
            iconName: meta.iconName,
          };
        })
      : Object.entries(CATEGORY_UI_METADATA).map(([topic, meta]) => ({
          topic: topic as InterestTopic,
          description: meta.description,
          iconName: meta.iconName,
        }));

  const getInterestIcon = (iconName: string) => {
    switch (iconName) {
      case "Leaf":
        return <Leaf className="h-4 w-4" />;
      case "Sprout":
        return <Sprout className="h-4 w-4" />;
      case "Globe2":
        return <Globe2 className="h-4 w-4" />;
      case "Compass":
        return <Compass className="h-4 w-4" />;
      case "Coins":
        return <Coins className="h-4 w-4" />;
      case "Landmark":
        return <Landmark className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const handleToggle = (topic: InterestTopic) => {
    setLocalInterests((prev) => {
      let updated: InterestTopic[];
      if (prev.includes(topic)) {
        updated = prev.filter((t) => t !== topic);
      } else {
        updated = [...prev, topic];
      }
      setHasChanges(true);
      return updated;
    });
  };

  const handleSave = () => {
    onSaveInterests(localInterests);
    setHasChanges(false);
  };

  const handleSelectAll = () => {
    const all = displayAvailableInterests.map((i) => i.topic);
    setLocalInterests(all);
    setHasChanges(true);
  };

  const handleClearAll = () => {
    setLocalInterests([]);
    setHasChanges(true);
  };

  return (
    <Card id="minat-belajar-section" className="mb-10 border-border/80 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-5 sm:p-6 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-sm">
                <SlidersHorizontal className="h-4 w-4" />
              </span>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Minat Belajarmu
              </h2>
              <Badge
                variant="secondary"
                className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 ml-1 text-xs font-semibold"
              >
                {localInterests.length} Dipilih
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Pilih topik yang kamu sukai agar kami dapat membantu menemukan materi yang relevan.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {localInterests.length < displayAvailableInterests.length ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs h-8 text-muted-foreground hover:text-foreground"
                onClick={handleSelectAll}
              >
                Pilih Semua
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs h-8 text-muted-foreground hover:text-foreground"
                onClick={handleClearAll}
              >
                Reset
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              className={`h-8 gap-1.5 transition-all text-xs ${
                hasChanges
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md animate-pulse"
                  : "bg-emerald-600/90 hover:bg-emerald-700 text-white"
              }`}
              onClick={handleSave}
            >
              <Save className="h-3.5 w-3.5" />
              Simpan Minat
            </Button>
          </div>
        </div>
      </div>

      <CardContent className="p-5 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {displayAvailableInterests.map(({ topic, description, iconName }) => {
            const isSelected = localInterests.includes(topic);

            return (
              <div
                key={topic}
                onClick={() => handleToggle(topic)}
                className={`relative flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 shadow-sm ring-1 ring-emerald-500/30"
                    : "border-border/70 bg-card hover:bg-muted/40 hover:border-muted-foreground/30"
                }`}
              >
                <div
                  className={`p-2 rounded-lg shrink-0 transition-colors ${
                    isSelected
                      ? "bg-emerald-600 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {getInterestIcon(iconName)}
                </div>

                <div className="flex-1 min-w-0 pr-6">
                  <p className="text-sm font-semibold text-foreground leading-snug">
                    {topic}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                    {description}
                  </p>
                </div>

                <div
                  className={`absolute top-3 right-3 h-5 w-5 rounded-md border flex items-center justify-center transition-colors ${
                    isSelected
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "border-border bg-background"
                  }`}
                >
                  {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        {hasChanges && (
          <div className="mt-4 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
            <span>Kamu memiliki perubahan minat yang belum disimpan.</span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 text-xs border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/60"
              onClick={handleSave}
            >
              Simpan Sekarang
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
