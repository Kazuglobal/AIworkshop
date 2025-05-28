-- Culture Bridge Program 2025 - Initial Data Population
-- Creates test data for development and demo purposes

-- Insert sample admin user
INSERT INTO public.users (id, email, name, role, country, bio, school) VALUES
(
  'a0000000-0000-4000-8000-000000000001'::uuid,
  'admin@culture-bridge.jp',
  '管理者',
  'admin',
  '日本',
  'Culture Bridge Program 2025の運営管理者',
  'Culture Bridge Organization'
),
(
  'a0000000-0000-4000-8000-000000000002'::uuid,
  'mentor1@culture-bridge.jp',
  'Sarah Johnson',
  'mentor',
  'アメリカ',
  'Hello! I am a university student from California studying International Relations. I love learning about different cultures and languages!',
  'UC Berkeley'
),
(
  'a0000000-0000-4000-8000-000000000003'::uuid,
  'mentor2@culture-bridge.jp',
  'Li Wei',
  'mentor',
  '中国',
  'I am studying Computer Science in Tokyo. I enjoy helping students explore technology and global perspectives.',
  'Tokyo Institute of Technology'
),
(
  'a0000000-0000-4000-8000-000000000004'::uuid,
  'student1@example.jp',
  '田中太郎',
  'student',
  '日本',
  'プログラムを通じて英語力と国際感覚を身につけたいです。',
  '京都工芸繊維大学'
),
(
  'a0000000-0000-4000-8000-000000000005'::uuid,
  'student2@example.jp',
  '佐藤花子',
  'student',
  '日本',
  'SDGsに興味があり、世界の課題について学びたいです。',
  '京都工芸繊維大学'
);

-- Insert sample groups
INSERT INTO public.groups (id, name, theme, mentor_id) VALUES
(
  'b0000000-0000-4000-8000-000000000001'::uuid,
  'Group Alpha',
  'Sustainable Technology',
  'a0000000-0000-4000-8000-000000000002'::uuid
),
(
  'b0000000-0000-4000-8000-000000000002'::uuid,
  'Group Beta',
  'Cultural Exchange through Digital Media',
  'a0000000-0000-4000-8000-000000000003'::uuid
);

-- Insert group members
INSERT INTO public.group_members (group_id, student_id) VALUES
(
  'b0000000-0000-4000-8000-000000000001'::uuid,
  'a0000000-0000-4000-8000-000000000004'::uuid
),
(
  'b0000000-0000-4000-8000-000000000002'::uuid,
  'a0000000-0000-4000-8000-000000000005'::uuid
);

-- Insert sample resources
INSERT INTO public.resources (id, title, url, description, tags, uploaded_by, type) VALUES
(
  'c0000000-0000-4000-8000-000000000001'::uuid,
  'SDGs Introduction Video',
  'https://www.youtube.com/watch?v=5G0ndS3uRdo',
  'United Nations Sustainable Development Goals overview video for beginners',
  ARRAY['SDGs', 'education', 'video', 'beginner'],
  'a0000000-0000-4000-8000-000000000001'::uuid,
  'video'
),
(
  'c0000000-0000-4000-8000-000000000002'::uuid,
  'Cultural Communication Tips',
  'https://example.com/cultural-communication',
  'Best practices for cross-cultural communication in international settings',
  ARRAY['communication', 'culture', 'tips', 'international'],
  'a0000000-0000-4000-8000-000000000002'::uuid,
  'article'
),
(
  'c0000000-0000-4000-8000-000000000003'::uuid,
  'Presentation Template - SDGs',
  'https://example.com/presentation-template',
  'PowerPoint template for SDGs-related presentations',
  ARRAY['presentation', 'template', 'SDGs', 'tools'],
  'a0000000-0000-4000-8000-000000000001'::uuid,
  'document'
),
(
  'c0000000-0000-4000-8000-000000000004'::uuid,
  'Japan Cultural Facts',
  'https://example.com/japan-culture',
  'Essential facts about Japanese culture for international students',
  ARRAY['Japan', 'culture', 'facts', 'reference'],
  'a0000000-0000-4000-8000-000000000003'::uuid,
  'article'
),
(
  'c0000000-0000-4000-8000-000000000005'::uuid,
  'Volunteer Opportunities in Kyoto',
  'https://example.com/kyoto-volunteer',
  'List of volunteer opportunities available in Kyoto for students',
  ARRAY['volunteer', 'Kyoto', 'community', 'service'],
  'a0000000-0000-4000-8000-000000000001'::uuid,
  'article'
);

