# SKILL.md — Devakorn Creator AI (AI Agent Reference)

> This file is written for AI coding agents to understand the project structure, established patterns, and strict conventions. Read this before writing any code.

---

## 1. Project Overview

**Devakorn Creator AI** is a Next.js (App Router) web application that allows Thai/English users to:
- Generate product images via AI (Image Studio)
- Generate video ads (Video Creator)
- Enhance AI prompts (Prompt Magic)
- Build social media campaigns (Campaign Builder)
- Manage coins/wallet (Wallet & Coins)

**Users pay with "Coins"** for each generation. The backend manages coin balances and tracks usage.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Styling | Tailwind CSS (custom config) |
| Auth | NextAuth.js (session-based) |
| Data Fetching | SWR (`useSWR`) for real-time balance |
| Icons | `lucide-react` |
| Language | TypeScript |
| State | React Context API (Language), useState (local) |

---

## 3. Directory Structure (Client)

```
client/src/
├── app/
│   ├── layout.tsx              # Root layout — wraps with LanguageWrapper + AuthProvider
│   ├── page.tsx                # Overview Dashboard
│   ├── prompt-enhancer/page.tsx
│   ├── image-studio/page.tsx
│   ├── video-creator/page.tsx
│   ├── campaign-builder/page.tsx
│   ├── gallery/page.tsx
│   ├── pricing/page.tsx
│   └── profile/page.tsx
├── components/
│   ├── DashboardLayout.tsx     # Layout shell (Sidebar + Header + Footer)
│   ├── Header.tsx              # Top bar with language toggle + coin balance
│   ├── Sidebar.tsx             # Navigation menu
│   ├── Footer.tsx
│   ├── AuthProvider.tsx        # NextAuth session provider
│   └── LanguageWrapper.tsx     # "use client" wrapper for LanguageProvider
└── lib/
    ├── translations.ts         # ALL UI strings — single source of truth
    └── useLanguage.tsx         # React Context: LanguageProvider + useLanguage hook
```

---

## 4. Bilingual System (TH/EN) — Critical Pattern

### Architecture

```
layout.tsx (Server Component)
  └── <LanguageWrapper>        ← client wrapper at ROOT level
        └── <AuthProvider>
              └── {children}   ← every page has access to context
```

**WHY root-level:** Every page component calls `useLanguage()` before rendering `<DashboardLayout>`. If `LanguageProvider` is inside `DashboardLayout`, the hook runs outside the provider and always gets the fallback (TH). Placing it at root fixes this.

### useLanguage Hook

```tsx
import { useLanguage } from '@/lib/useLanguage';

const { t, language, toggleLanguage, setLang } = useLanguage();

// Usage:
t('nav_overview')           // returns 'ภาพรวม' (TH) or 'Overview' (EN)
language                    // 'th' | 'en'
toggleLanguage()            // toggle and persist to localStorage
setLang('en')               // set specific language
```

### Adding New Translations

1. Open `src/lib/translations.ts`
2. Add a new key under the correct section:
```ts
my_new_key: { en: 'English text', th: 'ภาษาไทย' },
```
3. Use in component: `t('my_new_key')`
4. TypeScript will enforce valid keys via `TranslationKey` type

### Translating Dropdown Options

When dropdown `value` must stay English (for API calls) but display should be localized:

```tsx
import type { TranslationKey } from '@/lib/translations';

const STYLE_KEYS: Record<string, TranslationKey> = {
  'Cinematic': 'style_cinematic',
  'Vintage': 'style_vintage',
  // ...
};

// In JSX:
{styleOptions.map(opt => (
  <option key={opt} value={opt}>
    {STYLE_KEYS[opt] ? t(STYLE_KEYS[opt]) : opt}
  </option>
))}
```

**Rule: Never translate the `value` attribute — only translate the displayed text.**

---

## 5. Design Conventions

### Strict Rules
- **No emojis in code files** — UI text, comments, or JSX
- **Dark/Professional aesthetic** — color palette uses `text-dark-bg`, `text-primary-red`, `bg-light-gray`
- **No placeholder images** — generate real assets or use actual data

