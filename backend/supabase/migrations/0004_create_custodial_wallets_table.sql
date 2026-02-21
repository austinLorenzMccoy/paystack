-- ============================================================
-- Custodial Wallets Table
-- ============================================================

create table if not exists custodial_wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stx_address text not null unique,
  encrypted_mnemonic text not null,
  balance_cached numeric not null default 0,
  airdrop_tx_id text,
  last_balance_check timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists custodial_wallets_user_idx on custodial_wallets (user_id);
create index if not exists custodial_wallets_address_idx on custodial_wallets (stx_address);

-- RLS policies
alter table custodial_wallets enable row level security;

create policy "Users can view their own custodial wallet"
  on custodial_wallets for select
  using (auth.uid() = user_id);

create policy "Service role can manage all custodial wallets"
  on custodial_wallets for all
  using (auth.role() = 'service_role');
