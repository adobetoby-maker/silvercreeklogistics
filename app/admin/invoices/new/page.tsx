import { requireAdmin } from "@/lib/adminAuth";
import { adminClient } from "@/lib/supabase/admin";
import InvoiceForm from "@/components/admin/InvoiceForm";
import type { Client } from "@/lib/types/db";

export default async function NewInvoicePage({ searchParams }: { searchParams: Promise<{ client?: string }> }) {
  await requireAdmin();
  const { client: defaultClientId } = await searchParams;
  const { data: clients } = await adminClient.from("clients").select("*").order("name");
  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-extrabold text-[#1a2744] mb-6">New Invoice</h1>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <InvoiceForm clients={(clients ?? []) as Client[]} defaultClientId={defaultClientId} />
      </div>
    </div>
  );
}
