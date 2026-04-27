"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8080";
const COOKIE_NAME = "admin_session";

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/admin/login");
}

export async function updateStatusAction(formData: FormData) {
  const id     = String(formData.get("id"));
  const status = String(formData.get("status"));

  const cookieStore = await cookies();
  const adminId = cookieStore.get(COOKIE_NAME);
  if (!adminId) {
    redirect("/admin/login");
  }

  const res = await fetch(`${BACKEND}/api/v1/admin/bookings/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie:         `${COOKIE_NAME}=${adminId.value}`,
    },
    body: JSON.stringify({ status }),
    cache: "no-store",
  });

  if (res.status === 401) {
    cookieStore.delete(COOKIE_NAME);
    redirect("/admin/login");
  }

  revalidatePath("/admin");
}

export async function refreshAction() {
  revalidatePath("/admin");
  redirect("/admin");
}

export interface Booking {
  ID:               number;
  FullName:         string;
  PhoneNumber:      string;
  TelegramUsername: string;
  DesiredDate:      string;
  DesiredTime:      string;
  RequestDetails:   string;
  Comment:          string;
  Status:           string;
  CreatedAt:        string;
}

export async function getBookings(): Promise<Booking[] | "unauthorized" | "error"> {
  const cookieStore = await cookies();
  const adminId = cookieStore.get(COOKIE_NAME);
  if (!adminId) return "unauthorized";

  try {
    const res = await fetch(`${BACKEND}/api/v1/admin/bookings`, {
      headers: { Cookie: `${COOKIE_NAME}=${adminId.value}` },
      cache:   "no-store",
    });
    if (res.status === 401) return "unauthorized";
    if (!res.ok)            return "error";
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return "error";
  }
}
