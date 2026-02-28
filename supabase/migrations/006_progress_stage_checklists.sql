-- Migration 006: progress_data, team_members + stage_checklists
-- Sprint 03: Guided Journey

-- ============================================================
-- ALTER projects: add progress_data + team_members
-- ============================================================

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS progress_data JSONB DEFAULT '{}';

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS team_members JSONB DEFAULT '[]';

-- ============================================================
-- STAGE CHECKLISTS — reference checklist items per stage
-- ============================================================

CREATE TABLE IF NOT EXISTS public.stage_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage TEXT NOT NULL CHECK (stage = ANY (ARRAY['idea', 'validation', 'business_model', 'mvp', 'pitch'])),
  item_key TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  linked_lesson_id UUID,
  linked_tool TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (stage, item_key)
);

ALTER TABLE public.stage_checklists ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read checklists (reference data)
CREATE POLICY "Authenticated users can read stage_checklists"
  ON public.stage_checklists FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================
-- SEED DATA: 5 stages × 3-5 items ≈ 20 items
-- ============================================================

INSERT INTO public.stage_checklists (stage, item_key, label, description, linked_tool, sort_order) VALUES
  -- IDEA stage
  ('idea', 'define_problem', 'Определить проблему', 'Опиши, какую проблему ты хочешь решить. Для кого? Почему это важно?', NULL, 1),
  ('idea', 'target_audience', 'Описать целевую аудиторию', 'Кто твои потенциальные пользователи? Возраст, город, привычки.', NULL, 2),
  ('idea', 'formulate_idea', 'Сформулировать идею', 'Одним предложением опиши своё решение проблемы.', NULL, 3),
  ('idea', 'ice_score', 'Оценить идею (ICE Score)', 'Используй AI для оценки Impact, Confidence, Ease.', NULL, 4),
  ('idea', 'save_idea', 'Сохранить идею в проект', 'Зафиксируй идею — она станет основой для дальнейшей работы.', NULL, 5),

  -- VALIDATION stage
  ('validation', 'custdev_questions', 'Составить вопросы для CustDev', 'Подготовь 5-10 вопросов для интервью с потенциальными клиентами.', NULL, 1),
  ('validation', 'conduct_interviews', 'Провести 3+ интервью', 'Поговори с реальными людьми из целевой аудитории.', NULL, 2),
  ('validation', 'analyze_results', 'Проанализировать результаты', 'Запиши инсайты: что подтвердилось, что нет, что удивило.', NULL, 3),
  ('validation', 'pivot_or_proceed', 'Решить: pivot или продолжать', 'На основе данных реши — менять направление или двигаться дальше.', NULL, 4),

  -- BUSINESS MODEL stage
  ('business_model', 'fill_bmc', 'Заполнить Business Model Canvas', 'Заполни все 9 блоков BMC с помощью AI-подсказок.', 'bmc', 1),
  ('business_model', 'fill_vpc', 'Заполнить Value Proposition Canvas', 'Опиши ценностное предложение: Jobs, Pains, Gains.', 'vpc', 2),
  ('business_model', 'unit_economics', 'Рассчитать юнит-экономику', 'Посчитай CAC, LTV, Payback Period.', 'unit_economics', 3),
  ('business_model', 'revenue_model', 'Выбрать модель монетизации', 'Подписка, freemium, marketplace fee — обсуди с AI.', NULL, 4),

  -- MVP stage
  ('mvp', 'define_features', 'Определить MVP-фичи', 'Выбери минимальный набор функций для первой версии.', NULL, 1),
  ('mvp', 'create_prototype', 'Создать прототип', 'Нарисуй wireframes или no-code прототип.', NULL, 2),
  ('mvp', 'test_prototype', 'Протестировать прототип', 'Покажи прототип 3+ потенциальным пользователям.', NULL, 3),
  ('mvp', 'iterate', 'Итерировать по фидбеку', 'Внеси изменения на основе обратной связи.', NULL, 4),

  -- PITCH stage
  ('pitch', 'create_pitch_deck', 'Создать питч-дек', 'Подготовь презентацию на 10-12 слайдов.', 'pitch_deck', 1),
  ('pitch', 'practice_pitch', 'Отрепетировать питч', 'Попроси AI дать фидбек на твой питч.', NULL, 2),
  ('pitch', 'financial_projections', 'Подготовить финмодель', 'Простой прогноз доходов/расходов на 12 месяцев.', NULL, 3)
ON CONFLICT (stage, item_key) DO NOTHING;
