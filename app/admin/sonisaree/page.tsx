import type { Metadata } from "next";
import AdminDashboard from "../../../admin/component/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard | Soni Saree Showroom",
};

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}
