import { SchedulingDashboard } from "@/components/scheduling-dashboard";

interface HomeProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const clinicIdParam = params.clinicId;
  const clinicId =
    typeof clinicIdParam === "string"
      ? clinicIdParam
      : Array.isArray(clinicIdParam)
        ? clinicIdParam[0]
        : "clinic_abc";

  return <SchedulingDashboard clinicId={clinicId} />;
}
