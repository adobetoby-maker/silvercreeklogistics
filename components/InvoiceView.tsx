import { shopInfo } from "@/lib/shopInfo";
import type { Invoice, Client, InvoiceItem, Payment } from "@/lib/types/db";

type Props = {
  invoice: Invoice & { client?: Client; items?: InvoiceItem[]; payments?: Payment[] };
};

const STATUS_COLOR: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-700",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
  void: "bg-gray-100 text-gray-400",
};

export default function InvoiceView({ invoice }: Props) {
  const client = invoice.client;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden print:shadow-none">
      {/* Header */}
      <div className="bg-[#1a2744] text-white p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xl font-extrabold">{shopInfo.name}</div>
            <div className="text-gray-400 text-sm">{shopInfo.address}</div>
            <div className="text-gray-400 text-sm">{shopInfo.phone}</div>
            <div className="text-gray-400 text-sm">{shopInfo.email}</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-extrabold text-[#e8600a]">INVOICE</div>
            <div className="text-lg font-bold mt-1">{invoice.invoice_number}</div>
            <span className={`inline-flex mt-2 px-2 py-0.5 rounded text-xs font-bold uppercase ${STATUS_COLOR[invoice.status] ?? "bg-gray-100 text-gray-600"}`}>
              {invoice.status}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Bill To</div>
            {client ? (
              <div className="text-[#1a2744]">
                <div className="font-bold">{client.name}</div>
                {client.company && <div>{client.company}</div>}
                {client.email && <div className="text-gray-500">{client.email}</div>}
                {client.phone && <div className="text-gray-500">{client.phone}</div>}
                {client.address && <div className="text-gray-500">{client.address}</div>}
                {client.city && <div className="text-gray-500">{client.city}, {client.state} {client.zip}</div>}
              </div>
            ) : <div className="text-gray-400">—</div>}
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">Issue Date</div>
              <div className="font-semibold text-[#1a2744]">{invoice.issue_date}</div>
            </div>
            {invoice.due_date && (
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">Due Date</div>
                <div className="font-semibold text-[#1a2744]">{invoice.due_date}</div>
              </div>
            )}
          </div>
        </div>

        {/* Line items */}
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2.5 text-left font-semibold text-gray-600">Description</th>
                <th className="px-4 py-2.5 text-right font-semibold text-gray-600 w-20">Qty</th>
                <th className="px-4 py-2.5 text-left font-semibold text-gray-600 w-16 hidden sm:table-cell">Unit</th>
                <th className="px-4 py-2.5 text-right font-semibold text-gray-600 w-24">Price</th>
                <th className="px-4 py-2.5 text-right font-semibold text-gray-600 w-24">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(invoice.items ?? []).map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-[#1a2744]">{item.description}</div>
                    {item.material && <div className="text-xs text-gray-400">{item.material}</div>}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">{item.quantity}</td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{item.unit}</td>
                  <td className="px-4 py-3 text-right text-gray-700">${item.unit_price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-[#1a2744]">${item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-60 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${invoice.subtotal.toFixed(2)}</span></div>
            {invoice.tax_rate > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Tax ({(invoice.tax_rate * 100).toFixed(1)}%)</span>
                <span>${invoice.tax_amount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-[#1a2744] text-lg border-t border-gray-200 pt-2">
              <span>Total</span><span>${invoice.total.toFixed(2)}</span>
            </div>
            {invoice.amount_paid > 0 && (
              <>
                <div className="flex justify-between text-green-600"><span>Amount Paid</span><span>${invoice.amount_paid.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-[#e8600a]"><span>Balance Due</span><span>${invoice.balance.toFixed(2)}</span></div>
              </>
            )}
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="border-t border-gray-100 pt-4">
            <div className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Notes</div>
            <p className="text-gray-600 text-sm">{invoice.notes}</p>
          </div>
        )}

        {/* Payments */}
        {(invoice.payments ?? []).length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <div className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Payment History</div>
            <div className="space-y-1.5">
              {invoice.payments!.map((p) => (
                <div key={p.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{new Date(p.created_at).toLocaleDateString()} · {p.method}{p.reference_number ? ` #${p.reference_number}` : ""}</span>
                  <span className="font-semibold text-green-600">${p.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-100 pt-4 text-center text-xs text-gray-400">
          Thank you for your business · {shopInfo.phone} · {shopInfo.email}
        </div>
      </div>
    </div>
  );
}
