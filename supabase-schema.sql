-- Create a simple leads table for the revenue leak funnel.
-- Run this in your Supabase SQL editor or with the Supabase CLI.

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  leads_per_month integer not null,
  conversion_rate real not null,
  deal_value integer not null,
  response_delay text not null,
  consent boolean not null,
  created_at timestamptz not null default now()
);
