-- =====================================================================
-- schema.sql — สร้างตารางเก็บข้อมูลของเว็บ SSyba ใน Supabase
--
-- วิธีใช้: Supabase Dashboard → SQL Editor → New query
--          → คัดลอกไฟล์นี้ทั้งหมดไปวาง → กด Run
--          (กด Run ซ้ำได้ ไม่พัง)
--
-- อีเมล / รหัสผ่าน: Supabase เก็บให้เองในระบบ Auth (ดูได้ที่ Authentication → Users)
--   รหัสผ่านถูกเข้ารหัสให้อัตโนมัติ และไม่มีใครเห็นอีเมลของคนอื่นผ่านหน้าเว็บได้
--
-- ตารางที่สร้างในไฟล์นี้มี 4 ตาราง:
--   profiles ข้อมูลผู้ใช้ที่เปิดเผยได้ เช่น ชื่อผู้ใช้  (ผู้ใช้ 1 คน = 1 แถว สร้างให้อัตโนมัติตอนสมัคร)
--   library  เกมที่ผู้ใช้เก็บไว้                      (ผู้ใช้ 1 คน เก็บได้หลายเกม)
--   ratings  ดาวที่ผู้ใช้ให้แต่ละเกม                  (1 คน ให้ 1 เกมได้ 1 ครั้ง แก้ดาวได้)
--   games    ชื่อเกม (ไว้ให้ตารางสรุปด้านล่างโชว์ชื่อเกมแทนเลข id)
--
-- และ View (ตารางสรุปที่คำนวณจากตารางอื่น ดูได้ใน Table Editor เหมือนตารางปกติ) อีก 2 อัน:
--   profiles_library  ผู้ใช้แต่ละคน มีเกมไหนอยู่ใน Library บ้าง
--   game_ratings      แต่ละเกม ผู้เล่นคนไหนให้กี่ดาว และดาวรวม / ค่าเฉลี่ย
--
-- game_id = เลข id ของเกมในไฟล์ js/games-data.js
-- =====================================================================


-- ---------- 0) ตาราง profiles (ข้อมูลผู้ใช้) ----------

create table if not exists public.profiles (
  id         uuid        primary key references auth.users (id) on delete cascade,  -- id เดียวกับบัญชีใน Auth (ลบบัญชี = ลบโปรไฟล์ด้วย)
  username   text        not null,                                                  -- ชื่อผู้ใช้ที่โชว์บนเว็บ
  created_at timestamptz not null default now()                                     -- สมัครเมื่อไร
);

-- ฟังก์ชันสร้างโปรไฟล์ให้อัตโนมัติ ทุกครั้งที่มีคนสมัครสมาชิกใหม่
-- ชื่อผู้ใช้เอามาจากที่กรอกตอนสมัคร ถ้าไม่มี (เช่น ล็อกอินด้วย Google ในอนาคต) ใช้ชื่อจาก Google
-- หรือส่วนหน้า @ ของอีเมลแทน
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''   -- ทำงานด้วยสิทธิ์ของเจ้าของฐานข้อมูล จึงเขียนตาราง profiles ได้
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'username',
      new.raw_user_meta_data ->> 'full_name',
      split_part(new.email, '@', 1),
      'player'
    )
  );
  return new;
end;
$$;

-- Trigger = "ตัวดักเหตุการณ์": พอมีแถวใหม่ในตารางบัญชี (auth.users) → เรียกฟังก์ชันด้านบน
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- บัญชีที่สมัครไว้ก่อนมีตารางนี้ → สร้างโปรไฟล์ให้ด้วย (มีอยู่แล้วก็ข้ามไป)
insert into public.profiles (id, username)
select
  id,
  coalesce(
    raw_user_meta_data ->> 'username',
    raw_user_meta_data ->> 'full_name',
    split_part(email, '@', 1),
    'player'
  )
from auth.users
on conflict (id) do nothing;


-- ---------- 1) ตาราง library ----------

