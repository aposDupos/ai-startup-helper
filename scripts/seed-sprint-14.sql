-- Sprint 14: Seed Data for Social Features
-- Run AFTER 017_teams_social.sql migration
-- Requires test users from previous seed (Sprint 13)

-- ============================================================
-- 1. Matching Profiles (update existing users)
-- ============================================================
UPDATE profiles SET
  skills = ARRAY['dev', 'product'],
  looking_for_cofounder = true,
  bio = 'Fullstack-разработчик, ищу маркетолога или дизайнера для EdTech-стартапа'
WHERE id = '750f1be8-07e0-4ea8-8533-b077a5089c7d';

UPDATE profiles SET
  skills = ARRAY['design'],
  looking_for_cofounder = true,
  bio = 'UI/UX дизайнер, хочу создать приложение для доставки домашней еды'
WHERE id = '43b9e12d-f14a-4b32-ac3e-6919fe63da1b';

UPDATE profiles SET
  skills = ARRAY['dev', 'product'],
  looking_for_cofounder = true,
  bio = 'React/Node разработчик с опытом в финтехе, ищу бизнес-партнёра'
WHERE id = 'bbc25046-97d2-401f-89c7-88c922179970';

UPDATE profiles SET
  skills = ARRAY['sales', 'marketing'],
  looking_for_cofounder = true,
  bio = 'Опыт в B2B продажах и маркетинге, ищу технического со-основателя для AI-стартапа'
WHERE id = '5bd75881-ab27-4bed-9492-841cba179528';

UPDATE profiles SET
  skills = ARRAY['marketing', 'finance'],
  looking_for_cofounder = false,
  bio = 'Только начинаю, пока изучаю стартапы'
WHERE id = 'd3b72209-5e7b-4955-bd1c-fd6ef8cbc2b3';

UPDATE profiles SET
  skills = ARRAY['dev', 'design'],
  looking_for_cofounder = true,
  bio = 'Школьник, делаю игры на Unity. Ищу друзей для стартапа в геймдеве!'
WHERE id = 'ce94855e-aaec-46f7-bec9-058543cc72d9';

UPDATE profiles SET
  skills = ARRAY['dev', 'product'],
  looking_for_cofounder = true,
  bio = 'Строю маркетплейс для репетиторов, ищу маркетолога'
WHERE id = 'fe2db2a8-8331-4d4f-8ae8-23e07e5a8b06';

-- ============================================================
-- 2. Discussions
-- ============================================================
INSERT INTO discussions (author_id, stage, title, body, created_at) VALUES
('5bd75881-ab27-4bed-9492-841cba179528'::uuid, 'pitch', 'Как подготовиться к Demo Day?', 'Через 2 недели у нас Demo Day в акселераторе. Какие советы по подготовке питча? На что обращают внимание инвесторы?', now() - interval '3 days'),
('bbc25046-97d2-401f-89c7-88c922179970'::uuid, 'mvp', 'Сколько фич нужно в MVP?', 'Работаю над финансовым трекером. Хочу добавить кучу фич, но понимаю что надо урезать. Как определить минимальный набор для первых пользователей?', now() - interval '2 days'),
('750f1be8-07e0-4ea8-8533-b077a5089c7d'::uuid, 'business_model', 'Freemium vs подписка — что лучше?', 'Делаю AI-ассистента для студентов. Не могу определиться с моделью монетизации. У кого есть опыт с freemium? Какой % конвертится в платных?', now() - interval '1 day'),
('43b9e12d-f14a-4b32-ac3e-6919fe63da1b'::uuid, 'idea', 'Как валидировать идею без кода?', 'У меня идея сервиса доставки домашней еды. Как проверить спрос до написания кода? Лендинг + формы? Интервью?', now() - interval '12 hours'),
('ce94855e-aaec-46f7-bec9-058543cc72d9'::uuid, 'validation', 'Мои первые CustDev-интервью 🎉', E'Провёл 5 интервью с геймерами! Вот что узнал:\n1. Все хотят персональные тренировки\n2. Готовы платить 500-1000₽/мес\n3. Главный конкурент — YouTube\n\nКто ещё делал CustDev? Поделитесь опытом!', now() - interval '6 hours'),
('fe2db2a8-8331-4d4f-8ae8-23e07e5a8b06'::uuid, 'general', 'Какие книги посоветуете начинающему?', 'Только начал путь в стартапах. Прочитал "Lean Startup", но хочу больше. Что ещё стоит прочитать?', now() - interval '4 hours');

