import { ClassDetailContent } from "@/components/class/class-detail-content";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  return <ClassDetailContent classId={id} basePath="/course" />;
}
