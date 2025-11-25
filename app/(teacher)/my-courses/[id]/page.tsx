import { ClassDetailContainer, PageContainer } from "../../_components";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  return (
    <PageContainer>
      <ClassDetailContainer classId={id} />
    </PageContainer>
  );
}
