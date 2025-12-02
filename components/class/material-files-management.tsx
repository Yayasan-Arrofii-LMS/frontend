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
  sectionId: number;
  materialId: number;
}

export function MaterialFilesManagement({
  sectionId,
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
      const data = await fetchMaterialFiles(sectionId, materialId);
      setFiles(data);
    } catch (error) {
      console.error("Gagal memuat file materi:", error);
      toast.error("Gagal memuat file materi");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionId, materialId]);

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
      await deleteMaterialFile(sectionId, materialId, fileToDelete.id);
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

  const getFileUrl = (path: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    return `${baseUrl}/${path}`;
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
                  <TableHead>File</TableHead>
                  <TableHead>Tanggal Upload</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="font-medium">{file.title}</TableCell>
                    <TableCell>
                      {file.path ? (
                        <a
                          href={getFileUrl(file.path)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-2"
                        >
                          <FileDown className="h-4 w-4" />
                          {file.path.split("/").pop()}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">No file</span>
                      )}
                    </TableCell>
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
        sectionId={sectionId}
        materialId={materialId}
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSuccess={loadFiles}
      />

      <EditMaterialFileModal
        sectionId={sectionId}
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
