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

-- One public score per signed-in farmer. Private layouts and garden payloads stay in sea_farm_saves.
create table if not exists public.sea_farm_scores (
  user_id uuid primary key references auth.users (id) on delete cascade,
  last_balance bigint not null check (last_balance >= 0),
  best_balance bigint not null check (best_balance >= last_balance),
  total_sales bigint not null check (total_sales >= 0),
  played_seconds bigint not null check (played_seconds >= 0),
  updated_at timestamptz not null default now()
);
alter table public.sea_farm_scores enable row level security;
revoke all on public.sea_farm_scores from public, anon, authenticated;

create or replace function public.report_sea_farm_score(
  p_balance bigint, p_best bigint, p_sales bigint, p_seconds bigint
) returns bigint
language plpgsql security definer set search_path = '' as $$
declare
  farmer uuid := (select auth.uid());
  recorded_seconds bigint;
begin
  if farmer is null then raise exception 'Sign in to report a score' using errcode = '42501'; end if;
  if p_balance is null or p_best is null or p_sales is null or p_seconds is null
      or least(p_balance, p_sales, p_seconds) < 0 or p_best < p_balance
      or greatest(p_best, p_sales, p_seconds) > 9007199254740991 then
    raise exception 'Invalid farm statistics' using errcode = '22023';
  end if;
  insert into public.sea_farm_scores as scores (user_id, last_balance, best_balance, total_sales, played_seconds)
    values (farmer, p_balance, p_best, p_sales, p_seconds)
  on conflict (user_id) do update set
    last_balance = excluded.last_balance,
    best_balance = greatest(scores.best_balance, excluded.best_balance),
    total_sales = greatest(scores.total_sales, excluded.total_sales),
    played_seconds = greatest(scores.played_seconds, excluded.played_seconds),
    updated_at = now()
  returning played_seconds into recorded_seconds;
  return recorded_seconds;
end;
$$;
revoke all on function public.report_sea_farm_score(bigint,bigint,bigint,bigint) from public, anon;
grant execute on function public.report_sea_farm_score(bigint,bigint,bigint,bigint) to authenticated;

create or replace function public.sea_farm_leaderboard(p_order text default 'balance')
returns table (place bigint, player_name text, best_balance bigint, total_sales bigint, played_seconds bigint, is_me boolean)
language sql stable security definer set search_path = '' as $$
  select rank() over (order by score.metric desc), coalesce(nullif(p.username, ''), 'Diver'),
         s.best_balance, s.total_sales, s.played_seconds, s.user_id is not distinct from (select auth.uid())
  from public.sea_farm_scores s
  left join public.profiles p on p.id = s.user_id
  cross join lateral (select case p_order when 'time' then s.played_seconds
                         when 'sales' then s.total_sales else s.best_balance end as metric) score
  order by score.metric desc, s.user_id
  limit 50;
$$;
revoke all on function public.sea_farm_leaderboard(text) from public;
grant execute on function public.sea_farm_leaderboard(text) to anon, authenticated;

commit;
