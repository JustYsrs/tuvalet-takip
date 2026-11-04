-- 24 Saat / 20 Dakikalık Kalıcı Tuvalet Blokları
-- Supabase Dashboard > SQL Editor içinde bir kez çalıştırın.
-- Ayrıca: Authentication > Sign In / Providers > "Allow anonymous sign-ins" açık olmalı.

create table if not exists public.slots (
  slot_index  smallint primary key check (slot_index between 0 and 71),
  owner_name  text not null check (char_length(btrim(owner_name)) between 1 and 24),
  owner_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  claimed_at  timestamptz not null default now()
);

alter table public.slots enable row level security;

drop policy if exists "slots herkes okuyabilir" on public.slots;
create policy "slots herkes okuyabilir"
  on public.slots for select
  using (true);

drop policy if exists "slots kendi adina alinir" on public.slots;
create policy "slots kendi adina alinir"
  on public.slots for insert
  to authenticated
  with check (owner_id = auth.uid());

drop policy if exists "slots sadece sahibi siler" on public.slots;
create policy "slots sadece sahibi siler"
  on public.slots for delete
  to authenticated
  using (owner_id = auth.uid());

-- UPDATE politikası bilinçli olarak yok: bir slot el değiştiremez, yalnızca sahibi tarafından bırakılabilir.

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'slots'
  ) then
    alter publication supabase_realtime add table public.slots;
  end if;
end $$;
