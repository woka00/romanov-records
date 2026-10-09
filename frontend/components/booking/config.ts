export const TEAL = "#1db8a6";

export const SERVICES = [
  { id: "instruments", label: "Запись инструментов", hasHours: true },
  { id: "vocal", label: "Запись вокала", hasHours: true },
  { id: "mixing", label: "Сведение", hasHours: false },
  { id: "rental", label: "Аренда Студии", hasHours: true },
  { id: "turnkey", label: "Трек под ключ", hasHours: false },
] as const;

export type ServiceID = (typeof SERVICES)[number]["id"];
export type ServiceSelection = Record<ServiceID, { checked: boolean; hours: string }>;

export const createEmptyServices = (): ServiceSelection =>
  Object.fromEntries(
    SERVICES.map((service) => [service.id, { checked: false, hours: "1" }]),
  ) as ServiceSelection;

export const TIME_SLOTS = Array.from({ length: 48 }, (_, index) => {
  const hour = Math.floor(index / 2);
  const minute = index % 2 === 0 ? "00" : "30";
  return `${String(hour).padStart(2, "0")}:${minute}`;
});

export function isNightSlot(slot: string) {
  const hour = Number.parseInt(slot.split(":")[0], 10);
  return hour >= 22 || hour <= 9;
}

export function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSlotDisabled(slot: string, selectedDate: Date | null, busyTimes: string[]) {
  if (busyTimes.includes(slot)) return true;
  if (!selectedDate) return false;

  const now = new Date();
  if (!sameDay(selectedDate, now)) return false;

  const [hour, minute] = slot.split(":").map(Number);
  const minimumStart = now.getTime() + 60 * 60 * 1000;
  const slotStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hour,
    minute,
  ).getTime();
  return slotStart < minimumStart;
}

export function localDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
