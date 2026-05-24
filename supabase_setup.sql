-- ════════════════════════════════════════════════════════
--  Bio360 · Supabase Schema Setup
--  Run this entire file in Supabase → SQL Editor → Run
-- ════════════════════════════════════════════════════════

-- ── 1. PROFILES (main user table) ──────────────────────
create table if not exists public.profiles (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  college      text not null,
  department   text default 'Life Science',
  xp           integer default 0,
  streak       integer default 0,
  avatar       text default '',
  joined_at    timestamp with time zone default now()
);

-- ── 2. QUIZ_SCORES ─────────────────────────────────────
create table if not exists public.quiz_scores (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.profiles(id) on delete cascade,
  score        integer not null,
  quiz_date    date default current_date,
  created_at   timestamp with time zone default now()
);

-- ── 3. MISSIONS ────────────────────────────────────────
create table if not exists public.missions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.profiles(id) on delete cascade,
  mission_key  text not null,   -- e.g. 'solve_10_mcq', 'download_pyq', 'read_blog'
  completed    boolean default false,
  mission_date date default current_date,
  created_at   timestamp with time zone default now()
);

-- ── 4. ACTIVITY_FEED ───────────────────────────────────
create table if not exists public.activity_feed (
  id           uuid primary key default gen_random_uuid(),
  type         text not null,   -- 'quiz', 'download', 'streak', 'internship', 'join'
  user_name    text not null,
  college      text default '',
  action       text not null,   -- human-readable action string
  icon         text default '⚡',
  created_at   timestamp with time zone default now()
);

-- ── 5. INTERNSHIPS ─────────────────────────────────────
create table if not exists public.internships (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  organization text not null,
  location     text not null,
  type         text default 'Research',  -- Research, Industry, Government, Training
  stipend      text default '',
  eligibility  text default 'BSc Life Science',
  deadline     date,
  link         text default '',
  is_active    boolean default true,
  created_at   timestamp with time zone default now()
);

-- ════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════
alter table public.profiles      enable row level security;
alter table public.quiz_scores   enable row level security;
alter table public.missions      enable row level security;
alter table public.activity_feed enable row level security;
alter table public.internships   enable row level security;

-- Public read on profiles, activity_feed, internships
create policy "Public read profiles"
  on public.profiles for select using (true);

create policy "Public read activity_feed"
  on public.activity_feed for select using (true);

create policy "Public read internships"
  on public.internships for select using (true);

create policy "Public read quiz_scores"
  on public.quiz_scores for select using (true);

-- Anyone can insert activity (logged from frontend)
create policy "Anyone insert activity"
  on public.activity_feed for insert with check (true);

-- Anyone can insert profile (on join)
create policy "Anyone insert profile"
  on public.profiles for insert with check (true);

-- Anyone can insert quiz score
create policy "Anyone insert quiz_score"
  on public.quiz_scores for insert with check (true);

-- ════════════════════════════════════════════════════════
--  INDEXES for performance
-- ════════════════════════════════════════════════════════
create index if not exists idx_profiles_xp     on public.profiles(xp desc);
create index if not exists idx_profiles_streak on public.profiles(streak desc);
create index if not exists idx_activity_time   on public.activity_feed(created_at desc);
create index if not exists idx_internships_dl  on public.internships(deadline asc);
create index if not exists idx_quiz_user       on public.quiz_scores(user_id, quiz_date);

-- ════════════════════════════════════════════════════════
--  LEADERBOARD VIEW (computed from profiles + quiz_scores)
-- ════════════════════════════════════════════════════════
create or replace view public.leaderboard as
  select
    p.id,
    p.name,
    p.college,
    p.department,
    p.xp,
    p.streak,
    p.avatar,
    rank() over (order by p.xp desc) as rank
  from public.profiles p
  order by p.xp desc
  limit 50;

-- ════════════════════════════════════════════════════════
--  SEED DATA — Run once to populate initial data
-- ════════════════════════════════════════════════════════

