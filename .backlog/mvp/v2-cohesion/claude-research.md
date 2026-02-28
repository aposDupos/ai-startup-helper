# Gepetto Research Notes

## Codebase Research

### 1. Database Schema State (Migrations 001-011)

| # | Migration | Status |
|---|-----------|--------|
| 001 | profiles + projects | ✅ Applied |
| 002 | conversations + messages + ai_logs | ✅ Applied |
| 003 | knowledge_chunks (pgvector) | ✅ Applied |
| 004 | fix handle_new_user trigger | ✅ Applied |
| 005 | embedding webhook | ✅ Applied |
| 006 | progress_data + stage_checklists (20 seed items) | ✅ Applied |
| 007 | lessons | ✅ Applied |
| 008 | pitch_decks | ✅ Applied |
| 008b | increment_xp RPC | ✅ Applied |
| 009 | gamification (achievements, xp_transactions, levels, challenges + 18 seed) | ✅ Applied |
| 010 | knowledge seed | ✅ Applied |
| 011 | project_artifacts | ✅ Applied |

### 2. ARTIFACT_TO_CHECKLIST Mapping Audit

All keys match seed data in `006_progress_stage_checklists.sql`:
- `problem` → `idea/define_problem` ✅
- `target_audience` → `idea/target_audience` ✅  
- `idea_formulation` → `idea/formulate_idea` ✅
- `hypotheses` → `validation/custdev_questions` ✅
- `custdev_results` → `validation/analyze_results` ✅
- `competitors` → `validation/analyze_results` ✅
- `unique_value` → `business_model/fill_vpc` ✅
- `revenue_model` → `business_model/revenue_model` ✅
- `mvp_features` → `mvp/define_features` ✅

**Conclusion**: Key mismatch is NOT the issue. Progress bug is likely:
- Silent catch in `console.warn` hiding a real error
- Missing `revalidatePath('/dashboard')` after server action
- Possible RLS policy blocking the update

### 3. Integration Points Inventory

| Where | What needs wiring |
|-------|------------------|
| `(main)/layout.tsx` | Best place for `updateStreak()` — called on every authenticated page load |
| `Sidebar.tsx` | Needs real user data (level, XP, streak, avatar) — currently hardcoded |
| `chat/page.tsx` | Needs to parse `searchParams.context` and pass to `ChatWindow` |
| `ChatWindow.tsx` | Needs to use `stageContext`/`checklistItemKey` props (already defined but unused) |
| `ContextSwitcher.tsx` | Should be replaced with read-only badge |
| All lesson completions | Need `awardXP()` call |
| All checklist completions | Need `awardXP()` call |
| All artifact saves | Need `awardXP()` call |
| Dashboard load | Need `checkAchievements()` call |

### 4. Entry Points vs Chat Integration

`CreateProjectWidget` sends `?context=` params:
- `idea_search`, `idea_evaluation`, `project_assessment`, `learning`

But `chat/page.tsx` uses Server Component and never reads `searchParams`.
ChatWindow defaults to `(projectStage as StageContext) ?? "general"`.

### 5. Missing Pages

- `/academy` (Sidebar link) → 404. No route exists.
- `/learning/page.tsx` → not created, only `actions.ts`
- `/leaderboard` (Sidebar link) → need to check

### 6. Lesson Personalization

Current lessons are static JSONB content. `LessonContent.tsx` renders:
- heading, paragraph, callout, quiz blocks
- No project context injection

Personalization would require:
- Accept `projectContext` prop in `LessonContent`
- Template variables in JSONB content: `{{project.title}}`, `{{project.problem}}`
- Or: AI-generated contextual examples appended after static content
