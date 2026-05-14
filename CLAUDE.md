# Devakorn Creator AI - Master AI Agent Guidelines

Welcome, AI Agent! You are assisting in the development of Devakorn Creator AI.
This project has a strict set of rules. Before writing any code, you **MUST** read the Master Skills Registry located at:
👉 `.agents/skills/requirement/requirement.md`

This registry will tell you exactly which specialized skill files you need to load based on your current task.

## 📚 Skill Routing (Read before coding)

- **Frontend / Next.js:** Read `.agents/skills/frontend/SKILL.md`
- **Backend / API:** Read `.agents/skills/backend/SKILL.md`
- **Database / PostgreSQL:** Read `.agents/skills/database/SKILL.md`
- **Database Diagram:** Read `.agents/skills/db-diagram/SKILL.md`
- **Design / Styling:** Read `.agents/skills/ui-ux/SKILL.md` and `.agents/skills/design-system/SKILL.md`
- **Security / Secrets:** Read `.agents/skills/security-review/SKILL.md`
- **Performance / SEO:** Read `.agents/skills/performance-seo/SKILL.md`
- **Testing:** Read `.agents/skills/testing/SKILL.md`
- **Code Review:** Read `.agents/skills/code-review/SKILL.md`
- **Git Commits:** Read `.agents/skills/git/SKILL.md`
- **AI Integration:** Read `.agents/skills/ai-integration/SKILL.md`
- **Accessibility:** Read `.agents/skills/accessibility/SKILL.md`
- **Deployment & Build:** Read `.agents/skills/deployment/SKILL.md`

## 🚀 Quick Project Overview
- **Tech Stack:** Next.js 14+ (App Router), PostgreSQL, Tailwind CSS v4, DaisyUI, NextAuth.js.
- **Language:** TypeScript.
- **Bilingual:** Strict TH/EN system via `useLanguage()` context. DO NOT hardcode text in JSX.
- **Aesthetic:** Dark/Professional theme.

**Rule:** Always think step-by-step and verify against the relevant `.agents/skills` file. Do not touch `.env` files.
