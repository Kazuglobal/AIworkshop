-- サンプルリソースデータを追加
insert into resources (id, title, url, description, tags, type) values
  ('11111111-1111-1111-1111-111111111111', 'Culture Bridge Program Overview', 'https://example.com/overview', 'Culture Bridge Program 2025の概要資料です', array['文化交流', 'プログラム概要'], 'document'),
  ('22222222-2222-2222-2222-222222222222', 'SDGs学習資料', 'https://example.com/sdgs', 'SDGsの基本的な学習資料です', array['SDGs', '持続可能な開発'], 'article'),
  ('33333333-3333-3333-3333-333333333333', '日本文化紹介動画', 'https://example.com/japan', '日本文化を紹介する動画コンテンツです', array['日本文化', '動画'], 'video'),
  ('44444444-4444-4444-4444-444444444444', 'ボランティア活動ガイド', 'https://example.com/volunteer', 'ボランティア活動の始め方ガイドです', array['ボランティア', 'ガイド'], 'guide'),
  ('55555555-5555-5555-5555-555555555555', 'プレゼンテーション技術', 'https://example.com/presentation', '効果的なプレゼンテーション技術について学びます', array['プレゼンテーション', 'スキル'], 'tutorial'); 