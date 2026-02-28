"use client";

import {
  ApiErrorResponse,
  BookAppointmentResponse,
  ClinicService,
  GetServicesResponse,
  ServiceCategory,
} from "@/types/api";
import { FormEvent, useEffect, useMemo, useState } from "react";

type CategoryFilter = "all" | ServiceCategory;

const categoryOptions: { label: string; value: CategoryFilter }[] = [
  { label: "All", value: "all" },
  { label: "Checkup", value: "checkup" },
  { label: "Vaccination", value: "vaccination" },
  { label: "Surgery", value: "surgery" },
];

interface BookingFormState {
  petName: string;
  ownerName: string;
  ownerPhone: string;
  slot: string;
}

interface SchedulingDashboardProps {
  clinicId: string;
}

const blankBookingForm: BookingFormState = {
  petName: "",
  ownerName: "",
  ownerPhone: "",
  slot: "",
};

function parseApiError(payload: unknown, fallback: string): string {
  if (
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof (payload as ApiErrorResponse).message === "string"
  ) {
    return (payload as ApiErrorResponse).message;
  }

  return fallback;
}

export function SchedulingDashboard({ clinicId }: SchedulingDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [serviceSearch, setServiceSearch] = useState("");
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [clinicName, setClinicName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [serviceList, setServiceList] = useState<ClinicService[]>([]);

  const [bookingServiceId, setBookingServiceId] = useState<string | null>(null);
  const [bookingForm, setBookingForm] = useState<BookingFormState>({
    ...blankBookingForm,
  });
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingNotice, setBookingNotice] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchServices() {
      setIsLoadingServices(true);
      setServicesError(null);

      try {
        const query = new URLSearchParams({ clinicId });
        if (selectedCategory !== "all") {
          query.set("category", selectedCategory);
        }

        const response = await fetch(`/api/services?${query.toString()}`, {
          signal: controller.signal,
        });
        const payload = (await response.json()) as unknown;

        if (!response.ok) {
          throw new Error(parseApiError(payload, "Unable to load services"));
        }

        const servicesData = payload as GetServicesResponse;
        setClinicName(servicesData.clinicName);
        setCurrency(servicesData.currency);
        setServiceList(servicesData.services);
      } catch (fetchError) {
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          return;
        }

        setServicesError(
          fetchError instanceof Error ? fetchError.message : "Unable to load services",
        );
      } finally {
        setIsLoadingServices(false);
      }
    }

    void fetchServices();

    return () => controller.abort();
  }, [clinicId, selectedCategory]);

  const displayedServices = useMemo(() => {
    const query = serviceSearch.trim().toLowerCase();
    if (!query) {
      return serviceList;
    }

    return serviceList.filter((service) => service.name.toLowerCase().includes(query));
  }, [serviceList, serviceSearch]);

  function openBooking(service: ClinicService) {
    setBookingServiceId(service.id);
    setBookingError(null);
    setBookingNotice(null);
    setBookingForm({
      ...blankBookingForm,
      slot: service.slots[0] ?? "",
    });
  }

  function closeBooking() {
    setBookingServiceId(null);
    setBookingForm({ ...blankBookingForm });
  }

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!bookingServiceId) {
      return;
    }

    setIsBooking(true);
    setBookingError(null);
    setBookingNotice(null);

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicId,
          serviceId: bookingServiceId,
          ...bookingForm,
        }),
      });

      const payload = (await response.json()) as unknown;
      if (!response.ok) {
        throw new Error(parseApiError(payload, "Booking request failed"));
      }

      const bookingResult = payload as BookAppointmentResponse;
      setBookingNotice(`Booked successfully. Appointment ID: ${bookingResult.appointmentId}`);

      setServiceList((current) =>
        current.map((service) => {
          if (service.id !== bookingServiceId) {
            return service;
          }

          const remainingSlots = service.slots.filter((slot) => slot !== bookingForm.slot);
          return {
            ...service,
            slots: remainingSlots,
            available: remainingSlots.length > 0,
          };
        }),
      );

      closeBooking();
    } catch (submitError) {
      setBookingError(
        submitError instanceof Error ? submitError.message : "Booking request failed",
      );
    } finally {
      setIsBooking(false);
    }
  }

  function formatPrice(amount: number) {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">Reception Desk</h1>
        <p className="text-sm text-zinc-600">
          Clinic: <span className="font-medium text-white-100">{clinicName || clinicId}</span>
        </p>
        <p className="text-sm text-zinc-600">
          Currency: <span className="font-medium text-white-100">{currency}</span>
        </p>
      </header>

      <section className="mb-8 grid gap-4 rounded-lg border border-zinc-200 p-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Category</span>
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value as CategoryFilter)}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900"
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-white text-zinc-900">
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Find a service</span>
          <input
            type="text"
            value={serviceSearch}
            onChange={(event) => setServiceSearch(event.target.value)}
            placeholder="Type a service name"
            className="rounded-md border border-zinc-300 px-3 py-2"
          />
        </label>
      </section>

      {bookingNotice ? (
        <p className="mb-6 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {bookingNotice}
        </p>
      ) : null}
      {bookingError ? (
        <p className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {bookingError}
        </p>
      ) : null}

      {isLoadingServices ? <p>Loading services...</p> : null}

      {!isLoadingServices && servicesError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {servicesError}
        </p>
      ) : null}

      {!isLoadingServices && !servicesError && displayedServices.length === 0 ? (
        <p className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
          No matching services right now.
        </p>
      ) : null}

      {!isLoadingServices && !servicesError && displayedServices.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2">
          {displayedServices.map((service) => {
            const isBookingOpen = bookingServiceId === service.id;

            return (
              <article key={service.id} className="rounded-lg border border-zinc-200 p-4">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">{service.name}</h2>
                    <p className="text-sm text-zinc-600 capitalize">{service.category}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      service.available
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-zinc-200 text-zinc-700"
                    }`}
                  >
                    {service.available ? "Available" : "Unavailable"}
                  </span>
                </div>

                <p className="text-sm">
                  Price: <span className="font-medium">{formatPrice(service.basePrice)}</span>
                </p>
                <p className="text-sm">
                  Duration: <span className="font-medium">{service.duration} mins</span>
                </p>

                <div className="mt-3">
                  <p className="mb-2 text-sm font-medium">Time Slots</p>
                  <div className="flex flex-wrap gap-2">
                    {service.slots.length > 0 ? (
                      service.slots.map((slot) => (
                        <span
                          key={slot}
                          className="rounded-full border border-zinc-300 px-2.5 py-1 text-xs"
                        >
                          {slot}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-zinc-500">No open slots</span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!service.available || service.slots.length === 0}
                  onClick={() => openBooking(service)}
                  className="mt-4 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-300"
                >
                  Book Now
                </button>

                {isBookingOpen ? (
                  <form onSubmit={submitBooking} className="mt-4 space-y-3 border-t border-zinc-200 pt-4">
                    <input
                      required
                      type="text"
                      placeholder="Pet name"
                      value={bookingForm.petName}
                      onChange={(event) =>
                        setBookingForm((previous) => ({
                          ...previous,
                          petName: event.target.value,
                        }))
                      }
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                    />
                    <input
                      required
                      type="text"
                      placeholder="Owner name"
                      value={bookingForm.ownerName}
                      onChange={(event) =>
                        setBookingForm((previous) => ({
                          ...previous,
                          ownerName: event.target.value,
                        }))
                      }
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                    />
                    <input
                      required
                      type="tel"
                      placeholder="Owner phone"
                      value={bookingForm.ownerPhone}
                      onChange={(event) =>
                        setBookingForm((previous) => ({
                          ...previous,
                          ownerPhone: event.target.value,
                        }))
                      }
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                    />

                    <select
                      required
                      value={bookingForm.slot}
                      onChange={(event) =>
                        setBookingForm((previous) => ({
                          ...previous,
                          slot: event.target.value,
                        }))
                      }
                      className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                    >
                      {service.slots.map((slot) => (
                        <option key={slot} value={slot} className="bg-white text-zinc-900">
                          {slot}
                        </option>
                      ))}
                    </select>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isBooking}
                        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-300"
                      >
                        {isBooking ? "Saving..." : "Confirm"}
                      </button>
                      <button
                        type="button"
                        onClick={closeBooking}
                        className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : null}
              </article>
            );
          })}
        </section>
      ) : null}
    </main>
  );
}
