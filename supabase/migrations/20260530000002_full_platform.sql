-- Silver Creek Logistics — Full Platform Schema (Phase 2-6)
-- Run after 20260530000001_initial.sql

-- ── CREWS & EMPLOYEES ────────────────────────────────────────
create table if not exists crews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  color text default '#e8600a',
  active boolean default true,
  lead_employee_id uuid
);

create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  first_name text not null,
  last_name text not null,
  email text unique,
  phone text,
  role text default 'driver' check (role in ('driver','dispatcher','admin','mechanic','office')),
  hourly_rate numeric(8,2) default 0,
  crew_id uuid references crews(id) on delete set null,
  hire_date date,
  license_class text,
  license_expiry date,
  cdl boolean default false,
  active boolean default true,
  notes text,
  avatar_url text
);

alter table crews add constraint crews_lead_fk foreign key (lead_employee_id) references employees(id) on delete set null;

-- ── TIME & PAYROLL ───────────────────────────────────────────
create table if not exists time_entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  employee_id uuid references employees(id) on delete cascade not null,
  clock_in timestamptz not null,
  clock_out timestamptz,
  break_minutes int default 0,
  regular_hours numeric(6,2),
  overtime_hours numeric(6,2) default 0,
  job_reference text,
  notes text,
  status text default 'active' check (status in ('active','approved','rejected','edited')),
  approved_by uuid references employees(id),
  approved_at timestamptz,
  gps_clock_in jsonb,
  gps_clock_out jsonb
);

create table if not exists time_off_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  employee_id uuid references employees(id) on delete cascade not null,
  type text not null check (type in ('vacation','sick','personal','unpaid')),
  start_date date not null,
  end_date date not null,
  hours_requested numeric(6,2) not null,
  reason text,
  status text default 'pending' check (status in ('pending','approved','denied')),
  reviewed_by uuid references employees(id),
  reviewed_at timestamptz,
  reviewer_notes text
);

create table if not exists time_off_balances (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id) on delete cascade not null unique,
  vacation_hours numeric(8,2) default 0,
  sick_hours numeric(8,2) default 0,
  personal_hours numeric(8,2) default 0,
  updated_at timestamptz default now()
);

create table if not exists downtime_forms (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  employee_id uuid references employees(id),
  truck_id text,
  reason text not null check (reason in ('weather','breakdown','wait_load','wait_customer','training','other')),
  start_time timestamptz not null,
  end_time timestamptz,
  hours numeric(6,2),
  notes text
);

-- ── EMPLOYEE PERFORMANCE ─────────────────────────────────────
create table if not exists employee_reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  employee_id uuid references employees(id) on delete cascade not null,
  review_period text not null,
  reviewer_id uuid references employees(id),
  attendance_score int check (attendance_score between 1 and 5),
  performance_score int check (performance_score between 1 and 5),
  safety_score int check (safety_score between 1 and 5),
  customer_score int check (customer_score between 1 and 5),
  overall_score numeric(3,1),
  strengths text,
  improvements text,
  goals text,
  notes text
);

create table if not exists employee_skills (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id) on delete cascade not null,
  skill text not null,
  level text check (level in ('learning','proficient','expert')),
  certified boolean default false,
  cert_expiry date
);

-- ── GPS & LOCATIONS ──────────────────────────────────────────
create table if not exists location_logs (
  id uuid primary key default gen_random_uuid(),
  logged_at timestamptz default now(),
  employee_id uuid references employees(id) on delete cascade,
  truck_id text,
  lat numeric(10,7) not null,
  lng numeric(10,7) not null,
  speed_mph int,
  heading int,
  accuracy_meters int,
  address text
);

create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  address text,
  city text,
  lat numeric(10,7),
  lng numeric(10,7),
  type text check (type in ('pit','job_site','customer','depot','other')),
  notes text,
  client_id uuid references clients(id) on delete set null,
  active boolean default true
);

