import { requireAdmin } from "@/lib/adminAuth";
import ClientForm from "@/components/admin/ClientForm";

export default async function NewClientPage() {
  await requireAdmin();
  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-extrabold text-[#1a2744] mb-6">New Client</h1>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <ClientForm />
      </div>
    </div>
  );
}
