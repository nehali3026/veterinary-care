import { getClinicServices } from "@/lib/mock-data";
import { ApiErrorResponse } from "@/types/api";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clinicId = searchParams.get("clinicId");
  const category = searchParams.get("category") ?? undefined;

  if (!clinicId) {
    const body: ApiErrorResponse = { message: "Missing required query param: clinicId" };
    return NextResponse.json(body, { status: 400 });
  }

  const data = getClinicServices(clinicId, category);
  if (!data) {
    const body: ApiErrorResponse = { message: "Clinic not found" };
    return NextResponse.json(body, { status: 404 });
  }

  return NextResponse.json(data, { status: 200 });
}