-- Replies
INSERT INTO discussion_replies (discussion_id, author_id, body, created_at)
SELECT d.id, 'bbc25046-97d2-401f-89c7-88c922179970'::uuid, 'Главное — рассказать историю, а не фичи. Начни с проблемы, покажи размер рынка, потом решение.', d.created_at + interval '2 hours'
FROM discussions d WHERE d.title = 'Как подготовиться к Demo Day?';

INSERT INTO discussion_replies (discussion_id, author_id, body, created_at)
SELECT d.id, 'ce94855e-aaec-46f7-bec9-058543cc72d9'::uuid, 'Я бы начал с 3-5 core фич. Если люди их используют каждый день — ты на верном пути.', d.created_at + interval '3 hours'
FROM discussions d WHERE d.title = 'Сколько фич нужно в MVP?';

INSERT INTO discussion_replies (discussion_id, author_id, body, created_at)
SELECT d.id, '5bd75881-ab27-4bed-9492-841cba179528'::uuid, 'У нас конверсия из free в paid — 4%. Для студентов freemium отлично работает, т.к. у них мало денег, а вирусность бесплатного плана компенсирует.', d.created_at + interval '5 hours'
FROM discussions d WHERE d.title = 'Freemium vs подписка — что лучше?';

INSERT INTO discussion_replies (discussion_id, author_id, body, created_at)
SELECT d.id, '750f1be8-07e0-4ea8-8533-b077a5089c7d'::uuid, 'Крутой результат с CustDev! 💪 Попробуй ещё quantitative survey — закинь Google Form в геймерские сообщества.', d.created_at + interval '1 hour'
FROM discussions d WHERE d.title LIKE 'Мои первые CustDev%';

INSERT INTO discussion_replies (discussion_id, author_id, body, created_at)
SELECT d.id, '43b9e12d-f14a-4b32-ac3e-6919fe63da1b'::uuid, '"Мама-тест" (The Mom Test) — обязательно! Научит правильно проводить интервью.', d.created_at + interval '30 minutes'
FROM discussions d WHERE d.title LIKE 'Какие книги%';

INSERT INTO discussion_replies (discussion_id, author_id, body, created_at)
SELECT d.id, 'bbc25046-97d2-401f-89c7-88c922179970'::uuid, '"Zero to One" Питера Тиля — про уникальность. И "Running Lean" — практическое руководство.', d.created_at + interval '1 hour'
FROM discussions d WHERE d.title LIKE 'Какие книги%';

-- Upvotes
INSERT INTO discussion_votes (user_id, discussion_id)
SELECT 'bbc25046-97d2-401f-89c7-88c922179970'::uuid, d.id FROM discussions d WHERE d.title LIKE 'Мои первые CustDev%';

INSERT INTO discussion_votes (user_id, discussion_id)
SELECT '750f1be8-07e0-4ea8-8533-b077a5089c7d'::uuid, d.id FROM discussions d WHERE d.title LIKE 'Мои первые CustDev%';

INSERT INTO discussion_votes (user_id, discussion_id)
SELECT '5bd75881-ab27-4bed-9492-841cba179528'::uuid, d.id FROM discussions d WHERE d.title = 'Freemium vs подписка — что лучше?';

INSERT INTO discussion_votes (user_id, discussion_id)
SELECT 'fe2db2a8-8331-4d4f-8ae8-23e07e5a8b06'::uuid, d.id FROM discussions d WHERE d.title = 'Как подготовиться к Demo Day?';

INSERT INTO discussion_votes (user_id, discussion_id)
SELECT '43b9e12d-f14a-4b32-ac3e-6919fe63da1b'::uuid, d.id FROM discussions d WHERE d.title = 'Как подготовиться к Demo Day?';