### Tailwind Custom Colors (defined in tailwind.config)
| Token | Usage |
|---|---|
| `text-dark-bg` | Primary text / headings |
| `text-primary-red` | Accent color (buttons, icons) |
| `bg-light-gray` | Subtle backgrounds |
| `text-text-main` | Body text |

### Component Pattern
All dashboard pages must:
1. Use `"use client"` at the top
2. Wrap content with `<DashboardLayout>`
3. Call `useLanguage()` at the component root
4. Use `useSWR('/api/user/balance', fetcher)` for coin balance
5. Check `isBanned` before allowing generation

```tsx
"use client";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/lib/useLanguage";

export default function MyPage() {
  const { t } = useLanguage();
  const { data: balanceData } = useSWR('/api/user/balance', fetcher, { refreshInterval: 10000 });
  const currentCoins = balanceData?.coinBalance ?? 0;
  const isBanned = balanceData?.isBanned ?? false;

  return (
    <DashboardLayout>
      <h1>{t('my_page_title')}</h1>
    </DashboardLayout>
  );
}
```

---

## 6. API Patterns

### Generation APIs
All AI generation endpoints follow this pattern:
- **Method:** POST
- **Path:** `/api/generate/[type]` (image, video, campaign, prompt)
- **Auth:** Session required
- **Response:** `{ status: 'success', outputUrl: string, remainingCoins: number }`

### Balance API
```
GET /api/user/balance
→ { coinBalance: number, isBanned: boolean }
```
Always call `mutateBalance()` after a successful generation to refresh the UI.

### Assets API
```
GET /api/user/assets
→ { assets: Asset[] } | Asset[]  ← handle both shapes
```

---

## 7. Coin System

- 1 THB = 10 Coins
- Each generation has a fixed cost (defined per page as a constant)
- Always check: `currentCoins < currentCost` before enabling the generate button
- Display pattern: `Generate Image (-{currentCost} Coins)`

---

## 8. Common Gotchas

### SSR / Context Issues
- `localStorage` is only available on the client — always use inside `useEffect`
- `LanguageProvider` uses `"use client"` — do NOT import it directly in Server Components; use `LanguageWrapper.tsx` instead

### SWR Caching
- Use `mutateBalance({ coinBalance: newAmount, isBanned }, false)` for optimistic updates
- Always also call `mutateBalance()` (without args) as a fallback

### Campaign Builder
- Has its own `language` state (output language for AI-generated copy) — do NOT confuse with the UI language from `useLanguage()`
- When importing `useLanguage`, destructure as `{ t }` only to avoid naming collision

### Translation Type Safety
```tsx
import type { TranslationKey } from '@/lib/translations';
// This type is: keyof typeof translations
// TypeScript will error if you pass an invalid key to t()
```

---

## 9. Translation Key Naming Convention

| Prefix | Section |
|---|---|
| `nav_` | Sidebar navigation |
| `overview_` | Dashboard overview page |
| `image_` | Image Studio |
| `video_` | Video Creator |
| `prompt_` | Prompt Enhancer |
| `campaign_` | Campaign Builder |
| `profile_` | Profile page |
| `wallet_` | Wallet & Pricing |
| `general_` | Shared/reusable strings |
| `cat_` | Category chip labels (shared) |
| `tone_` | Tone options (prompt enhancer) |
| `len_` | Length options (prompt enhancer) |
| `style_` | Style dropdown options |
| `cam_` | Camera angle options |
| `light_` | Lighting options |
| `pres_` | Presenter options |
| `camp_tone_` | Campaign tone options |
| `obj_` | Campaign objective options |
| `vcat_` | Video category options |

---

## 10. Adding a New Page (Checklist)

- [ ] Create `src/app/[page-name]/page.tsx` with `"use client"`
- [ ] Wrap in `<DashboardLayout>`
- [ ] Add `useLanguage()` hook
- [ ] Add translation keys under appropriate prefix in `translations.ts`
- [ ] Add navigation entry in `Sidebar.tsx` using `t('nav_xxx')`
- [ ] Verify the page renders correctly in both TH and EN
