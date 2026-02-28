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

## After Completing

11. Run verification commands listed in the task (if any): lint, type-check, build, tests.

12. Notify the user with a summary of what was done and which tasks are completed.

## Task ID Format

- `S01-001` = Sprint 01, Task 001
- `S02-005` = Sprint 02, Task 005
- Tasks are numbered within each sprint as 3-digit IDs
