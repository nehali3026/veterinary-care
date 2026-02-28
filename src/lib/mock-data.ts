import {
  BookAppointmentRequest,
  BookAppointmentResponse,
  ClinicService,
  GetServicesResponse,
  ServiceCategory,
} from "@/types/api";

interface ClinicRecord {
  clinicId: string;
  clinicName: string;
  currency: string;
  services: ClinicService[];
}

const clinics: Record<string, ClinicRecord> = {
  clinic_abc: {
    clinicId: "clinic_abc",
    clinicName: "PawCare Clinic",
    currency: "USD",
    services: [
      {
        id: "svc_1",
        name: "General Checkup",
        basePrice: 500,
        duration: 30,
        category: "checkup",
        available: true,
        slots: ["09:00", "10:30", "14:00", "16:00"],
      },
      {
        id: "svc_2",
        name: "Puppy Vaccination",
        basePrice: 900,
        duration: 20,
        category: "vaccination",
        available: true,
        slots: ["11:00", "12:30", "15:30"],
      },
      {
        id: "svc_3",
        name: "Neutering Surgery",
        basePrice: 3500,
        duration: 90,
        category: "surgery",
        available: false,
        slots: [],
      },
    ],
  },
  clinic_xyz: {
    clinicId: "clinic_xyz",
    clinicName: "Happy Tails Vet",
    currency: "GBP",
    services: [
      {
        id: "svc_10",
        name: "Annual Wellness Exam",
        basePrice: 650,
        duration: 40,
        category: "checkup",
        available: true,
        slots: ["09:30", "13:00", "17:00"],
      },
      {
        id: "svc_11",
        name: "Rabies Vaccination",
        basePrice: 750,
        duration: 20,
        category: "vaccination",
        available: true,
        slots: ["10:00", "11:30", "16:00"],
      },
    ],
  },
};

const validCategories: ServiceCategory[] = ["checkup", "vaccination", "surgery"];

function isServiceCategory(value: string): value is ServiceCategory {
  return validCategories.includes(value as ServiceCategory);
}

export function getClinicServices(
  clinicId: string,
  category?: string,
): GetServicesResponse | null {
  const clinic = clinics[clinicId];
  if (!clinic) {
    return null;
  }

  const normalizedCategory = category && isServiceCategory(category) ? category : undefined;

  const services = normalizedCategory
    ? clinic.services.filter((service) => service.category === normalizedCategory)
    : clinic.services;

  return {
    clinicId: clinic.clinicId,
    clinicName: clinic.clinicName,
    currency: clinic.currency,
    services,
  };
}

export function bookAppointment(
  payload: BookAppointmentRequest,
): { data?: BookAppointmentResponse; error?: string } {
  const clinic = clinics[payload.clinicId];
  if (!clinic) {
    return { error: "Clinic not found" };
  }

  const service = clinic.services.find((item) => item.id === payload.serviceId);
  if (!service) {
    return { error: "Service not found" };
  }

  if (!service.available) {
    return { error: "Service is not currently available" };
  }

  if (!service.slots.includes(payload.slot)) {
    return { error: "Selected slot is no longer available" };
  }

  service.slots = service.slots.filter((slot) => slot !== payload.slot);
  if (service.slots.length === 0) {
    service.available = false;
  }

  return {
    data: {
      appointmentId: `apt_${crypto.randomUUID().slice(0, 8)}`,
      status: "confirmed",
    },
  };
}
