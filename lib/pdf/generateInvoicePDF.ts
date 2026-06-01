/* eslint-disable @typescript-eslint/no-explicit-any */
import { shopInfo } from "@/lib/shopInfo";

export type InvoicePDFData = {
  invoice_number: string;
  issue_date: string;
  due_date?: string | null;
  client: { name: string; email?: string | null; phone?: string | null; address?: string | null; city?: string | null; state?: string };
  items: { description: string; quantity: number; unit: string; unit_price: number; total: number }[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  amount_paid: number;
  balance: number;
  notes?: string | null;
};

export async function generateInvoicePDF(data: InvoicePDFData): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF();
  const primary = [232, 96, 10] as [number, number, number];
  const navy = [26, 39, 68] as [number, number, number];
  const gray = [107, 114, 128] as [number, number, number];

  // Header bar
  doc.setFillColor(...primary);
  doc.rect(0, 0, 210, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(shopInfo.name, 14, 12);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`${shopInfo.phone}  |  ${shopInfo.email}`, 14, 20);
  doc.text(shopInfo.address, 14, 25);

  // INVOICE label
  doc.setTextColor(...navy);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", 140, 42);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...gray);
  doc.text(`#${data.invoice_number}`, 140, 50);
  doc.text(`Date: ${data.issue_date}`, 140, 57);
  if (data.due_date) doc.text(`Due: ${data.due_date}`, 140, 64);

  // Bill To
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...navy);
  doc.text("BILL TO", 14, 42);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(50, 50, 50);
  doc.text(data.client.name, 14, 50);
  if (data.client.address) doc.text(data.client.address, 14, 57);
  if (data.client.city) doc.text(`${data.client.city}, ${data.client.state ?? "ID"}`, 14, 64);
  if (data.client.phone) doc.text(data.client.phone, 14, 71);

  // Line items table
  autoTable(doc, {
    startY: 80,
    head: [["Description", "Qty", "Unit", "Unit Price", "Total"]],
    body: data.items.map((i) => [
      i.description,
      i.quantity,
      i.unit,
      `$${i.unit_price.toFixed(2)}`,
      `$${i.total.toFixed(2)}`,
    ]),
    headStyles: { fillColor: navy, textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [249, 245, 239] },
    columnStyles: {
      0: { cellWidth: 80 },
      3: { halign: "right" },
      4: { halign: "right" },
    },
    theme: "grid",
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // Totals
  const totalsX = 130;
  const totalsVals = [
    ["Subtotal", `$${data.subtotal.toFixed(2)}`],
    ...(data.tax_amount > 0 ? [["Tax", `$${data.tax_amount.toFixed(2)}`]] : []),
    ["Total", `$${data.total.toFixed(2)}`],
    ["Amount Paid", `-$${data.amount_paid.toFixed(2)}`],
  ];

  totalsVals.forEach(([label, val], i) => {
    doc.setFont("helvetica", i === totalsVals.length - 2 ? "bold" : "normal");
    doc.setFontSize(9);
    doc.text(label, totalsX, finalY + i * 7);
    doc.text(val, 196, finalY + i * 7, { align: "right" });
  });

  // Balance due box
  const balY = finalY + totalsVals.length * 7 + 4;
  doc.setFillColor(...primary);
  doc.roundedRect(totalsX, balY, 66, 12, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("BALANCE DUE", totalsX + 4, balY + 5);
  doc.text(`$${data.balance.toFixed(2)}`, 196, balY + 5, { align: "right" });

  // Notes
  if (data.notes) {
    doc.setTextColor(80, 80, 80);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Notes:", 14, balY + 2);
    doc.text(data.notes, 14, balY + 8);
  }

  // Footer
  doc.setFillColor(...navy);
  doc.rect(0, 280, 210, 17, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text("Thank you for your business! — Silver Creek Logistics LLC", 105, 290, { align: "center" });

  return doc.output("blob");
}
