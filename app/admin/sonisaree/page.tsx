import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminDashboard from "../../../admin/component/AdminDashboard";

const ADMIN_API_URL = process.env.ADMIN_BACKEND_URL
  || process.env.NEXT_PUBLIC_ADMIN_API_URL
  || "http://localhost:5001";

// This page validates an HttpOnly session cookie and backend session at request time.
export const instant = false;

export const metadata: Metadata = {
  title: "Admin Dashboard | Soni Saree Showroom",
};

export default async function AdminDashboardPage() {
  const sessionToken = (await cookies()).get("adminToken")?.value;
  if (!sessionToken) redirect("/");

  let response: Response;
  try {
    response = await fetch(`${ADMIN_API_URL.replace(/\/$/, "")}/loggedinadmin`, {
      headers: { Authorization: `Bearer ${sessionToken}` },
      cache: "no-store",
    });
  } catch {
    redirect("/");
  }

  if (!response.ok) redirect("/");

  const result = await response.json() as { loggedIn: boolean; admin: { name: string } };
  if (!result.loggedIn || !result.admin?.name) redirect("/");

  return <AdminDashboard adminName={result.admin.name} />;
}
