"use client";

import React, { useState } from "react";
import { Teacher } from "@/types/teacher";
import { TeacherTable } from "@/components/teacher-table";
import { TeacherDetailModal } from "@/components/teacher-detail-modal";
import { AddTeacherModal } from "@/components/add-teacher-modal";

// Data dummy untuk testing
const initialTeachers: Teacher[] = [
  {
    id: "1",
    profilePhoto:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    fullName: "Ahmad Wijaya",
    username: "ahmad.wijaya",
    email: "ahmad.wijaya@sekolahalam.com",
    phoneNumber: "081234567890",
    address: "Jl. Merdeka No. 123, Jakarta Selatan",
    dateOfBirth: "1985-03-15",
    subjects: ["Matematika", "Fisika"],
    joinDate: "2020-08-01",
    status: "active",
  },
  {
    id: "2",
    profilePhoto:
      "https://images.unsplash.com/photo-1494790108755-2616b612b601?w=150&h=150&fit=crop&crop=face",
    fullName: "Siti Nurhaliza",
    username: "siti.nurhaliza",
    email: "siti.nurhaliza@sekolahalam.com",
    phoneNumber: "081234567891",
    address: "Jl. Sudirman No. 456, Jakarta Pusat",
    dateOfBirth: "1987-07-22",
    subjects: ["Bahasa Indonesia", "Bahasa Inggris"],
    joinDate: "2019-01-15",
    status: "active",
  },
  {
    id: "3",
    profilePhoto:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    fullName: "Budi Santoso",
    username: "budi.santoso",
    email: "budi.santoso@sekolahalam.com",
    phoneNumber: "081234567892",
    address: "Jl. Gatot Subroto No. 789, Jakarta Barat",
    dateOfBirth: "1982-11-08",
    subjects: ["Kimia", "Biologi", "IPA"],
    joinDate: "2021-03-10",
    status: "active",
  },
  {
    id: "4",
    profilePhoto:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    fullName: "Dewi Sartika",
    username: "dewi.sartika",
    email: "dewi.sartika@sekolahalam.com",
    phoneNumber: "081234567893",
    address: "Jl. Thamrin No. 321, Jakarta Utara",
    dateOfBirth: "1990-05-12",
    subjects: ["Sejarah", "Geografi", "PKN"],
    joinDate: "2022-07-20",
    status: "active",
  },
  {
    id: "5",
    profilePhoto:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    fullName: "Reza Pratama",
    username: "reza.pratama",
    email: "reza.pratama@sekolahalam.com",
    phoneNumber: "081234567894",
    address: "Jl. Kuningan No. 654, Jakarta Selatan",
    dateOfBirth: "1988-09-03",
    subjects: ["Olahraga", "Kesehatan"],
    joinDate: "2020-12-05",
    status: "active",
  },
  {
    id: "6",
    profilePhoto:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    fullName: "Maya Indira",
    username: "maya.indira",
    email: "maya.indira@sekolahalam.com",
    phoneNumber: "081234567895",
    address: "Jl. Senayan No. 987, Jakarta Pusat",
    dateOfBirth: "1986-12-18",
    subjects: ["Seni Budaya", "Prakarya"],
    joinDate: "2019-09-12",
    status: "inactive",
  },
  {
    id: "7",
    profilePhoto:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=face",
    fullName: "Agus Setiawan",
    username: "agus.setiawan",
    email: "agus.setiawan@sekolahalam.com",
    phoneNumber: "081234567896",
    address: "Jl. Kemang No. 147, Jakarta Selatan",
    dateOfBirth: "1984-04-25",
    subjects: ["Teknologi Informasi", "Komputer"],
    joinDate: "2021-11-08",
    status: "active",
  },
  {
    id: "8",
    profilePhoto:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
    fullName: "Rina Maharani",
    username: "rina.maharani",
    email: "rina.maharani@sekolahalam.com",
    phoneNumber: "081234567897",
    address: "Jl. Menteng No. 258, Jakarta Pusat",
    dateOfBirth: "1989-01-30",
    subjects: ["Ekonomi", "Akuntansi"],
    joinDate: "2023-02-14",
    status: "active",
  },
];

export default function TeacherPage() {
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleViewDetail = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedTeacher(null);
  };

  const handleUpdateTeacher = (updatedTeacher: Teacher) => {
    setTeachers((prev) =>
      prev.map((teacher) =>
        teacher.id === updatedTeacher.id ? updatedTeacher : teacher
      )
    );
  };

  const handleDeleteTeacher = (teacherId: string) => {
    setTeachers((prev) => prev.filter((teacher) => teacher.id !== teacherId));
  };

  const handleAddTeacher = (newTeacherData: Omit<Teacher, "id">) => {
    const newTeacher: Teacher = {
      ...newTeacherData,
      id: Date.now().toString(), // Simple ID generation for demo
    };
    setTeachers((prev) => [...prev, newTeacher]);
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                Manajemen Guru
              </h1>
              <p className="text-muted-foreground">
                Kelola data guru dan informasi profil mereka
              </p>
            </div>
          </div>

          <div className="px-4 lg:px-6">
            <TeacherTable
              data={teachers}
              onViewDetail={handleViewDetail}
              onAddTeacher={handleOpenAddModal}
            />
          </div>
        </div>
      </div>

      <TeacherDetailModal
        teacher={selectedTeacher}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        onUpdate={handleUpdateTeacher}
        onDelete={handleDeleteTeacher}
      />

      <AddTeacherModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onAdd={handleAddTeacher}
      />
    </div>
  );
}
