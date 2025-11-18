import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Minimize2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MaterialFormProps {
  mode: "add" | "edit";
  title: string;
  content: string;
  xp: string;
  isSubmitting: boolean;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onXpChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onMinimize: () => void;
  onBack: () => void;
}

export function MaterialForm({
  mode,
  title,
  content,
  xp,
  isSubmitting,
  onTitleChange,
  onContentChange,
  onXpChange,
  onSubmit,
  onMinimize,
  onBack,
}: MaterialFormProps) {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <CardTitle>
                {mode === "add" ? "Tambah Materi Baru" : "Edit Materi"}
              </CardTitle>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onMinimize}
                  >
                    <Minimize2 className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Minimize to modal</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">
                Judul Materi <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Masukkan judul materi"
                disabled={isSubmitting}
                maxLength={255}
              />
              <p className="text-xs text-muted-foreground">
                {title.length}/255 karakter
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">
                Konten Materi <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => onContentChange(e.target.value)}
                placeholder="Masukkan konten materi"
                disabled={isSubmitting}
                rows={12}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="xp">XP (Opsional)</Label>
              <Input
                id="xp"
                type="number"
                value={xp}
                onChange={(e) => onXpChange(e.target.value)}
                placeholder="Masukkan XP"
                disabled={isSubmitting}
                min="0"
              />
              <p className="text-xs text-muted-foreground">
                XP yang akan didapatkan siswa setelah menyelesaikan materi ini
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : mode === "add" ? "Tambah Materi" : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
