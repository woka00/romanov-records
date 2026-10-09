"use client";

import { useCallback, useEffect, useState } from "react";
import { createBooking, fetchBusyTimes } from "./api";
import {
  createEmptyServices,
  localDateString,
  SERVICES,
  type ServiceID,
  type ServiceSelection,
} from "./config";

export function useBookingForm(isOpen: boolean, onClose: () => void) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [telegram, setTelegram] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [services, setServices] = useState<ServiceSelection>(createEmptyServices);
  const [comment, setComment] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [busyTimes, setBusyTimes] = useState<string[]>([]);
  const [availabilityError, setAvailabilityError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);

  const chosenServiceIDs = SERVICES.filter((service) => services[service.id].checked)
    .map((service) => service.id);
  const onlyMixingSelected = chosenServiceIDs.length === 1 && chosenServiceIDs[0] === "mixing";

  const reset = useCallback(() => {
    setName("");
    setPhone("");
    setTelegram("");
    setSelectedDate(null);
    setSelectedTime("");
    setServices(createEmptyServices());
    setComment("");
    setCalendarOpen(false);
    setTimeOpen(false);
    setBusyTimes([]);
    setAvailabilityError("");
    setSubmitError("");
    setSuccess(false);
  }, []);

  const close = useCallback(() => {
    onClose();
    reset();
  }, [onClose, reset]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const selectDate = async (date: Date) => {
    setSelectedDate(date);
    setSelectedTime("");
    setCalendarOpen(false);
    setBusyTimes([]);
    setAvailabilityError("");
    try {
      setBusyTimes(await fetchBusyTimes(localDateString(date)));
    } catch {
      setAvailabilityError("Не удалось загрузить свободное время. Попробуйте выбрать дату ещё раз.");
    }
  };

  const toggleService = (id: ServiceID) => {
    setServices((current) => ({
      ...current,
      [id]: { ...current[id], checked: !current[id].checked },
    }));
  };

  const setServiceHours = (id: ServiceID, hours: string) => {
    setServices((current) => ({ ...current, [id]: { ...current[id], hours } }));
  };

  const submit = async () => {
    setSubmitError("");
    if (name.trim().length < 3) return setSubmitError("Введите имя (не менее 3 символов)");
    if (!phone.startsWith("+") || phone.replace(/\D/g, "").length < 10) {
      return setSubmitError("Номер телефона должен начинаться с + и содержать не менее 10 цифр");
    }
    if (telegram.trim() && !telegram.trim().startsWith("@")) {
      return setSubmitError("Telegram username должен начинаться с @");
    }

    const chosenServices = SERVICES.filter((service) => services[service.id].checked);
    if (chosenServices.length === 0) return setSubmitError("Выберите хотя бы одну услугу");

    const onlyMixing = chosenServices.length === 1 && chosenServices[0].id === "mixing";
    if (!onlyMixing && !selectedDate) return setSubmitError("Выберите дату записи");
    if (!onlyMixing && !selectedTime) return setSubmitError("Выберите время записи");

    const requestDetails = chosenServices
      .map((service) => service.hasHours
        ? `${service.label} — ${services[service.id].hours} ч.`
        : service.label)
      .join(", ");
    const durationHours = Math.max(
      1,
      ...chosenServices
        .filter((service) => service.hasHours)
        .map((service) => Number.parseInt(services[service.id].hours, 10) || 1),
    );

    setSubmitting(true);
    try {
      await createBooking({
        full_name: name.trim(),
        phone_number: phone,
        telegram_username: telegram,
        desired_date: onlyMixing ? "1970-01-01" : localDateString(selectedDate!),
        desired_time: onlyMixing ? "00:00" : selectedTime,
        duration_hours: durationHours,
        request_details: requestDetails,
        comment,
      });
      setSuccess(true);
    } catch (error) {
      setSubmitError(error instanceof Error
        ? error.message
        : "Не удалось подключиться к серверу. Проверьте соединение.");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    availabilityError,
    busyTimes,
    calendarOpen,
    close,
    comment,
    name,
    onlyMixingSelected,
    phone,
    selectedDate,
    selectedTime,
    selectDate,
    services,
    setCalendarOpen,
    setComment,
    setName,
    setPhone,
    setSelectedTime,
    setServiceHours,
    setTelegram,
    setTimeOpen,
    submit,
    submitError,
    submitting,
    success,
    telegram,
    timeOpen,
    toggleService,
  };
}
