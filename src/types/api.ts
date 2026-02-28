export type ServiceCategory = "checkup" | "vaccination" | "surgery";

export interface ClinicService {
  id: string;
  name: string;
  basePrice: number;
  duration: number;
  category: ServiceCategory;
  available: boolean;
  slots: string[];
}

export interface GetServicesResponse {
  clinicId: string;
  clinicName: string;
  currency: string;
  services: ClinicService[];
}

export interface BookAppointmentRequest {
  clinicId: string;
  serviceId: string;
  petName: string;
  ownerName: string;
  ownerPhone: string;
  slot: string;
}

export interface BookAppointmentResponse {
  appointmentId: string;
  status: "confirmed";
}

export interface ApiErrorResponse {
  message: string;
}