-- Seed profiles
insert into public.profiles (name, college, department, xp, streak) values
  ('Rahul K.',    'MG University',          'BSc Microbiology',    2840, 21),
  ('Fathima M.',  'MG University',          'BSc Microbiology',    2410, 14),
  ('Sufail A.',   'University of Calicut',  'BSc Biotechnology',   2190, 14),
  ('Neethu S.',   'Kannur University',      'BSc Biochemistry',    1920, 9),
  ('Arjun P.',    'Kannur University',      'BSc Zoology',         1740, 6),
  ('Priya V.',    'Kerala University',      'BSc Botany',          1580, 5),
  ('Mohammed K.', 'Calicut University',     'BSc Biotechnology',   1430, 3),
  ('Deepthi R.',  'MG University',          'BSc Genetics',        1290, 4),
  ('Jasmin A.',   'Mahatma Gandhi Univ.',   'BSc Microbiology',    1150, 7),
  ('Arun M.',     'University of Calicut',  'BSc Biotechnology',   980,  2)
on conflict do nothing;

-- Seed activity feed
insert into public.activity_feed (type, user_name, college, action, icon) values
  ('download', 'Arjun P.',   'Kannur University',     'downloaded Genetics PYQ 2023',          '🔬'),
  ('streak',   'Fathima M.', 'MG University',          'hit a 14-day quiz streak',               '🏆'),
  ('quiz',     'Rahul K.',   'MG University',           'scored 100% on Biochemistry quiz',       '⚡'),
  ('join',     'Neethu S.',  'Kannur University',       'joined CSIR NET study group',            '🧬'),
  ('download', 'Priya V.',   'Kerala University',       'downloaded Microbiology PYQ 2022',       '📄'),
  ('streak',   'Sufail A.',  'University of Calicut',  'reached a 14-day streak',                '🔥'),
  ('quiz',     'Jasmin A.',  'Mahatma Gandhi Univ.',   'completed today''s Daily Quiz',           '📝'),
  ('join',     'Arun M.',    'University of Calicut',  'joined the Bio360 community',             '🌟'),
  ('download', 'Deepthi R.', 'MG University',           'downloaded Biochemistry notes',          '🔬'),
  ('quiz',     'Mohammed K.','University of Calicut',  'earned Bio Guru badge',                  '🏅')
on conflict do nothing;

-- Seed internships
insert into public.internships (title, organization, location, type, stipend, eligibility, deadline, link) values
  ('Summer Research Fellowship',        'JNCASR',                                'Bangalore',          'Research',    '₹10,000/month', 'BSc 2nd yr+',       '2025-03-15', 'https://jncasr.ac.in'),
  ('DBT Internship Programme 2025',     'Dept. of Biotechnology, Govt. India',   'New Delhi',          'Government',  '₹8,000/month',  'BSc Life Science',  '2025-04-30', 'https://dbt.gov.in'),
  ('Bioinformatics Workshop',           'Institute of Bioinformatics (IBAB)',     'Bangalore (Hybrid)', 'Training',    'Free',           'BSc/MSc',           '2025-05-20', 'https://ibab.ac.in'),
  ('Student Research Project',          'RGCB — Rajiv Gandhi Centre Biotech',    'Thiruvananthapuram', 'Research',    '₹5,000/month',  'BSc Life Science',  '2025-06-10', 'https://rgcb.res.in'),
  ('KSCSTE Student Fellowship',         'Kerala State Council Sci. Tech. Env.',  'Thiruvananthapuram', 'Government',  '₹3,000/month',  'Kerala students',   '2025-05-31', 'https://kscste.kerala.gov.in'),
  ('NIIST Summer Internship',           'NIIST — CSIR Lab',                      'Thiruvananthapuram', 'Research',    '₹5,000/month',  'BSc/MSc',           '2025-04-15', 'https://niist.res.in'),
  ('IISc Summer Research Programme',    'Indian Institute of Science',            'Bangalore',          'Research',    '₹10,000/month', 'CGPA 8.5+',         '2025-03-01', 'https://iisc.ac.in'),
  ('Clinical Research Internship',      'Syngene International',                  'Bangalore',          'Industry',    '₹8,000/month',  'BSc Biotechnology', '2025-05-01', 'https://syngeneintl.com')
on conflict do nothing;

-- ════════════════════════════════════════════════════════
--  DONE ✓
--  Tables created: profiles, quiz_scores, missions,
--                  activity_feed, internships
--  View created:   leaderboard
--  Seed data:      10 profiles, 10 activity items, 8 internships
-- ════════════════════════════════════════════════════════
