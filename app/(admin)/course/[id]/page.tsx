import { ClassDetailContent } from "@/components/class/class-detail-content";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  return (
    <div className="container mx-auto px-4 py-6 md:px-6">
      <ClassDetailContent classId={id} basePath="/course" />
    </div>
  );
}
