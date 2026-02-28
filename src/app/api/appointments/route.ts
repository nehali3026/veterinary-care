import { bookAppointment } from "@/lib/mock-data";
import { ApiErrorResponse, BookAppointmentRequest } from "@/types/api";
import { NextRequest, NextResponse } from "next/server";

function apiError(message: string, status: number) {
  const body: ApiErrorResponse = { message };
  return NextResponse.json(body, { status });
}

function toSafeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: NextRequest) {
  let rawPayload: unknown;

  try {
    rawPayload = (await request.json()) as unknown;
  } catch {
    return apiError("Invalid JSON body", 400);
  }

  if (!rawPayload || typeof rawPayload !== "object") {
    return apiError("Invalid appointment payload", 400);
  }

  const payload: BookAppointmentRequest = {
    clinicId: toSafeString((rawPayload as Partial<BookAppointmentRequest>).clinicId),
    serviceId: toSafeString((rawPayload as Partial<BookAppointmentRequest>).serviceId),
    petName: toSafeString((rawPayload as Partial<BookAppointmentRequest>).petName),
    ownerName: toSafeString((rawPayload as Partial<BookAppointmentRequest>).ownerName),
    ownerPhone: toSafeString((rawPayload as Partial<BookAppointmentRequest>).ownerPhone),
    slot: toSafeString((rawPayload as Partial<BookAppointmentRequest>).slot),
  };

  if (
    !payload.clinicId ||
    !payload.serviceId ||
    !payload.petName ||
    !payload.ownerName ||
    !payload.ownerPhone ||
    !payload.slot
  ) {
    return apiError("Missing required appointment fields", 400);
  }

  const result = bookAppointment(payload);
  if (result.error) {
    return apiError(result.error, 400);
  }

  return NextResponse.json(result.data, { status: 201 });
}
