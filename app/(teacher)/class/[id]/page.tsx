import { ClassDetailContainer, PageContainer } from "../../_components";

export default async function ClassDetailPage({
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