-- ── ESTIMATES ────────────────────────────────────────────────
create table if not exists estimates (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  estimate_number text not null unique,
  client_id uuid references clients(id) not null,
  status text default 'draft' check (status in ('draft','sent','approved','declined','expired')),
  issue_date date default current_date,
  expiry_date date,
  notes text,
  subtotal numeric(10,2) default 0,
  tax_rate numeric(7,6) default 0,
  tax_amount numeric(10,2) default 0,
  total numeric(10,2) default 0,
  public_token uuid default gen_random_uuid() unique,
  approved_at timestamptz,
  approved_by text,
  signature_data text
);

create table if not exists estimate_items (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid references estimates(id) on delete cascade not null,
  sort_order int default 0,
  description text not null,
  material text,
  quantity numeric(10,3) not null,
  unit text default 'ton',
  unit_price numeric(10,2) not null,
  total numeric(10,2) not null
);

-- ── COMMERCIAL PROJECTS ──────────────────────────────────────
create table if not exists commercial_projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  client_id uuid references clients(id),
  status text default 'active' check (status in ('bid','active','on_hold','complete','cancelled')),
  start_date date,
  end_date date,
  contract_value numeric(12,2),
  notes text,
  address text,
  city text,
  project_manager text
);

create table if not exists project_phases (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  project_id uuid references commercial_projects(id) on delete cascade not null,
  name text not null,
  status text default 'pending' check (status in ('pending','active','complete')),
  start_date date,
  end_date date,
  budget numeric(10,2),
  actual_cost numeric(10,2) default 0,
  notes text
);

create table if not exists project_daily_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  project_id uuid references commercial_projects(id) on delete cascade not null,
  log_date date not null,
  employee_id uuid references employees(id),
  hours numeric(6,2),
  equipment_used text,
  material_moved text,
  weather text,
  notes text
);

-- ── DOCUMENT VAULT ───────────────────────────────────────────
create table if not exists document_vault (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  file_name text not null,
  file_url text,
  file_type text,
  file_size_kb int,
  category text check (category in ('contract','permit','invoice','receipt','photo','insurance','other')),
  ocr_text text,
  ocr_status text default 'pending' check (ocr_status in ('pending','processing','complete','failed')),
  tags text[] default '{}',
  client_id uuid references clients(id) on delete set null,
  project_id uuid references commercial_projects(id) on delete set null,
  uploaded_by text,
  notes text
);

create table if not exists receipt_inbox (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  file_name text not null,
  file_url text,
  vendor text,
  amount numeric(10,2),
  receipt_date date,
  category text check (category in ('fuel','parts','supplies','maintenance','meals','other')),
  ocr_raw text,
  status text default 'pending' check (status in ('pending','review','approved','rejected','synced')),
  employee_id uuid references employees(id),
  notes text,
  qb_expense_id text
);

-- ── COMMUNICATIONS ───────────────────────────────────────────
create table if not exists chat_conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  client_id uuid references clients(id) on delete cascade,
  channel text default 'email' check (channel in ('email','sms','chat','phone')),
  subject text,
  status text default 'open' check (status in ('open','closed','snoozed')),
  last_message_at timestamptz,
  unread_count int default 0
);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  conversation_id uuid references chat_conversations(id) on delete cascade not null,
  direction text not null check (direction in ('inbound','outbound')),
  body text not null,
  sender_name text,
  read_at timestamptz,
  channel text
);

create table if not exists sms_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  to_phone text,
  from_phone text,
  body text,
  status text check (status in ('queued','sent','delivered','failed')),
  client_id uuid references clients(id),
  trigger_type text,
  error_message text
);

create table if not exists email_send_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  to_email text,
  subject text,
  template text,
  status text check (status in ('sent','bounced','opened','failed')),
  client_id uuid references clients(id),
  resend_id text,
  opened_at timestamptz
);

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  employee_id uuid references employees(id),
  endpoint text not null unique,
  p256dh text,
  auth text,
  active boolean default true
);

-- ── AR & ACCOUNTING ──────────────────────────────────────────
create table if not exists ar_notes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  client_id uuid references clients(id) on delete cascade not null,
  invoice_id uuid references invoices(id) on delete set null,
  note text not null,
  next_follow_up date,
  created_by text
);