-- Insert sample works
INSERT INTO public.works (id, user_id, group_id, type, title, content, status) VALUES
(
  'd0000000-0000-4000-8000-000000000001'::uuid,
  'a0000000-0000-4000-8000-000000000004'::uuid,
  'b0000000-0000-4000-8000-000000000001'::uuid,
  'assignment',
  'Day 1: Self Introduction',
  'Hello everyone! My name is Taro Tanaka. I am studying engineering at KIT...',
  'submitted'
),
(
  'd0000000-0000-4000-8000-000000000002'::uuid,
  'a0000000-0000-4000-8000-000000000005'::uuid,
  'b0000000-0000-4000-8000-000000000002'::uuid,
  'assignment',
  'Day 1: Cultural Background',
  'I would like to share about Japanese traditional festivals...',
  'submitted'
);

-- Insert sample feedback
INSERT INTO public.feedback (id, work_id, reviewer_id, comment, score) VALUES
(
  'e0000000-0000-4000-8000-000000000001'::uuid,
  'd0000000-0000-4000-8000-000000000001'::uuid,
  'a0000000-0000-4000-8000-000000000002'::uuid,
  'Great introduction! Your English is very clear. Try to add more details about your hobbies.',
  8
),
(
  'e0000000-0000-4000-8000-000000000002'::uuid,
  'd0000000-0000-4000-8000-000000000002'::uuid,
  'a0000000-0000-4000-8000-000000000003'::uuid,
  'Wonderful cultural insight! I learned a lot about Japanese festivals. Looking forward to more!',
  9
);

-- Insert sample messages for chat
INSERT INTO public.messages (id, group_id, sender_id, content, type) VALUES
(
  'f0000000-0000-4000-8000-000000000001'::uuid,
  'b0000000-0000-4000-8000-000000000001'::uuid,
  'a0000000-0000-4000-8000-000000000002'::uuid,
  'Welcome to Group Alpha! Let''s start by sharing our interests in sustainable technology.',
  'text'
),
(
  'f0000000-0000-4000-8000-000000000002'::uuid,
  'b0000000-0000-4000-8000-000000000001'::uuid,
  'a0000000-0000-4000-8000-000000000004'::uuid,
  'Thank you Sarah! I''m excited to learn about clean energy solutions.',
  'text'
),
(
  'f0000000-0000-4000-8000-000000000003'::uuid,
  'b0000000-0000-4000-8000-000000000002'::uuid,
  'a0000000-0000-4000-8000-000000000003'::uuid,
  'Group Beta, let''s discuss how digital media can bridge cultures!',
  'text'
);

-- Insert sample favorite resources
INSERT INTO public.favorite_resources (user_id, resource_id) VALUES
(
  'a0000000-0000-4000-8000-000000000004'::uuid,
  'c0000000-0000-4000-8000-000000000001'::uuid
),
(
  'a0000000-0000-4000-8000-000000000005'::uuid,
  'c0000000-0000-4000-8000-000000000001'::uuid
),
(
  'a0000000-0000-4000-8000-000000000004'::uuid,
  'c0000000-0000-4000-8000-000000000003'::uuid
);

-- Insert sample download history
INSERT INTO public.download_history (user_id, resource_id) VALUES
(
  'a0000000-0000-4000-8000-000000000004'::uuid,
  'c0000000-0000-4000-8000-000000000003'::uuid
),
(
  'a0000000-0000-4000-8000-000000000005'::uuid,
  'c0000000-0000-4000-8000-000000000004'::uuid
); 