create table if not exists public.library (
  user_id  uuid        not null references auth.users (id) on delete cascade,  -- ใครเก็บ (ลบบัญชี = ลบ Library ด้วย)
  game_id  integer     not null,                                               -- เก็บเกมไหน
  added_at timestamptz not null default now(),                                 -- เก็บเมื่อไร
  primary key (user_id, game_id)                                               -- เก็บเกมเดิมซ้ำไม่ได้
);


-- ---------- 2) ตาราง ratings ----------

create table if not exists public.ratings (
  user_id  uuid        not null references auth.users (id) on delete cascade,  -- ใครให้ดาว
  game_id  integer     not null,                                               -- ให้เกมไหน
  stars    smallint    not null check (stars between 1 and 5),                 -- กี่ดาว (1 ถึง 5 เท่านั้น)
  rated_at timestamptz not null default now(),                                 -- ให้เมื่อไร
  primary key (user_id, game_id)                                               -- 1 คน ให้ 1 เกมได้แถวเดียว
);


-- ---------- 3) กฎความปลอดภัย (Row Level Security) ----------
-- key ที่อยู่ในหน้าเว็บใคร ๆ ก็เห็น จึงต้องตั้งกฎที่ฐานข้อมูลว่า "ใครทำอะไรกับแถวไหนได้บ้าง"
-- auth.uid() = id ของคนที่ล็อกอินอยู่ตอนส่งคำขอมา

alter table public.profiles enable row level security;
alter table public.library enable row level security;
alter table public.ratings enable row level security;

-- profiles: ทุกคนดูชื่อผู้ใช้ได้ (ไว้โชว์ในกระดานอันดับ / คอมเมนต์) แต่แก้ได้เฉพาะของตัวเอง
-- (ไม่มีกฎ insert / delete: แถวถูกสร้างโดย trigger และถูกลบตามบัญชีเท่านั้น)
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles
  for select to anon, authenticated using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- library: เห็น / เพิ่ม / ลบ ได้เฉพาะของตัวเอง
drop policy if exists "library_select_own" on public.library;
create policy "library_select_own" on public.library
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "library_insert_own" on public.library;
create policy "library_insert_own" on public.library
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "library_delete_own" on public.library;
create policy "library_delete_own" on public.library
  for delete to authenticated using ((select auth.uid()) = user_id);

-- ratings: ทุกคนดูได้ (เอาไปคิดคะแนนเฉลี่ย) แต่ให้ / แก้ดาวได้เฉพาะในชื่อตัวเอง
drop policy if exists "ratings_select_all" on public.ratings;
create policy "ratings_select_all" on public.ratings
  for select to anon, authenticated using (true);

drop policy if exists "ratings_insert_own" on public.ratings;
create policy "ratings_insert_own" on public.ratings
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "ratings_update_own" on public.ratings;
create policy "ratings_update_own" on public.ratings
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);


-- ---------- 4) สิทธิ์เข้าถึงตาราง ----------
-- anon = ยังไม่ล็อกอิน, authenticated = ล็อกอินแล้ว (กฎข้อ 3 ยังคุมอยู่ทุกแถว)

grant select on public.profiles to anon, authenticated;
revoke update on public.profiles from anon, authenticated;     -- ถอนสิทธิ์แก้ทุกช่องออกก่อน
grant update (username) on public.profiles to authenticated;   -- แล้วให้แก้ได้แค่ช่องชื่อผู้ใช้
grant select, insert, delete on public.library to authenticated;
grant select on public.ratings to anon, authenticated;
grant insert, update on public.ratings to authenticated;


-- ---------- 5) ตาราง games (ชื่อเกม) ----------
-- ข้อมูลเกมตัวจริง (สี, ไอคอน, ลิงก์) ยังอยู่ใน js/games-data.js เหมือนเดิม
-- ตารางนี้เก็บแค่ id + ชื่อ ให้ตารางสรุปในข้อ 6 โชว์ชื่อเกมได้
-- เพิ่มเกมใหม่ใน games-data.js แล้ว → เพิ่มแถวในตารางนี้ด้วย (id ต้องตรงกัน)
--   ถ้าลืม ตารางสรุปจะโชว์เป็น "เกม #id" แทนชื่อ