create table if not exists general_ledger (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  posted_date date not null,
  account text not null,
  account_type text check (account_type in ('income','expense','asset','liability')),
  description text,
  debit numeric(12,2) default 0,
  credit numeric(12,2) default 0,
  reference_type text,
  reference_id uuid,
  notes text
);

-- ── AI & KNOWLEDGE ───────────────────────────────────────────
create table if not exists business_knowledge (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  category text not null check (category in ('service','pricing','hours','coverage_area','faq','policy','equipment','other')),
  question text not null,
  answer text not null,
  enabled boolean default true,
  sort_order int default 0
);

create table if not exists ai_conversation_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  session_id text,
  role text check (role in ('user','assistant')),
  content text,
  request_id uuid references service_requests(id) on delete set null,
  tokens_used int
);

create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  title text not null,
  slug text unique,
  content text,
  excerpt text,
  status text default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  seo_title text,
  seo_description text,
  tags text[] default '{}',
  author text default 'Silver Creek Logistics',
  cover_image_url text,
  ai_generated boolean default false,
  word_count int
);

-- ── GALLERY / MEDIA ──────────────────────────────────────────
create table if not exists gallery_photos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  title text,
  description text,
  image_url text not null,
  category text check (category in ('job','equipment','team','before_after','other')),
  tags text[] default '{}',
  client_id uuid references clients(id) on delete set null,
  project_id uuid references commercial_projects(id) on delete set null,
  featured boolean default false,
  sort_order int default 0
);

-- ── REFERRALS & SURVEYS ──────────────────────────────────────
create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  referrer_client_id uuid references clients(id),
  referred_name text not null,
  referred_phone text,
  referred_email text,
  status text default 'pending' check (status in ('pending','contacted','converted','lost')),
  reward_amount numeric(8,2) default 0,
  reward_paid boolean default false,
  notes text
);

create table if not exists survey_results (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  client_id uuid references clients(id),
  invoice_id uuid references invoices(id),
  nps_score int check (nps_score between 0 and 10),
  quality_score int check (quality_score between 1 and 5),
  timeliness_score int check (timeliness_score between 1 and 5),
  communication_score int check (communication_score between 1 and 5),
  comments text,
  would_refer boolean,
  responded_at timestamptz default now()
);

-- ── USER MANAGEMENT ──────────────────────────────────────────
create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  email text not null unique,
  name text not null,
  role text default 'viewer' check (role in ('owner','admin','dispatcher','viewer')),
  active boolean default true,
  last_login_at timestamptz,
  invite_token text
);

-- ── QUICKBOOKS TRACKING ──────────────────────────────────────
create table if not exists qb_connections (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  realm_id text not null,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  company_name text,
  last_synced_at timestamptz
);

create table if not exists qb_sync_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  entity_type text check (entity_type in ('invoice','customer','payment')),
  entity_id uuid,
  qb_id text,
  status text check (status in ('synced','failed','pending')),
  error_message text
);

-- ── MARKETING CAMPAIGNS (enhance existing) ────────────────────
alter table campaigns add column if not exists opens int default 0;
alter table campaigns add column if not exists clicks int default 0;
alter table campaigns add column if not exists unsubscribes int default 0;

-- ── ENABLE RLS ON ALL NEW TABLES ─────────────────────────────
do $$ declare t text; begin
  for t in select tablename from pg_tables where schemaname = 'public'
    and tablename in (
      'crews','employees','time_entries','time_off_requests','time_off_balances',
      'downtime_forms','employee_reviews','employee_skills','location_logs','locations',
      'estimates','estimate_items','commercial_projects','project_phases','project_daily_logs',
      'document_vault','receipt_inbox','chat_conversations','chat_messages','sms_log',
      'email_send_log','push_subscriptions','ar_notes','general_ledger','business_knowledge',
      'ai_conversation_log','blog_posts','gallery_photos','referrals','survey_results',
      'admin_users','qb_connections','qb_sync_log'
    )
  loop
    execute format('alter table %I enable row level security', t);
  end loop;
end $$;
