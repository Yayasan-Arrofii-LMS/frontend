import { ClassManagementContent } from "@/components/class/class-management-content";

export default function CoursePage() {
  return (
    <div className="container mx-auto px-4 py-6 md:px-6">
      <ClassManagementContent basePath="/course" />
    </div>
  );
}