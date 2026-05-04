-- Silver Creek Logistics LLC — Supabase Schema
-- Run this in your Supabase SQL Editor: supabase.com → project → SQL Editor

-- CLIENTS
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  email text,
  phone text,
  company text,
  address text,
  city text,
  state text default 'ID',
  zip text,
  notes text,
  status text default 'active' check (status in ('active','inactive','lead')),
  tags text[] default '{}',
  last_contact_at timestamptz,
  portal_user_id uuid references auth.users(id) on delete set null,
  qb_customer_id text
);

-- INVOICES
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  invoice_number text not null unique,
  client_id uuid references clients(id) not null,
  status text default 'draft' check (status in ('draft','sent','paid','overdue','void')),
  issue_date date default current_date,
  due_date date,
  notes text,
  subtotal numeric(10,2) default 0,
  tax_rate numeric(7,6) default 0,
  tax_amount numeric(10,2) default 0,
  total numeric(10,2) default 0,
  amount_paid numeric(10,2) default 0,
  balance numeric(10,2) default 0,
  public_token uuid default gen_random_uuid() unique,
  qb_invoice_id text
);

-- INVOICE ITEMS
create table if not exists invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references invoices(id) on delete cascade,
  sort_order int default 0,
  description text not null,
  material text,
  quantity numeric(10,3) not null,
  unit text default 'ton',
  unit_price numeric(10,2) not null,
  total numeric(10,2) not null
);

-- PAYMENTS
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  invoice_id uuid references invoices(id) on delete cascade,
  amount numeric(10,2) not null,
  method text default 'cash' check (method in ('cash','check','card','ach','other')),
  reference_number text,
  notes text
);

-- INTERACTIONS
create table if not exists interactions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  client_id uuid references clients(id) on delete cascade,
  type text not null check (type in ('call','email','delivery','quote','note','meeting')),
  subject text,
  notes text,
  next_followup date
);

-- CAMPAIGNS
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  type text default 'email' check (type in ('email','sms')),
  subject text,
  body text,
  status text default 'draft' check (status in ('draft','sent')),
  sent_at timestamptz,
  target_tags text[] default '{}',
  recipient_count int default 0
);

-- ENABLE ROW LEVEL SECURITY
alter table clients enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;
alter table payments enable row level security;
alter table interactions enable row level security;
alter table campaigns enable row level security;

-- PORTAL RLS POLICIES (clients see only their own data)
create policy "Portal: clients see own record"
  on clients for select
  using (auth.uid() = portal_user_id);

create policy "Portal: clients see own invoices"
  on invoices for select
  using (client_id in (select id from clients where portal_user_id = auth.uid()));

create policy "Portal: clients see own invoice items"
  on invoice_items for select
  using (invoice_id in (
    select i.id from invoices i
    join clients c on i.client_id = c.id
    where c.portal_user_id = auth.uid()
  ));

create policy "Portal: clients see own payments"
  on payments for select
  using (invoice_id in (
    select i.id from invoices i
    join clients c on i.client_id = c.id
    where c.portal_user_id = auth.uid()
  ));

-- NOTE: Admin operations use the service role key which bypasses RLS entirely.
-- No admin policies needed — the service role client in lib/supabase/admin.ts handles all admin reads/writes.
