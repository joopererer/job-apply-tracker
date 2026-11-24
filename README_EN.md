# FR Job Tracker 🇫🇷

> A modern job search radar tailored for international students and engineers in France · Zero-Token Local Deterministic Scraper · 3-Tier Intelligent Deduplication · Multi-User Supabase RLS Data Isolation · Mobile PWA Web Share Target Direct Logging · Flash Pre-screening Call Emergency Lookup

[English](README_EN.md) | [中文](README.md)

![Next.js](https://img.shields.io/badge/Next.js-16.4-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)
![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_RLS-3ecf8e.svg)
![Chrome Extension](https://img.shields.io/badge/Chrome_Extension-Manifest_V3-yellow.svg)
![PWA](https://img.shields.io/badge/PWA-Web_Share_Target-purple.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

---

## 💡 Why FR Job Tracker?

When job hunting in France (CDI, CDD, Stage, Alternance), applying to a large volume of positions is often unavoidable, but candidates consistently face three major hurdles:

1. **Duplicate Application Blunders**: The same role is frequently posted across multiple job boards with varied descriptions. Accidentally applying to the same team or department multiple times leaves an unprofessional impression with French recruiters.
2. **Surprise HR Pre-Screening Calls**: Recruiters in France frequently call without prior appointment (the classic *RH Pre-screening Call*). On the spot, they mention a company name or just a job title — and you struggle to recall what you applied for, what salary you asked, or what stack was on the job description.
3. **Cumbersome Tracking & Disconnected Devices**: Maintaining spreadsheets is tedious. When browsing job boards on your phone, you cannot bookmark positions into your tracker in one tap. Commercial tools often charge high fees for slow LLM token consumption.

**FR Job Tracker** solves these challenges end-to-end:
- **Zero-Token Local Regex/DOM Engine**: Instant page extraction and normalization without consuming third-party API tokens.
- **3-Tier Deduplication (L1 / L2 / L3)**: Accurately identifies identical job postings or similar positions within the same company, preventing awkward duplicate applications.
- **Multi-User Isolation via PostgreSQL RLS**: Whether self-hosted or using a shared deployment, every candidate's application history remains strictly private.
- **Cross-Platform Workflow (Web + Chrome Extension + Mobile PWA Share)**: Save with one click from Chrome on desktop or via native system sharing from LinkedIn/Indeed apps on your phone.

---

## ✨ Core Features

### 1. ⚡ Zero-Token Deterministic Scraper Engine
- **Deeply adapted for leading French job portals**:
  - **Indeed France**: Seamlessly supports single-column detail pages (`/viewjob`), two-column split views, and floating headers.
  - **LinkedIn France**: Overcomes LinkedIn's obfuscated CSS class names and dynamic DOM structures with 100% stable extraction.
  - **Apec**, **HelloWork**, **Welcome to the Jungle (WTTJ)**, **JobTeaser**, and more.
- **Precise Data Cleaning & Normalization**: Automatically strips title noise (such as `(H/F)`, `(M/F/D)`, `CDI/CDD`), normalizes salary brackets, extracts departments/cities (Paris 75, 92, Île-de-France, etc.), contract types (CDI, CDD, Stage, Alternance, Freelance), and workplace modes (On-site / Hybrid / Remote).

### 2. 🛡️ 3-Tier Multi-Dimensional Deduplication
- **L1 External Job ID Match**: Sub-second exact matching against historical records using platform job IDs or clean URLs.
- **L2 Normalized Feature Hash Match**: Generates a deterministic SHA/feature hash from normalized company and job title strings, catching duplicates even if the URL changes.
- **L3 Fuzzy Similarity & Same-Team Warning**: Scans historical applications for recent submissions to the same company (e.g., within 30 days). Alerts the candidate with the previous submission date and status before applying again.

### 3. 🔐 Multi-User Architecture with Supabase Row Level Security (RLS)
- Driven by Supabase Auth with strict PostgreSQL **Row Level Security (RLS)** (`auth.uid() = user_id`) enabled across all tables.
- Supports email/password sign-up and sign-in with silent JWT token refresh.
- Comprehensive account management: change password, clear personal application history (with confirmation), or permanently delete account.

### 4. 📊 High-Density Dashboard & Core Metrics
- **Reply Rate**: Percentage of processed applications (interview, tech test, offer, rejection) out of active submissions (excluding saved and pending applied roles).
- **Pass Rate**: Percentage of applications successfully advancing to HR calls, technical interviews, or offers (excluding saved, pending, and rejected).
- **Dual View Modes**:
  - **List View**: High horizontal space utilization, compact badges, and clean multi-line layouts.
  - **Compact Grid View**: Multi-column tile cards (2 columns on mobile, 3–4 columns on desktop) with instant drawer preview.
- **Visual Status Coding**:
  - 🚀 Applied (Green) / 📞 HR Call (Purple) / 💻 Tech Interview (Orange) / 🎉 Offer (Vibrant Emerald with watermark) / ❌ Rejected (Subtle grey strikethrough) / 📌 Saved (Slate).
  - ⏰ **60-Day Inactive Alert**: Submissions older than 2 months without feedback are highlighted with `[⚠️ Over 2 months]`.
  - ⭐ **Priority Starred Marking**: One-click star highlight with glowing amber borders.

### 5. ☎️ Flash HR Call Emergency Lookup (⌘K / Ctrl+K)
- Global search bar allowing instant matching by **Recruiter Phone Number, HR Name, Company Name, Job Title, or JD Keywords**.
- Instantly pull up expected salary, customized CV notes, and key responsibilities while picking up an unexpected recruiter call.

### 6. 🌐 Trilingual Internationalization (i18n)
- **Français (🇫🇷) · English (🇬🇧) · 中文 (🇨🇳)**: Built from the ground up for multicultural and multilingual recruitment environments.
- **Consistent across Web and Chrome Extension**: Complete coverage across metrics, filters, form fields, JD reader, modal dialogs, and extension popups.
- **Smart Detection & Persistent Storage**: Automatically detects browser/system language on initial load; allows one-click switching saved to `localStorage` (Web) or `chrome.storage.local` (Extension).
- **Zero-Route-Intrusion Architecture**: No URL prefix pollution (no `/zh` or `/fr` redirects); instant reactivity without full page reloads.

---

## 📱 Mobile PWA "System Share to Save" (Web Share Target)

Experience native-like app integration without installing heavy app store packages. Using the W3C Web Share Target standard, mobile job tracking is seamless.

### 📱 Android (Chrome / Edge) Installation & Usage
1. **Install PWA**:
   - Visit your tracker URL (e.g., `https://your-tracker.vercel.app`) in Chrome or Edge on mobile.
   - Tap the browser menu (`⋮`) -> select **"Add to Home screen"** or **"Install application"**.
   - The standalone **FR Job Tracker** icon will appear on your home screen.
2. **Share to Log**:
   - Browse a job in the LinkedIn, Indeed, or HelloWork app.
   - Tap the **Share** button on the job posting.
   - Select **FR Job Tracker** from the native Android share sheet.
   - The app launches automatically, extracts the clean URL via regex, runs server-side parsing and 3-tier duplicate checks, and displays a ready-to-save card. Tap **"🚀 Confirm Application"** to log.

### 🍎 iOS (Safari) 3-Step Shortcut Setup
While iOS Safari does not yet support W3C Web Share Target registration, you can achieve the exact same workflow in 3 steps using iOS **Shortcuts**:

1. Open the built-in **Shortcuts** app on iPhone, tap `+` to create a new shortcut, and name it `Save to Job Radar`.
2. Tap the shortcut details (information icon) and enable **"Show in Share Sheet"**, setting input types to **URLs** and **Text**.
3. Add two actions:
   - **Action 1**: Search for and add **"Get URLs from Input"**.
   - **Action 2**: Search for and add **"Open URL"**, entering:
     ```text
     https://your-domain.vercel.app/share?url=[URL]
     ```
     *(Select the URL output from Action 1 as the `[URL]` token).*
4. **Daily Use**: When browsing jobs in the LinkedIn or Indeed app, tap **Share** -> tap **"Save to Job Radar"**. Safari will instantly launch the `/share` page, parse the job, and show the recording card.

---

## 🧩 Chrome Extension Guide

### 1. Load Extension Locally
1. Clone this repository to your local machine.
2. In Chrome, open `chrome://extensions/`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked** in the top left corner.
5. Select the **`extension/`** folder from the repository.
6. Pin the FR Job Tracker extension icon to your browser toolbar.

### 2. Login & Instant Scraping
1. Click the extension icon. If not logged in, sign in directly through the built-in authentication form.
2. Navigate to any job posting on LinkedIn, Indeed, Apec, HelloWork, etc.
3. Click the extension icon again — the page DOM is parsed, normalized, and checked for duplicates within seconds.
4. Adjust rating (`S+` to `C`), initial status (`Applied` or `Saved`), salary, or notes, and click **"Confirm Application"** to save.

### 3. ⚙️ Open Source Self-Hosting: Backend Switcher
The bottom of the extension includes a collapsible **"⚙️ Backend API Settings"** panel:
- **Local Development**: Defaults to `http://localhost:3000`.
- **Cloud Deployment**: Enter your Vercel or VPS production backend URL (e.g., `https://your-tracker.vercel.app`) and click Save.
- The extension automatically updates token storage when switching environments.

---

## 🛠️ Developer Self-Hosting & Deployment

### 1. Setup Supabase Database & Auth
1. Create a free project at [Supabase](https://supabase.com/).
2. Under **Authentication -> Providers**, ensure the **Email** provider is enabled.
3. Open the **SQL Editor** and run the following schema migration:

```sql
-- 1. Create core applications table
create table if not exists applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  company_raw text not null,
  title_raw text not null,
  clean_url text,
  platform text default 'OTHER',
  external_job_id text,
  contract_type text default 'UNKNOWN',
  work_mode text,
  language text default 'FR',
  location text,
  salary_range text,
  posted_at text,
  hr_contact jsonb,
  notes text,
  jd_content text,
  feature_hash text,
  status text default 'APPLIED',
  rating text default 'B',
  is_starred boolean default false,
  applied_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. Create performance indexes
create index if not exists idx_applications_user_id on applications (user_id);
create index if not exists idx_applications_user_applied_at on applications (user_id, applied_at desc);
create index if not exists idx_applications_user_platform_job on applications (user_id, platform, external_job_id);
create index if not exists idx_applications_user_feature_hash on applications (user_id, feature_hash);
create index if not exists idx_applications_company on applications (company_raw);
create index if not exists idx_applications_status on applications (status);

-- 3. Enable PostgreSQL Row Level Security (RLS)
alter table applications enable row level security;

create policy "Users can only read their own applications"
on applications for select to authenticated using (auth.uid() = user_id);

create policy "Users can only insert their own applications"
on applications for insert to authenticated with check (auth.uid() = user_id);

create policy "Users can only update their own applications"
on applications for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can only delete their own applications"
on applications for delete to authenticated using (auth.uid() = user_id);
```

### 2. Local Environment Configuration
Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
# Used for server-side account deletion (Supabase Settings -> API -> service_role secret)
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

Run the development server:
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Production build test
npm run build
```

### 3. One-Click Vercel Deployment
1. Push your repository to GitHub.
2. Sign in to [Vercel](https://vercel.com/) and import the repository.
3. Configure Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`).
4. Click **Deploy** to launch your private cloud instance.

---

## 📂 Project Architecture

```text
fr-job-tracker/
├── extension/                     # Chrome Extension (Manifest V3)
│   ├── icons/                     # Flat tech vector icons (16/32/48/128)
│   ├── manifest.json              # Extension manifest (icons, permissions, actions)
│   ├── popup.html                 # Extension popup UI (Auth, Scrape, Backend settings)
│   └── popup.js                   # Client auth, session storage & DOM extraction engine
├── public/
│   ├── icons/                     # High-res PWA desktop icons (192/512)
│   ├── apple-touch-icon.png       # iOS high-res touch icon
│   ├── icon.svg                   # Master vector SVG logo
│   └── manifest.json              # Web App Manifest & Web Share Target configuration
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── account/           # Account management (clear data, delete account)
│   │   │   ├── applications/      # Applications CRUD API (RLS user_id enforcement)
│   │   │   ├── auth/              # Extension auth (login, register, token refresh)
│   │   │   └── parse-and-check/   # Regex normalization & 3-tier duplicate detection
│   │   ├── login/                 # Web authentication center
│   │   ├── share/                 # PWA Web Share Target mobile landing page
│   │   ├── layout.tsx             # Root layout with I18nProvider
│   │   └── page.tsx               # Main kanban dashboard (List/Grid, Metrics, Search)
│   ├── components/
│   │   ├── AccountSettingsModal.tsx # Account & security settings modal
│   │   ├── ApplicationEditModal.tsx # Comprehensive job detail editor
│   │   ├── JobDetailModal.tsx       # Grid view quick preview drawer
│   │   ├── QuickAddModal.tsx        # Fast manual job entry modal
│   │   └── JdViewerModal.tsx        # Immersive full-screen JD reader
│   └── lib/
│       ├── auth.ts                # Unified Bearer token & cookie auth middleware
│       ├── i18n/                  # Trilingual dictionaries (dictionaries.ts) & Provider
│       ├── scraper/               # Zero-token regex cleaning, salary & location normalization
│       └── supabase.ts            # Supabase client & TypeScript data contracts
├── README.md                      # Chinese Documentation (中文文档)
└── README_EN.md                   # English Documentation
```

---

## 📄 License & Acknowledgments

This project is open-source under the [MIT License](LICENSE).

Best of luck to all candidates navigating the recruitment market in France!  
*Bon courage dans votre recherche d'emploi en France !* 🇫🇷🚀
