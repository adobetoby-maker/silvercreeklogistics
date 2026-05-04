import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminClient } from "@/lib/supabase/admin";

async function isAdmin() {
  const c = await cookies();
  return c.get("scl_admin_session")?.value === process.env.ADMIN_SECRET;
}

async function qbFetch(path: string, method = "GET", body?: object) {
  const cookieStore = await cookies();
  const token = cookieStore.get("qb_access_token")?.value;
  const realmId = cookieStore.get("qb_realm_id")?.value;
  const env = process.env.QB_ENVIRONMENT === "production" ? "" : "sandbox-";

  const res = await fetch(
    `https://${env}quickbooks.api.intuit.com/v3/company/${realmId}${path}`,
    {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    }
  );
  return res.json();
}

export async function POST(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { type, id } = await req.json();

  if (type === "customer") {
    const { data: client } = await adminClient.from("clients").select("*").eq("id", id).single();
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const qbCustomer = {
      DisplayName: client.name,
      PrimaryPhone: client.phone ? { FreeFormNumber: client.phone } : undefined,
      PrimaryEmailAddr: client.email ? { Address: client.email } : undefined,
      BillAddr: client.address
        ? { Line1: client.address, City: client.city ?? "", CountrySubDivisionCode: client.state, PostalCode: client.zip ?? "" }
        : undefined,
    };

    const result = await qbFetch("/customer", "POST", { Customer: qbCustomer });
    const qbId = result?.Customer?.Id;
    if (qbId) {
      await adminClient.from("clients").update({ qb_customer_id: qbId }).eq("id", id);
    }
    return NextResponse.json({ success: true, qb_customer_id: qbId });
  }

  if (type === "invoice") {
    const { data: inv } = await adminClient
      .from("invoices")
      .select("*, client:clients(*), items:invoice_items(*)")
      .eq("id", id)
      .single();
    if (!inv) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    const qbInvoice = {
      CustomerRef: { value: inv.client?.qb_customer_id },
      TxnDate: inv.issue_date,
      DueDate: inv.due_date,
      Line: inv.items?.map((item: { description: string; quantity: number; unit_price: number; total: number }) => ({
        DetailType: "SalesItemLineDetail",
        Amount: item.total,
        Description: item.description,
        SalesItemLineDetail: {
          Qty: item.quantity,
          UnitPrice: item.unit_price,
        },
      })),
      CustomerMemo: inv.notes ? { value: inv.notes } : undefined,
    };

    const result = await qbFetch("/invoice", "POST", { Invoice: qbInvoice });
    const qbId = result?.Invoice?.Id;
    if (qbId) {
      await adminClient.from("invoices").update({ qb_invoice_id: qbId }).eq("id", id);
    }
    return NextResponse.json({ success: true, qb_invoice_id: qbId });
  }

  return NextResponse.json({ error: "Unknown sync type" }, { status: 400 });
}
