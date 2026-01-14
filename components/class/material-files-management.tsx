"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { toast } from "sonner";
import {
  fetchMaterialFiles,
  deleteMaterialFile,
  MaterialFile,
} from "@/lib/api/material-files";
import { AddMaterialFileModal } from "./add-material-file-modal";
import { EditMaterialFileModal } from "./edit-material-file-modal";
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  FileDown,
  Loader2,
} from "lucide-react";

interface MaterialFilesManagementProps {
  materialId: number;
}

export function MaterialFilesManagement({
  materialId,
}: MaterialFilesManagementProps) {
  const [files, setFiles] = useState<MaterialFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<MaterialFile | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<MaterialFile | null>(null);

  const loadFiles = async () => {
    try {
      setIsLoading(true);
      console.log('[MaterialFilesManagement] Loading files for materialId:', materialId);
      const data = await fetchMaterialFiles(materialId);
      console.log('[MaterialFilesManagement] Loaded files count:', data.length);
      console.log('[MaterialFilesManagement] Files data:', data);
      // API endpoint already filters by materialId, so we can use data directly
      setFiles(data);
    } catch (error) {
      console.error("Gagal memuat file materi:", error);
      toast.error("Gagal memuat file materi");
      setFiles([]); // Clear files on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Reset files when materialId changes
    setFiles([]);
    setIsLoading(true);
    loadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materialId]);

  const handleEdit = (file: MaterialFile) => {
    setSelectedFile(file);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (file: MaterialFile) => {
    setFileToDelete(file);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;

    try {
      await deleteMaterialFile(materialId, fileToDelete.id);
      toast.success("File berhasil dihapus");
      loadFiles();
    } catch (error) {
      console.error("Gagal menghapus file:", error);
      toast.error("Gagal menghapus file");
    } finally {
      setDeleteDialogOpen(false);
      setFileToDelete(null);
    }
  };

  const handleDownloadFile = async (file: MaterialFile) => {
    try {
      const token = localStorage.getItem("auth_token");
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1";

      // Use API endpoint to get file with authentication
      const fileUrl = `${baseUrl}/classes/sections/materials/files/${file.id}/download`;

      const response = await fetch(fileUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.title || "download";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Gagal mengunduh file");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>File Materi</CardTitle>
          <Button onClick={() => setAddModalOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Tambah File
          </Button>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileDown className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Belum ada file</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul</TableHead>
                  <TableHead>Tanggal Upload</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="font-medium">{file.title}</TableCell>
                    <TableCell>
                      {new Date(file.createdAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(file)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(file)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AddMaterialFileModal
        materialId={materialId}
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSuccess={loadFiles}
      />

      <EditMaterialFileModal
        materialId={materialId}
        file={selectedFile}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSuccess={loadFiles}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus File</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus file{" "}
              <span className="font-semibold">{fileToDelete?.title}</span>?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
