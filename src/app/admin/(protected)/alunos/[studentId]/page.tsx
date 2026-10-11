import { StudentProfile } from "@/components/admin/StudentProfile";

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  return <StudentProfile studentId={studentId} />;
}
