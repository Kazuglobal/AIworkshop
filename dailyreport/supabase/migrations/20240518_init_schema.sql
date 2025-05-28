-- usersテーブル
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  role text,
  country text,
  bio text,
  school text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- groupsテーブル
create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  theme text,
  mentor_id uuid references users(id),
  description text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- group_membersテーブル（グループメンバーシップ）
create table if not exists group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  student_id uuid references users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(group_id, student_id)
);

-- worksテーブル
create table if not exists works (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  group_id uuid references groups(id),
  type text,
  title text not null,
  content text,
  description text,
  deadline timestamp with time zone,
  status text default 'pending',
  submitted_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- resourcesテーブル
create table if not exists resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text,
  description text,
  tags text[],
  uploaded_by uuid references users(id),
  type text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- feedbackテーブル
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  work_id uuid references works(id),
  reviewer_id uuid references users(id),
  comment text,
  score integer,
  created_at timestamp with time zone default now()
);

-- messagesテーブル
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id),
  sender_id uuid references users(id),
  content text not null,
  type text default 'text',
  created_at timestamp with time zone default now()
);

-- favorite_resourcesテーブル（お気に入りリソース）
create table if not exists favorite_resources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  resource_id uuid references resources(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(user_id, resource_id)
);

-- download_historyテーブル（ダウンロード履歴）
create table if not exists download_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  resource_id uuid references resources(id) on delete cascade,
  created_at timestamp with time zone default now()
);

-- RLSポリシー設定（usersテーブル）
alter table users enable row level security;
drop policy if exists "Users can view their own data" on users;
create policy "Users can view their own data"
  on users for select
  using (auth.uid() = id);

-- groupsテーブルRLS
alter table groups enable row level security;
drop policy if exists "Users can view groups" on groups;
create policy "Users can view groups"
  on groups for select
  using (true);

-- group_membersテーブルRLS
alter table group_members enable row level security;
create policy "Users can view group members"
  on group_members for select
  using (true);

-- worksテーブルRLS
alter table works enable row level security;

-- resourcesテーブルRLS
alter table resources enable row level security;
drop policy if exists "Users can view resources" on resources;
create policy "Users can view resources"
  on resources for select
  using (true);

-- feedbackテーブルRLS
alter table feedback enable row level security;
drop policy if exists "Users can view feedback for their works" on feedback;
create policy "Users can view feedback for their works"
  on feedback for select
  using (auth.uid() = reviewer_id);

-- messagesテーブルRLS
alter table messages enable row level security;
drop policy if exists "Users can view messages in their group" on messages;
create policy "Users can view messages in their group"
  on messages for select
  using (true);

-- favorite_resourcesテーブルRLS
alter table favorite_resources enable row level security;
create policy "Users can manage their favorites"
  on favorite_resources
  using (auth.uid() = user_id);

-- download_historyテーブルRLS
alter table download_history enable row level security;
create policy "Users can view their download history"
  on download_history for select
  using (auth.uid() = user_id);
