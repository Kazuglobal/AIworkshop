-- favorite_resourcesテーブルのRLSポリシー修正
-- 古いポリシーを削除
drop policy if exists "Users can manage their favorites" on favorite_resources;

-- 詳細なポリシーを作成
create policy "Users can select their favorites"
  on favorite_resources for select
  using (auth.uid() = user_id);

create policy "Users can insert their favorites"
  on favorite_resources for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their favorites"
  on favorite_resources for delete
  using (auth.uid() = user_id);

-- download_historyテーブルのRLSポリシーも修正
drop policy if exists "Users can view their download history" on download_history;

create policy "Users can select their download history"
  on download_history for select
  using (auth.uid() = user_id);

create policy "Users can insert their download history"
  on download_history for insert
  with check (auth.uid() = user_id); 