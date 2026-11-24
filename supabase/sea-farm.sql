-- Run once in the same Supabase project as SSyba, after schema.sql.
begin;

insert into public.games (id, title) values (3, 'Sea Farm')
on conflict (id) do nothing;

create table if not exists public.sea_farm_saves (
  user_id uuid not null references auth.users (id) on delete cascade,
  mode text not null check (mode in ('reef', 'garden')),
  slot_id text not null check (slot_id <> ''),
  name text not null,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  revision uuid not null default gen_random_uuid(),
  updated_at timestamptz not null default now(),
  primary key (user_id, mode, slot_id)
);

alter table public.sea_farm_saves enable row level security;
revoke all on public.sea_farm_saves from public, anon, authenticated;
grant select, insert, update, delete on public.sea_farm_saves to authenticated;

drop policy if exists sea_farm_own_saves on public.sea_farm_saves;
create policy sea_farm_own_saves on public.sea_farm_saves
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create or replace function public.sea_farm_timestamp()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists sea_farm_before_update on public.sea_farm_saves;
create trigger sea_farm_before_update before update on public.sea_farm_saves
  for each row execute function public.sea_farm_timestamp();

commit;
