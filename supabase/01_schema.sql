-- One More Candle — gifts table
-- Run this in Supabase SQL Editor

create extension if not exists "pgcrypto";

create table if not exists public.gifts (
  id text primary key,                 -- short nanoid, used in /gift/[id]
  friend_name text not null,
  intro_text text,
  flavor text not null default 'chocolate',      -- chocolate | vanilla | strawberry
  cream_style text not null default 'classic',
  background_theme text not null default 'sunset',
  candle_style text not null default 'classic',
  message text not null,
  closing_line text,
  photos jsonb not null default '[]'::jsonb,      -- [{ url, caption }]
  created_at timestamptz not null default now()
);

-- No auth needed: gifts are anonymous + write-once from the creator flow.
alter table public.gifts enable row level security;

-- Anyone can read a gift by id (that's how the recipient link works)
create policy "public read gifts"
  on public.gifts for select
  using (true);

-- Anyone can create a gift (no accounts in V1)
create policy "public insert gifts"
  on public.gifts for insert
  with check (true);

-- No update/delete policy = nobody can modify or delete via the client. Good for a gift.