create table if not exists public.games (
  id    integer primary key,   -- ต้องตรงกับ id ใน js/games-data.js
  title text    not null       -- ชื่อเกม
);

-- เกมที่มีอยู่ตอนนี้ (มีอยู่แล้ว → อัปเดตชื่อให้ตรง)
insert into public.games (id, title) values
  (1, 'Submarine vs Fish')
on conflict (id) do update set title = excluded.title;

-- ทุกคนดูรายชื่อเกมได้ แต่แก้ผ่านหน้าเว็บไม่ได้ (แก้ได้ใน Dashboard เท่านั้น)
alter table public.games enable row level security;

drop policy if exists "games_select_all" on public.games;
create policy "games_select_all" on public.games
  for select to anon, authenticated using (true);

grant select on public.games to anon, authenticated;


-- ---------- 6) ตารางสรุป (View) สำหรับดูใน Dashboard ----------
-- View = คำสั่ง SELECT ที่ตั้งชื่อเก็บไว้ เปิดดูเมื่อไรก็คำนวณจากข้อมูลล่าสุดให้ใหม่ ไม่ต้องอัปเดตเอง
-- security_invoker = true → ใช้กฎความปลอดภัยของคนที่เปิดดู (คนนอกจะไม่เห็น Library ของคนอื่น)
-- และถอนสิทธิ์จากหน้าเว็บ (anon, authenticated) ออกทั้งหมด → ดูได้ใน Dashboard เท่านั้น

-- 6.1) ผู้ใช้แต่ละคน มีเกมไหนอยู่ใน Library บ้าง (1 แถว = ผู้ใช้ 1 คน)
--      ตัวอย่าง:  username = tester1 | library_count = 2 | library_games = Submarine vs Fish, เกม #2
drop view if exists public.profiles_library;
create view public.profiles_library with (security_invoker = true) as
select
  p.id,
  p.username,
  p.created_at,
  count(l.game_id) as library_count,                                  -- มีกี่เกม
  coalesce(
    string_agg(coalesce(g.title, 'เกม #' || l.game_id), ', ' order by l.added_at desc),
    '-'
  ) as library_games                                                  -- ชื่อเกม เรียงจากที่เก็บล่าสุด
from public.profiles p
left join public.library l on l.user_id = p.id                        -- left join = ผู้ใช้ที่ยังไม่มีเกมก็ยังโชว์
left join public.games g on g.id = l.game_id
group by p.id, p.username, p.created_at;

revoke all on public.profiles_library from anon, authenticated;

-- 6.2) แต่ละเกม ผู้เล่นคนไหนให้กี่ดาว และดาวรวม (1 แถว = เกม 1 เกม)
--      ตัวอย่าง:  title = Submarine vs Fish | rating_count = 2 | total_stars = 6 | average_stars = 3.0
--                 | stars_by_player = tester1 ★4, tester2 ★2
drop view if exists public.game_ratings;
create view public.game_ratings with (security_invoker = true) as
select
  r.game_id,
  coalesce(g.title, 'เกม #' || r.game_id) as title,
  count(*)                     as rating_count,     -- มีคนให้ดาวกี่คน
  sum(r.stars)                 as total_stars,      -- ดาวรวม
  round(avg(r.stars), 1)       as average_stars,    -- ค่าเฉลี่ย (ทศนิยม 1 ตำแหน่ง)
  string_agg(coalesce(p.username, '?') || ' ★' || r.stars, ', ' order by r.rated_at)
                               as stars_by_player   -- ใครให้กี่ดาว เรียงตามเวลาที่ให้
from public.ratings r
left join public.games g on g.id = r.game_id
left join public.profiles p on p.id = r.user_id
group by r.game_id, g.title;

revoke all on public.game_ratings from anon, authenticated;
