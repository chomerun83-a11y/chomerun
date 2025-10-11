-- SCHEMA_v9_3.sql (v7_9 스타일 호환, RLS 포함)

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.settings (
  key text primary key,
  value jsonb
);

create table if not exists public.notices (
  id bigserial primary key,
  title text,
  body text,
  created_at timestamptz default now()
);

create table if not exists public.home_slides (
  id bigserial primary key,
  url text,
  path text,
  caption text,
  sort bigint default 0,
  created_at timestamptz default now()
);

-- schedules: time-only를 쓰는 기존 구조와 start/end 모두 호환
create table if not exists public.schedules (
  id bigserial primary key,
  day text null,
  time text null,        -- v7_9 호환
  start_time text null,  -- 확장
  end_time text null,    -- 확장
  activity text,
  place text,
  created_at timestamptz default now()
);

create table if not exists public.visits (
  id bigserial primary key,
  title text,
  summary text,
  body text,
  map_query text,
  created_at timestamptz default now()
);

create table if not exists public.visit_images (
  id bigserial primary key,
  visit_id bigint references public.visits(id) on delete cascade,
  url text,
  path text,
  created_at timestamptz default now()
);

create table if not exists public.polls (
  id bigserial primary key,
  question text not null,
  multiple boolean default false,
  deadline date null,
  is_active boolean default true,
  created_at timestamptz default now()
);
create table if not exists public.poll_options (
  id bigserial primary key,
  poll_id bigint references public.polls(id) on delete cascade,
  option_text text not null
);
create table if not exists public.poll_responses (
  id bigserial primary key,
  poll_id bigint references public.polls(id) on delete cascade,
  option_id bigint references public.poll_options(id) on delete cascade,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.settings enable row level security;
alter table public.notices enable row level security;
alter table public.home_slides enable row level security;
alter table public.schedules enable row level security;
alter table public.visits enable row level security;
alter table public.visit_images enable row level security;
alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.poll_responses enable row level security;

-- helper
create or replace function public.is_admin_user(u uuid)
returns boolean language sql stable as $$
  select exists (select 1 from public.profiles p where p.id = u and p.is_admin);
$$;

-- profiles
drop policy if exists prof_self_read on public.profiles;
drop policy if exists prof_self_update on public.profiles;
drop policy if exists prof_admin_all on public.profiles;
create policy prof_self_read on public.profiles for select using (auth.uid() = id or public.is_admin_user(auth.uid()));
create policy prof_self_update on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy prof_admin_all  on public.profiles for all to authenticated using (public.is_admin_user(auth.uid())) with check (public.is_admin_user(auth.uid()));

-- public read / admin write
create policy if not exists settings_public_read on public.settings for select using (true);
create policy if not exists settings_admin_write on public.settings for all to authenticated using (public.is_admin_user(auth.uid())) with check (public.is_admin_user(auth.uid()));

create policy if not exists notices_public_read on public.notices for select using (true);
create policy if not exists notices_admin_write on public.notices for all to authenticated using (public.is_admin_user(auth.uid())) with check (public.is_admin_user(auth.uid()));

create policy if not exists home_slides_public_read on public.home_slides for select using (true);
create policy if not exists home_slides_admin_write on public.home_slides for all to authenticated using (public.is_admin_user(auth.uid())) with check (public.is_admin_user(auth.uid()));

create policy if not exists schedules_public_read on public.schedules for select using (true);
create policy if not exists schedules_admin_write on public.schedules for all to authenticated using (public.is_admin_user(auth.uid())) with check (public.is_admin_user(auth.uid()));

create policy if not exists visits_public_read on public.visits for select using (true);
create policy if not exists visits_admin_write on public.visits for all to authenticated using (public.is_admin_user(auth.uid())) with check (public.is_admin_user(auth.uid()));

create policy if not exists visit_images_public_read on public.visit_images for select using (true);
create policy if not exists visit_images_admin_write on public.visit_images for all to authenticated using (public.is_admin_user(auth.uid())) with check (public.is_admin_user(auth.uid()));

create policy if not exists polls_public_read on public.polls for select using (true);
create policy if not exists polls_admin_write on public.polls for all to authenticated using (public.is_admin_user(auth.uid())) with check (public.is_admin_user(auth.uid()));

create policy if not exists poll_options_public_read on public.poll_options for select using (true);
create policy if not exists poll_options_admin_write on public.poll_options for all to authenticated using (public.is_admin_user(auth.uid())) with check (public.is_admin_user(auth.uid()));

-- votes
drop policy if exists pr_admin_read on public.poll_responses;
drop policy if exists pr_anon_insert on public.poll_responses;
drop policy if exists pr_auth_insert on public.poll_responses;
create policy pr_admin_read on public.poll_responses for select to authenticated using (public.is_admin_user(auth.uid()));
create policy pr_anon_insert on public.poll_responses for insert to anon with check (true);
create policy pr_auth_insert on public.poll_responses for insert to authenticated with check (true);

-- storage policies (bucket 'images')
do $$ begin
  begin drop policy if exists "public read images" on storage.objects; exception when others then null; end;
  begin drop policy if exists "admin write images" on storage.objects; exception when others then null; end;
end $$;
create policy "public read images" on storage.objects for select using ( bucket_id = 'images' );
create policy "admin write images" on storage.objects for all to authenticated using ( bucket_id = 'images' and public.is_admin_user(auth.uid()) ) with check ( bucket_id = 'images' and public.is_admin_user(auth.uid()) );

-- RPCs
create or replace function public.admin_delete_poll(p_poll bigint)
returns void language plpgsql security definer as $$
begin
  delete from public.poll_responses where poll_id = p_poll;
  delete from public.poll_options   where poll_id = p_poll;
  delete from public.polls          where id = p_poll;
end;
$$;

create or replace function public.poll_vote(p_poll bigint, p_option_ids bigint[])
returns void language plpgsql security definer as $$
begin
  insert into public.poll_responses (poll_id, option_id)
  select p_poll, unnest(p_option_ids);
end;
$$;
