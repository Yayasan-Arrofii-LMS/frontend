import { Teacher } from "@/types/teacher";
import { TeacherDetailModal } from "@/components/teacher-detail-modal";
import { AddTeacherModal } from "@/components/add-teacher-modal";

interface TeacherModalsProps {
  selectedTeacher: Teacher | null;
  isDetailModalOpen: boolean;
  isAddModalOpen: boolean;
  onCloseDetailModal: () => void;
  onCloseAddModal: () => void;
  onUpdateTeacher: () => Promise<void>;
  onDeleteTeacher: () => Promise<void>;
  onAddTeacher: () => Promise<void>;
}

export function TeacherModals({
  selectedTeacher,
  isDetailModalOpen,
  isAddModalOpen,
  onCloseDetailModal,
  onCloseAddModal,
  onUpdateTeacher,
  onDeleteTeacher,
  onAddTeacher,
}: TeacherModalsProps) {
  return (
    <>
      <TeacherDetailModal
        teacher={selectedTeacher}
        isOpen={isDetailModalOpen}
        onClose={onCloseDetailModal}
        onUpdate={onUpdateTeacher}
        onDelete={onDeleteTeacher}
      />

      <AddTeacherModal
        isOpen={isAddModalOpen}
        onClose={onCloseAddModal}
        onAdd={onAddTeacher}
      />
    </>
  );
}
