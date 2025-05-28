-- ユーザーロール管理機能のためのスキーマ更新

-- 1. usersテーブルのroleカラムを適切な型に変更
alter table users 
drop column if exists role;

-- ロール用のENUM型を作成
create type user_role as enum ('student', 'international_student', 'admin', 'school');

-- roleカラムを追加（デフォルトはstudent）
alter table users 
add column role user_role default 'student';

-- 2. usersテーブルに不足しているカラムを追加
alter table users 
add column if not exists avatar_url text,
add column if not exists school_id uuid,
add column if not exists group_id uuid;

-- 3. groupsテーブルの構造を型定義に合わせて修正
alter table groups 
drop column if exists mentor_id,
drop column if exists theme,
drop column if exists description;

alter table groups 
add column if not exists international_student_id uuid references users(id);

-- 4. worksテーブルの構造を型定義に合わせて修正
alter table works 
drop column if exists group_id,
drop column if exists type,
drop column if exists deadline,
drop column if exists submitted_at;

alter table works 
add column if not exists file_url text,
add column if not exists image_url text,
add column if not exists day integer not null default 1;

-- statusカラムの値を統一
update works set status = 'draft' where status = 'pending';

-- 5. resourcesテーブルの構造を修正
alter table resources 
drop column if exists uploaded_by,
drop column if exists tags;

alter table resources 
add column if not exists content text not null default '',
add column if not exists user_id uuid references users(id),
add column if not exists tags text[] default array[]::text[];

-- typeカラムの値を統一
create type resource_type as enum ('link', 'pdf', 'image', 'video', 'other');
alter table resources 
alter column type type resource_type using type::resource_type;

-- 6. messagesテーブルの構造を修正
alter table messages 
drop column if exists type;

alter table messages 
add column if not exists receiver_id uuid references users(id),
add column if not exists is_read boolean default false;

-- 7. RLSポリシーの更新

-- usersテーブル: 自分の情報は見れる、管理者は全て見れる
drop policy if exists "Users can view their own data" on users;
create policy "Users can view their own data"
  on users for select
  using (auth.uid() = id or exists (
    select 1 from users where id = auth.uid() and role = 'admin'
  ));

create policy "Users can update their own data"
  on users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 管理者のみユーザー作成・削除可能
create policy "Admins can insert users"
  on users for insert
  with check (exists (
    select 1 from users where id = auth.uid() and role = 'admin'
  ));

create policy "Admins can delete users"
  on users for delete
  using (exists (
    select 1 from users where id = auth.uid() and role = 'admin'
  ));

-- groupsテーブル: 全員が閲覧可能、管理者のみ編集可能
drop policy if exists "Users can view groups" on groups;
create policy "Users can view groups"
  on groups for select
  using (true);

create policy "Admins can manage groups"
  on groups for all
  using (exists (
    select 1 from users where id = auth.uid() and role = 'admin'
  ));

-- worksテーブル: 自分のワークと関連するワークのみ閲覧・編集可能
create policy "Users can view their own works"
  on works for select
  using (
    auth.uid() = user_id or 
    exists (
      select 1 from users where id = auth.uid() and role in ('admin', 'international_student')
    )
  );

create policy "Users can manage their own works"
  on works for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- resourcesテーブル: 全員が閲覧可能、作成者と管理者が編集可能
drop policy if exists "Users can view resources" on resources;
create policy "Users can view resources"
  on resources for select
  using (true);

create policy "Users can manage their own resources"
  on resources for all
  using (auth.uid() = user_id or exists (
    select 1 from users where id = auth.uid() and role = 'admin'
  ))
  with check (auth.uid() = user_id or exists (
    select 1 from users where id = auth.uid() and role = 'admin'
  ));

-- feedbackテーブル: 関連するユーザーのみ閲覧可能
drop policy if exists "Users can view feedback for their works" on feedback;
create policy "Users can view relevant feedback"
  on feedback for select
  using (
    auth.uid() = reviewer_id or 
    exists (select 1 from works where id = work_id and user_id = auth.uid()) or
    exists (select 1 from users where id = auth.uid() and role = 'admin')
  );

create policy "International students and admins can create feedback"
  on feedback for insert
  with check (exists (
    select 1 from users where id = auth.uid() and role in ('international_student', 'admin')
  ));

-- messagesテーブル: グループメンバーのみ閲覧・送信可能
drop policy if exists "Users can view messages in their group" on messages;
create policy "Users can view group messages"
  on messages for select
  using (
    auth.uid() = sender_id or 
    auth.uid() = receiver_id or
    exists (
      select 1 from users 
      where id = auth.uid() and group_id = messages.group_id
    ) or
    exists (
      select 1 from users where id = auth.uid() and role = 'admin'
    )
  );

create policy "Users can send messages"
  on messages for insert
  with check (auth.uid() = sender_id);

create policy "Users can update their messages"
  on messages for update
  using (auth.uid() = sender_id or auth.uid() = receiver_id); 