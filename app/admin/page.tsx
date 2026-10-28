import type { Metadata } from "next";
import AdminLogin from "../../admin/component/AdminLogin";

export const metadata: Metadata = {
  title: "Admin Sign In | SareeAura",
};

export default function AdminPage() {
  return <AdminLogin />;
}
