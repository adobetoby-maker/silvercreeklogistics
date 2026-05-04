import { requireAdmin } from "@/lib/adminAuth";
import { adminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Phone, Mail, MapPin, FileText, MessageSquare, UserPlus, Edit } from "lucide-react";
import ClientForm from "@/components/admin/ClientForm";
import type { Client, Invoice, Interaction } from "@/lib/types/db";
import InviteButton from "@/components/admin/InviteButton";

type ClientDetail = Client & {
  interactions: Interaction[];
  invoices: Pick<Invoice, "id" | "invoice_number" | "status" | "total" | "balance" | "issue_date" | "due_date">[];
};

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const { data, error } = await adminClient
    .from("clients")
    .select("*, interactions(*), invoices(id, invoice_number, status, total, balance, issue_date, due_date)")
    .eq("id", id)
    .single();

  if (error || !data) notFound();
  const client = data as ClientDetail;

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a2744]">{client.name}</h1>
          {client.company && <p className="text-gray-500">{client.company}</p>}
          <span className={`inline-flex mt-1 px-2 py-0.5 rounded text-xs font-semibold ${
            client.status === "active" ? "bg-green-100 text-green-700" :
            client.status === "lead" ? "bg-yellow-100 text-yellow-700" :
            "bg-gray-100 text-gray-500"
          }`}>{client.status}</span>
        </div>
        <div className="flex gap-2 shrink-0">
          <InviteButton clientId={client.id} hasPortal={!!client.portal_user_id} email={client.email} />
          <Link href={`/admin/invoices/new?client=${client.id}`} className="flex items-center gap-1.5 px-3 py-2 bg-[#e8600a] text-white text-sm font-semibold rounded-lg hover:bg-[#c4500a] transition-colors">
            <FileText size={14} /> Invoice
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact info + edit */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-5 space-y-3 text-sm">
            {client.phone && (
              <a href={`tel:${client.phone}`} className="flex items-center gap-2 text-gray-700 hover:text-[#e8600a]">
                <Phone size={14} className="text-[#e8600a]" /> {client.phone}
              </a>
            )}
            {client.email && (
              <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-gray-700 hover:text-[#e8600a]">
                <Mail size={14} className="text-[#e8600a]" /> {client.email}
              </a>
            )}
            {(client.address || client.city) && (
              <div className="flex items-start gap-2 text-gray-700">
                <MapPin size={14} className="text-[#e8600a] mt-0.5" />
                <span>{[client.address, client.city, client.state].filter(Boolean).join(", ")}</span>
              </div>
            )}
            {client.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {client.tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 bg-[#f5f0eb] rounded text-xs text-gray-600">{t}</span>
                ))}
              </div>
            )}
            {client.notes && <p className="text-gray-500 text-xs pt-1 border-t border-gray-100">{client.notes}</p>}
          </div>

          {/* Edit form */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-bold text-[#1a2744] mb-4 flex items-center gap-2"><Edit size={14} /> Edit Client</h3>
            <ClientForm client={client} />
          </div>
        </div>

        {/* Invoices */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h3 className="font-bold text-[#1a2744] flex items-center gap-2"><FileText size={14} /> Invoices</h3>
              <Link href={`/admin/invoices/new?client=${client.id}`} className="text-xs text-[#e8600a] hover:underline">+ New</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {client.invoices?.length === 0 && (
                <p className="px-5 py-6 text-center text-gray-400 text-sm">No invoices</p>
              )}
              {client.invoices?.map((inv) => (
                <Link key={inv.id} href={`/admin/invoices/${inv.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div>
                    <div className="font-semibold text-sm text-[#1a2744]">{inv.invoice_number}</div>
                    <div className="text-xs text-gray-400">{inv.issue_date}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      inv.status === "paid" ? "bg-green-100 text-green-700" :
                      inv.status === "overdue" ? "bg-red-100 text-red-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>{inv.status}</div>
                    <div className="text-sm font-bold text-[#1a2744] mt-0.5">${inv.total.toFixed(2)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Interactions */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <h3 className="font-bold text-[#1a2744] flex items-center gap-2"><MessageSquare size={14} /> Interactions</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {client.interactions?.length === 0 && (
              <p className="px-5 py-6 text-center text-gray-400 text-sm">No interactions logged</p>
            )}
            {client.interactions?.map((ia) => (
              <div key={ia.id} className="px-5 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[#e8600a]">{ia.type}</span>
                  <span className="text-xs text-gray-400">{new Date(ia.created_at).toLocaleDateString()}</span>
                </div>
                {ia.subject && <div className="text-sm font-semibold text-[#1a2744]">{ia.subject}</div>}
                {ia.notes && <p className="text-xs text-gray-500 mt-0.5">{ia.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