-- ============================================================
-- 3. Study Groups
-- ============================================================
INSERT INTO study_groups (name, current_stage, created_by) VALUES
('EdTech Founders 🚀', 'business_model', '750f1be8-07e0-4ea8-8533-b077a5089c7d'::uuid),
('Геймдев-команда', 'validation', 'ce94855e-aaec-46f7-bec9-058543cc72d9'::uuid),
('Финтех-когорта', 'mvp', 'bbc25046-97d2-401f-89c7-88c922179970'::uuid);

-- Members
INSERT INTO study_group_members (group_id, user_id)
SELECT g.id, '750f1be8-07e0-4ea8-8533-b077a5089c7d'::uuid FROM study_groups g WHERE g.name = 'EdTech Founders 🚀';
INSERT INTO study_group_members (group_id, user_id)
SELECT g.id, '43b9e12d-f14a-4b32-ac3e-6919fe63da1b'::uuid FROM study_groups g WHERE g.name = 'EdTech Founders 🚀';
INSERT INTO study_group_members (group_id, user_id)
SELECT g.id, 'fe2db2a8-8331-4d4f-8ae8-23e07e5a8b06'::uuid FROM study_groups g WHERE g.name = 'EdTech Founders 🚀';

INSERT INTO study_group_members (group_id, user_id)
SELECT g.id, 'ce94855e-aaec-46f7-bec9-058543cc72d9'::uuid FROM study_groups g WHERE g.name = 'Геймдев-команда';
INSERT INTO study_group_members (group_id, user_id)
SELECT g.id, 'd3b72209-5e7b-4955-bd1c-fd6ef8cbc2b3'::uuid FROM study_groups g WHERE g.name = 'Геймдев-команда';

INSERT INTO study_group_members (group_id, user_id)
SELECT g.id, 'bbc25046-97d2-401f-89c7-88c922179970'::uuid FROM study_groups g WHERE g.name = 'Финтех-когорта';
INSERT INTO study_group_members (group_id, user_id)
SELECT g.id, '5bd75881-ab27-4bed-9492-841cba179528'::uuid FROM study_groups g WHERE g.name = 'Финтех-когорта';
INSERT INTO study_group_members (group_id, user_id)
SELECT g.id, '750f1be8-07e0-4ea8-8533-b077a5089c7d'::uuid FROM study_groups g WHERE g.name = 'Финтех-когорта';

-- ============================================================
-- 4. Challenge Participation
-- ============================================================
INSERT INTO user_challenges (user_id, challenge_id, status, progress)
SELECT '5bd75881-ab27-4bed-9492-841cba179528'::uuid, id, 'active', '{"current": 0}'::jsonb FROM challenges WHERE title LIKE 'Заполни BMC%';

INSERT INTO user_challenges (user_id, challenge_id, status, progress)
SELECT 'bbc25046-97d2-401f-89c7-88c922179970'::uuid, id, 'active', '{"current": 2}'::jsonb FROM challenges WHERE title LIKE 'Пройди 3 урока%';

INSERT INTO user_challenges (user_id, challenge_id, status, progress)
SELECT '750f1be8-07e0-4ea8-8533-b077a5089c7d'::uuid, id, 'active', '{"current": 1}'::jsonb FROM challenges WHERE title LIKE 'Пройди 3 урока%';

INSERT INTO user_challenges (user_id, challenge_id, status, progress, completed_at)
SELECT 'ce94855e-aaec-46f7-bec9-058543cc72d9'::uuid, id, 'completed', '{"current": 1}'::jsonb, now() - interval '1 day' FROM challenges WHERE title LIKE 'Проведи AI CustDev%';

INSERT INTO user_challenges (user_id, challenge_id, status, progress)
SELECT 'fe2db2a8-8331-4d4f-8ae8-23e07e5a8b06'::uuid, id, 'active', '{"current": 2}'::jsonb FROM challenges WHERE title LIKE 'Получи 3 реакции%';

INSERT INTO user_challenges (user_id, challenge_id, status, progress)
SELECT '5bd75881-ab27-4bed-9492-841cba179528'::uuid, id, 'active', '{"current": 3}'::jsonb FROM challenges WHERE title LIKE 'Streak Master%';
