-- Analytics tables for PayStack Supabase backend
-- Tracks raw payment events and daily aggregates for creator dashboards

create extension if not exists "pgcrypto";

create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null,
  creator_id uuid not null,
  content_id uuid not null,
  payer_address text not null,
  amount numeric not null,
  asset text not null check (char_length(asset) <= 16),
  is_ai_agent boolean not null default false,
  metadata jsonb,
  recorded_at timestamptz not null default timezone('utc', now())
);

create index if not exists analytics_events_creator_idx on analytics_events (creator_id);
create index if not exists analytics_events_content_idx on analytics_events (content_id);
create index if not exists analytics_events_recorded_at_idx on analytics_events (recorded_at);

create table if not exists creator_daily_metrics (
  creator_id uuid not null,
  day date not null,
  total_revenue numeric not null default 0,
  payment_count integer not null default 0,
  ai_payment_count integer not null default 0,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (creator_id, day)
);

create index if not exists creator_daily_metrics_day_idx on creator_daily_metrics (day);

create or replace function increment_creator_daily_metrics(
  p_creator_id uuid,
  p_day date,
  p_amount numeric,
  p_is_ai_agent boolean
)
returns void
language plpgsql
security definer
as $$
begin
  insert into creator_daily_metrics (
    creator_id,
    day,
    total_revenue,
    payment_count,
    ai_payment_count,
    updated_at
  ) values (
    p_creator_id,
    p_day,
    p_amount,
    1,
    case when p_is_ai_agent then 1 else 0 end,
    timezone('utc', now())
  )
  on conflict (creator_id, day)
  do update set
    total_revenue = creator_daily_metrics.total_revenue + excluded.total_revenue,
    payment_count = creator_daily_metrics.payment_count + excluded.payment_count,
    ai_payment_count = creator_daily_metrics.ai_payment_count + excluded.ai_payment_count,
    updated_at = timezone('utc', now());
end;
$$;
