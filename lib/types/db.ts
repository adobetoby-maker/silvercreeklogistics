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

export type GalleryPhoto = {
  id: string;
  created_at: string;
  title: string | null;
  description: string | null;
  image_url: string;
  category: "job" | "equipment" | "team" | "before_after" | "other" | null;
  tags: string[];
  client_id: string | null;
  project_id: string | null;
  featured: boolean;
  sort_order: number;
};

export type ReferralStatus = "pending" | "contacted" | "converted" | "lost";

export type Referral = {
  id: string;
  created_at: string;
  referrer_client_id: string | null;
  referred_name: string;
  referred_phone: string | null;
  referred_email: string | null;
  status: ReferralStatus;
  reward_amount: number;
  reward_paid: boolean;
  notes: string | null;
  // joined
  referrer?: Client;
};

export type SurveyResult = {
  id: string;
  created_at: string;
  client_id: string | null;
  invoice_id: string | null;
  nps_score: number | null;
  quality_score: number | null;
  timeliness_score: number | null;
  communication_score: number | null;
  comments: string | null;
  would_refer: boolean | null;
  responded_at: string;
  // joined
  client?: Client;
};

export type ProjectStatus = "bid" | "active" | "on_hold" | "complete" | "cancelled";
export type PhaseStatus = "pending" | "active" | "complete";

export type CommercialProject = {
  id: string;
  created_at: string;
  name: string;
  client_id: string | null;
  status: ProjectStatus;
  start_date: string | null;
  end_date: string | null;
  contract_value: number | null;
  notes: string | null;
  address: string | null;
  city: string | null;
  project_manager: string | null;
  // joined
  client?: Client;
  phases?: ProjectPhase[];
};

export type ProjectPhase = {
  id: string;
  created_at: string;
  project_id: string;
  name: string;
  status: PhaseStatus;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  actual_cost: number;
  notes: string | null;
};

export type ProjectDailyLog = {
  id: string;
  created_at: string;
  project_id: string;
  log_date: string;
  employee_id: string | null;
  hours: number | null;
  equipment_used: string | null;
  material_moved: string | null;
  weather: string | null;
  notes: string | null;
};

export type AdminUser = {
  id: string;
  created_at: string;
  email: string;
  name: string;
  role: "owner" | "admin" | "dispatcher" | "viewer";
  active: boolean;
  last_login_at: string | null;
  invite_token: string | null;
};
