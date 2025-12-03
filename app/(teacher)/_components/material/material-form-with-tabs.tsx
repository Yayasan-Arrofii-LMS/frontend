"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Minimize2, Upload, X, FileIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MaterialFilesManagement } from "@/components/class/material-files-management";

export interface StagedFile {
  id: string;
  file: File;
  title: string;
}

interface MaterialFormWithTabsProps {
  mode: "add" | "edit";
  title: string;
  content: string;
  xp: string;
  isSubmitting: boolean;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onXpChange: (value: string) => void;
  onSubmit: (e: React.FormEvent, stagedFiles?: StagedFile[]) => void;
  onMinimize: () => void;
  onBack: () => void;
  classId: string;
  sectionId: number;
  materialId?: number;
  defaultTab?: "content" | "files";
  onFilesUpdate?: () => void;
}

export function MaterialFormWithTabs({
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
  classId,
  sectionId,
  materialId,
  defaultTab = "content",
  onFilesUpdate,
}: MaterialFormWithTabsProps) {
  const [activeTab, setActiveTab] = useState<"content" | "files">(defaultTab);
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [fileInputKey, setFileInputKey] = useState(0);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // Auto-switch to files tab when materialId becomes available
  useEffect(() => {
    if (materialId && mode === "edit" && defaultTab === "files") {
      setActiveTab("files");
    }
  }, [materialId, mode, defaultTab]);

  const handleAddStagedFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newStagedFiles: StagedFile[] = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
    }));

    setStagedFiles((prev) => [...prev, ...newStagedFiles]);
    setFileInputKey((prev) => prev + 1); // Reset file input
  };

  const handleRemoveStagedFile = (id: string) => {
    setStagedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleUpdateStagedFileTitle = (id: string, newTitle: string) => {
    setStagedFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, title: newTitle } : f))
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e, mode === "add" ? stagedFiles : undefined);
  };

  const canAccessFilesTab = materialId !== undefined || mode === "add";

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <CardTitle>
                {mode === "add" ? "Tambah Materi Baru" : "Edit Materi"}
              </CardTitle>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onMinimize}>
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
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "content" | "files")
            }
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="content">Konten Materi</TabsTrigger>
              <TabsTrigger value="files">
                File Materi
                {mode === "add" && stagedFiles.length > 0 && (
                  <span className="ml-1.5 text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">
                    {stagedFiles.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-6">
              <form onSubmit={handleFormSubmit} className="space-y-6">
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
                    XP yang akan didapatkan siswa setelah menyelesaikan materi
                    ini
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
                    {isSubmitting
                      ? "Menyimpan..."
                      : mode === "add"
                      ? "Tambah Materi"
                      : "Simpan Perubahan"}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="files" className="space-y-4">
              {materialId ? (
                <MaterialFilesManagement
                  classId={classId}
                  sectionId={sectionId}
                  materialId={materialId}
                  onUpdate={onFilesUpdate}
                />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>File Materi</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        document.getElementById("staged-file-input")?.click()
                      }
                      disabled={isSubmitting}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Pilih File
                    </Button>
                    <input
                      key={fileInputKey}
                      id="staged-file-input"
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleAddStagedFile}
                      disabled={isSubmitting}
                    />
                  </div>

                  {stagedFiles.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                      <FileIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Belum ada file yang ditambahkan
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        File akan diupload setelah materi dibuat
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {stagedFiles.map((stagedFile) => (
                        <Card key={stagedFile.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <FileIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                              <div className="flex-1 space-y-2">
                                <Input
                                  value={stagedFile.title}
                                  onChange={(e) =>
                                    handleUpdateStagedFileTitle(
                                      stagedFile.id,
                                      e.target.value
                                    )
                                  }
                                  placeholder="Judul file"
                                  disabled={isSubmitting}
                                />
                                <p className="text-xs text-muted-foreground">
                                  {stagedFile.file.name} (
                                  {(stagedFile.file.size / 1024 / 1024).toFixed(
                                    2
                                  )}{" "}
                                  MB)
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleRemoveStagedFile(stagedFile.id)
                                }
                                disabled={isSubmitting}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {stagedFiles.length > 0 && (
                    <p className="text-xs text-muted-foreground text-center">
                      {stagedFiles.length} file akan diupload setelah materi
                      disimpan
                    </p>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
