---
description: How to execute development tasks from the sprint backlog. Use when user says "сделай задачу", "сделай спринт", "do task", "do sprint", or references task IDs like S01-003.
---

# Dev Task Workflow

// turbo-all

## Finding the Task

1. Parse the user's request to identify the task:
   - **By sprint**: "сделай спринт 1" → read `.backlog/sprints/sprint-01/tasks.md`
   - **By task ID**: "сделай S01-003" → find task S01-003 in sprint-01/tasks.md
   - **By description**: "сделай онбординг" → search sprint tasks for matching description

2. Read the task file to understand requirements:
   ```
   .backlog/sprints/sprint-{NN}/tasks.md
   ```

3. Read the corresponding implementation section for full context:
   ```
   .backlog/mvp/v1/sections/section-{NN}-*.md
   ```

## Before Coding

4. Read the design system skill:
   ```
   .agent/skills/startup-copilot-design/SKILL.md
   ```

5. Check prerequisites in `.backlog/sprints/prerequisites.md` — are required API keys and services set up?

6. Check if the task has dependencies (listed in the task). If a dependency task is not `[x]` completed, notify the user.

## Executing the Task

7. Create a task boundary with the task name and begin working.

8. Follow the task's acceptance criteria exactly. Each criterion = one thing to verify.

9. After completing a task, mark it as `[x]` in the sprint's `tasks.md`.

10. If executing a full sprint, work through tasks **in order** (they are dependency-sorted).

## Database & Infrastructure (do it yourself!)

> **CRITICAL**: Always handle database operations yourself. Never leave them as "manual steps" for the user.

### Migrations
11. If a task requires a SQL migration:
    - Write the `.sql` file to `supabase/migrations/`
    - **Apply it immediately** via `mcp_supabase-mcp-server_apply_migration` tool
    - Supabase project ID: `oefchksvlfercftztfkn`
    - Verify the migration applied successfully

### Seed Data
12. If a task requires seeding data:
    - Write a seed script to `scripts/` (optional, for documentation)
    - **Execute the SQL directly** via `mcp_supabase-mcp-server_execute_sql` tool
    - Do NOT rely on `npx tsx scripts/seed-*.ts` — there is no `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
    - Always verify the data was inserted: `SELECT count(*) FROM ...`

### RPC Functions
13. If a task requires Postgres functions/RPCs:
    - Apply via `mcp_supabase-mcp-server_apply_migration` with a descriptive name
    - Example: `increment_xp`, `check_achievement`, etc.

### Dependencies
14. If new npm packages are needed:
    - Install via `npm install <package>` immediately
    - Don't just list them — run the install command

## After Completing

15. Run `npx next build` to verify everything compiles.

16. Cross-check ALL acceptance criteria from the task — don't just check file creation, verify integration too (e.g., components wired into pages, data flowing through props).

17. Notify the user with:
    - Summary of completed tasks
    - How users navigate to new features
    - Any follow-up recommendations

## Task ID Format

- `S01-001` = Sprint 01, Task 001
- `S02-005` = Sprint 02, Task 005
- Tasks are numbered within each sprint as 3-digit IDs

## Supabase Quick Reference

- **Project ID**: `oefchksvlfercftztfkn`
- **Migrations tool**: `mcp_supabase-mcp-server_apply_migration`
- **SQL tool**: `mcp_supabase-mcp-server_execute_sql`
- **No service role key** in `.env.local` — always use MCP tools for admin operations
