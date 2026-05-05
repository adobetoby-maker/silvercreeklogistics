-- SERVICE REQUESTS (dispatch)
create table if not exists service_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),

  -- Customer
  customer_name text not null,
  customer_phone text not null,
  customer_email text,

  -- Order
  material_id text not null,
  material_name text not null,
  quantity numeric(10,2) not null,
  unit text not null,

  -- Delivery
  delivery_address text not null,
  delivery_city text,
  delivery_notes text,
  requested_date date,

  -- Dispatch
  status text default 'new' check (status in ('new','assigned','in_transit','delivered','cancelled')),
  driver_name text,
  driver_email text,
  driver_phone text,
  scheduled_date date,
  scheduled_time text,

  -- Internal tracking
  internal_notes text,
  dispatched_at timestamptz,
  delivered_at timestamptz,

  -- Notification tracking (cron uses this to avoid double-sending)
  notification_sent_at timestamptz,

  -- Optional CRM link
  client_id uuid references clients(id) on delete set null
);

alter table service_requests enable row level security;
-- Admin ops use service role key which bypasses RLS.
-- No portal access to service_requests needed.

-- DRIVERS (managed in admin settings, not in lib/drivers.ts)
create table if not exists drivers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  email text,
  phone text,
  active boolean default true
);

alter table drivers enable row level security;
