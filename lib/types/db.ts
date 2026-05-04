export type ClientStatus = "active" | "inactive" | "lead";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "void";
export type PaymentMethod = "cash" | "check" | "card" | "ach" | "other";
export type InteractionType = "call" | "email" | "delivery" | "quote" | "note" | "meeting";
export type CampaignStatus = "draft" | "sent";

export type Client = {
  id: string;
  created_at: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  city: string | null;
  state: string;
  zip: string | null;
  notes: string | null;
  status: ClientStatus;
  tags: string[];
  last_contact_at: string | null;
  portal_user_id: string | null;
  qb_customer_id: string | null;
};

export type InvoiceItem = {
  id: string;
  invoice_id: string;
  sort_order: number;
  description: string;
  material: string | null;
  quantity: number;
  unit: string;
  unit_price: number;
  total: number;
};

export type Invoice = {
  id: string;
  created_at: string;
  invoice_number: string;
  client_id: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string | null;
  notes: string | null;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  amount_paid: number;
  balance: number;
  public_token: string;
  qb_invoice_id: string | null;
  // joined
  client?: Client;
  items?: InvoiceItem[];
};

export type Payment = {
  id: string;
  created_at: string;
  invoice_id: string;
  amount: number;
  method: PaymentMethod;
  reference_number: string | null;
  notes: string | null;
};

export type Interaction = {
  id: string;
  created_at: string;
  client_id: string;
  type: InteractionType;
  subject: string | null;
  notes: string | null;
  next_followup: string | null;
  client?: Client;
};

export type Campaign = {
  id: string;
  created_at: string;
  name: string;
  type: "email" | "sms";
  subject: string | null;
  body: string | null;
  status: CampaignStatus;
  sent_at: string | null;
  target_tags: string[];
  recipient_count: number;
};
