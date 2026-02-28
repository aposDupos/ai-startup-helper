# V2 Cohesion: Section Index

## SECTION_MANIFEST
- sprint-06: Critical Fixes (4 tasks)
- sprint-07: Gamification Wiring (4 tasks)
- sprint-08: Learning & Navigation (4 tasks)
- sprint-09: Smart Chat (4 tasks)
- sprint-10: Celebrations & Feedback (4 tasks)
- sprint-11: Lesson Personalization (3 tasks)
- sprint-12: CustDev Simulator + Scorecard (3 tasks)
- sprint-13: Social: Peer Review & Gallery (4 tasks)
- sprint-14: Social: Teams & Challenges (4 tasks)
- sprint-15: Daily Quest & Polish (5 tasks)

**Total: 10 sprints, 39 tasks**

## Dependency Graph

```
S06 → S07 → S08 → S09 → S10 → S11 → S12 → S13 → S14 → S15
```

## Sprint Files

| Sprint | File | Tasks |
|--------|------|-------|
| S06 | `.backlog/sprints/sprint-06/tasks.md` | S06-001..S06-004 |
| S07 | `.backlog/sprints/sprint-07/tasks.md` | S07-001..S07-004 |
| S08 | `.backlog/sprints/sprint-08/tasks.md` | S08-001..S08-004 |
| S09 | `.backlog/sprints/sprint-09/tasks.md` | S09-001..S09-004 |
| S10 | `.backlog/sprints/sprint-10/tasks.md` | S10-001..S10-004 |
| S11 | `.backlog/sprints/sprint-11/tasks.md` | S11-001..S11-003 |
| S12 | `.backlog/sprints/sprint-12/tasks.md` | S12-001..S12-003 |
| S13 | `.backlog/sprints/sprint-13/tasks.md` | S13-001..S13-004 |
| S14 | `.backlog/sprints/sprint-14/tasks.md` | S14-001..S14-004 |
| S15 | `.backlog/sprints/sprint-15/tasks.md` | S15-001..S15-005 |

## Migrations Plan

| Migration | Sprint | Tables |
|-----------|--------|--------|
| 012_lesson_types.sql | S08 | ALTER lessons (type, estimated_minutes) |
| 013_scorecard.sql | S12 | ALTER projects (scorecard), scorecard_history |
| 014_social.sql | S13 | ALTER projects (is_public), review_requests, reviews, project_reactions |
| 015_teams.sql | S14 | ALTER profiles (skills, bio), discussions, discussion_replies, discussion_votes, study_groups, study_group_members |
| 016_daily_quests.sql | S15 | daily_quests, streak_freezes |
