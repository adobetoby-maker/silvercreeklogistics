import AdminSidebar from "@/components/admin/AdminSidebar";

// Auth is enforced per-page via requireAdmin() (all 35 authenticated pages call
// it). The gate must NOT live here: this layout also wraps /admin/login, so a
// layout-level requireAdmin() would redirect the login page to itself → loop.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
