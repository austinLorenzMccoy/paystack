-- ============================================================
-- Subscription Relayer + Notification Tables
-- ============================================================

create extension if not exists "pgcrypto";

-- Core subscription record (mirrors on-chain escrow state)
create table if not exists autopay_subscriptions (
  id uuid primary key default gen_random_uuid(),
  subscriber_principal text not null,
  merchant_principal text not null,
  plan_id text,
  contract_address text not null default 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.subscription-autopay',
  amount_per_interval numeric not null,
  interval_blocks integer not null,
  auto_stack boolean not null default false,
  pox_address jsonb,
  deposit_amount numeric,
  balance_cached numeric,
  next_charge_block bigint,
  last_charge_block bigint,
  strikes integer not null default 0,
  status text not null default 'active', -- active | paused | cancelled | completed
  last_status_change timestamptz not null default timezone('utc', now()),
  last_error text,
  last_tx_id text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists autopay_subscriptions_subscriber_idx on autopay_subscriptions (subscriber_principal);
create index if not exists autopay_subscriptions_status_idx on autopay_subscriptions (status, next_charge_block);

-- Optional policy extensions (top-up thresholds, reminders, etc.)
create table if not exists autopay_policies (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references autopay_subscriptions(id) on delete cascade,
  policy_hash text not null,
  min_balance numeric not null default 0,
  top_up_amount numeric,
  notify_threshold numeric,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists autopay_policies_subscription_idx on autopay_policies(subscription_id);

-- Relayer job queue (polls for due subscriptions + retries)
create table if not exists relayer_jobs (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references autopay_subscriptions(id) on delete cascade,
  job_type text not null, -- charge | notify | reconcile
  run_at timestamptz not null,
  status text not null default 'pending', -- pending | running | succeeded | failed
  attempts integer not null default 0,
  last_error text,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists relayer_jobs_status_run_idx on relayer_jobs (status, run_at);

-- Execution log per relayer sweep
create table if not exists relayer_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default timezone('utc', now()),
  finished_at timestamptz,
  ok_count integer not null default 0,
  fail_count integer not null default 0,
  status text not null default 'running',
  error text
);

-- Job level audit trail
create table if not exists relayer_job_events (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references relayer_jobs(id) on delete cascade,
  subscription_id uuid references autopay_subscriptions(id) on delete cascade,
  result text not null,
  tx_id text,
  error text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists relayer_job_events_subscription_idx on relayer_job_events(subscription_id);

-- Subscriber contact + notifications
create table if not exists subscriber_contacts (
  id uuid primary key default gen_random_uuid(),
  subscriber_principal text not null,
  email text not null,
  verified boolean not null default false,
  verification_token text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (subscriber_principal)
);

create table if not exists notification_queue (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references autopay_subscriptions(id) on delete cascade,
  contact_id uuid references subscriber_contacts(id) on delete cascade,
  notification_type text not null, -- low_balance | strike_warning | cancelled | receipt
  subject text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending', -- pending | sending | sent | failed
  attempts integer not null default 0,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists notification_queue_status_idx on notification_queue (status, created_at);
