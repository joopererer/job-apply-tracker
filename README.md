# FR Job Tracker 🇫🇷

> 零 Token 法国求职雷达 · Chrome 扩展闪电解析 · 剪贴板智能防重 · HR 来电急救反查 · Excel 视觉看板

![Release](https://img.shields.io/badge/Release-v0.1.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.4-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ecf8e.svg)
![Chrome Extension](https://img.shields.io/badge/Chrome_Extension-Manifest_V3-yellow.svg)

**FR Job Tracker** 是一款专为在法求职的工程师、应届毕业生及留学生量身打造的全栈式求职管理雷达。通过**零 Token 消耗的高性能本地正则/DOM 刮削算法**，结合 Chrome 插件与 Next.js Web 看板，帮助你高效管理法区海投、杜绝重复投递并从容应对突如其来的法国 HR 电话。

---

## ✨ 核心特性

### 1. ⚡ Chrome 插件极速抓取 (秒开体验)
- **秒开 Loading 交互**：插件弹窗秒级展开，后台异步解析当前网页，告别卡顿等待。
- **深度适配在法主流平台**：
  - **Indeed France**：完美兼容单栏详情页（`/viewjob`）、双栏搜索分栏（Split-View），以及页面滚动时的**紧凑一行吸顶头 (Compact Header)** 与常规换行头。
  - **LinkedIn France**：突破新版 LinkedIn 无 `<h1>`、全混淆 Hash class 架构，基于页面真实文本结构实现 100% 稳定抓取。
  - **Apec** / **HelloWork** / **Welcome to the Jungle (WTTJ)**：全平台适配。
- **评级与状态自选**：
  - 支持快捷选择岗位评级（`🔥 S+` 到 `💤 C`，默认 `🎯 B`）；
  - 支持直接标记为 **`📌 先保存未投 (SAVED)`** 或 **`🚀 已直接投递 (APPLIED)`**；
  - 右上角一键点亮镂空/实心特别关注星标（⭐），整张卡片呈现金色发光边框。

### 2. 🎨 Excel 状态对齐色彩看板 & 盖章水印
基于资深求职者的 Excel 追踪习惯，Web 端看板全面实现了直观的状态背景视觉映射：
- **`🚀 已投递 (APPLIED)`**：鲜亮浅绿底色，展现正常跟进节奏。
- **`⚠️ 沉睡超期自动预警`**：若已投递**满 2 个月（60 天）**仍无回复，系统自动将其标记为**浅粉红背景**，并在状态旁醒目附加 **`[⚠️ 已超过2个月]`** 标签，无需手动标记即可一览沉默淘汰岗位。
- **`📞 HR 沟通 (HR_CALL)`**：典雅浅紫色底色，与技术面试清晰区分。
- **`💻 技术面试 (TECH_INTERVIEW)`**：饱满暖橙色底色，突出核心在途进度。
- **`🎉 已获 Offer (OFFER)`**：深邃实心绿微光背景 + **`🎉 OFFER · SUCCESS`** 倾斜绿色盖章水印。
- **`❌ 未通过 (REJECTED)`**：灰黑哑光质感 + **`FAILED · 未通过`** 灰黑虚线盖章水印，弱化干扰。
- **`📌 未投递 (SAVED)`**：中性深冷灰，收藏心仪岗位且绝不拉低投递回复率统计。
- **`⭐ 特别关注 (is_starred)`**：金色发光边框优先置顶，重点公司绝不遗漏。

### 3. ☎️ HR 来电急救闪电反查 (快捷键 ⌘K / Ctrl+K)
- 面试时法国 HR 突然来电，常常只报一个公司名甚至直接用法语报职位？
- 打开 Tracker 顶部反查栏，支持按**电话号码、HR 姓名、公司名称、职位名、JD 关键词**进行毫秒级全文匹配。
- 瞬间调出当时投递的原始 JD、薪资要求、自荐信备忘及历史投递时间，从容应对电话面试（Pre-screening Call）。

### 4. 🔍 多维看板筛选工具栏 (Multi-Filter Bar)
- **动态平台筛选**：自动仅展示当前有记录的平台，并实时标注数量（如 `全部平台 (20)`、`Indeed (12)`、`LinkedIn (5)`、`其它渠道 (3)`），没有岗位的渠道不占视线。
- **最低评级筛选**：支持按 `≥S+`、`≥S`、`≥A+`、`≥A`、`≥A-`、`≥B` 过滤高意向机会。
- **特别关注开关**：一键切换仅看 ⭐ 标重点岗位。
- **合同类型筛选**：快速筛选 `CDI`、`CDD`、`Stage`、`Alternance`、`Freelance`。

### 5. ⛶ 全屏沉浸式 JD 阅读器
- 卡片支持快速折叠展开；
- 支持一键调出 **⛶ 全屏弹窗阅读器**，对岗位职责、技术栈、薪资待遇、Remote 政策进行结构化高亮呈现，并支持一键复制纯文本全文。

---

## 🛠️ 技术架构

- **Web 前端 & 服务端**：Next.js 16 (App Router + Turbopack)、React 19、TypeScript
- **样式与组件**：Tailwind CSS v4、Lucide React
- **持久化存储**：Supabase (PostgreSQL) + Next.js Route Handlers
- **浏览器扩展**：Chrome Extension Manifest V3（纯原生 JS/CSS，零外部依赖）

---

## 🚀 快速上手

### 1. 环境准备与依赖安装
确保本地已安装 Node.js (推荐 v20+ / v22+)。

```bash
# 克隆仓库
git clone https://github.com/joopererer/job-apply-tracker.git
cd job-apply-tracker

# 安装依赖
npm install
```

### 2. 配置环境变量
在项目根目录下复制或创建 `.env.local` 文件，填入你的 Supabase 配置信息：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 3. 数据库表初始化
在你的 Supabase SQL Editor 中执行以下建表语句：

```sql
create table if not exists applications (
  id uuid default gen_random_uuid() primary key,
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
  status text default 'APPLIED',
  rating text default 'B',
  is_starred boolean default false,
  applied_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 创建快速查重与反查索引
create index if not exists idx_applications_company on applications (company_raw);
create index if not exists idx_applications_status on applications (status);
create index if not exists idx_applications_clean_url on applications (clean_url);
create index if not exists idx_applications_starred on applications (is_starred);
```

### 4. 启动本地 Web 开发服务

```bash
npm run dev
```
打开浏览器访问 [http://localhost:3000](http://localhost:3000) 即可看到完整的投递看板。

### 5. 安装与加载 Chrome 插件
1. 打开 Chrome 浏览器，在地址栏输入 `chrome://extensions/`；
2. 开启右上角的 **“开发者模式” (Developer mode)**；
3. 点击左上角的 **“加载已解压的扩展程序” (Load unpacked)**；
4. 选择本项目目录下的 `extension/` 文件夹；
5. 点击插件底部的“后端环境设置”，默认指向 `https://fr-job-tracker.vercel.app`，若本地调试可切换为 `http://localhost:3000`。

---

## 📂 目录结构

```text
fr-job-tracker/
├── extension/                     # Chrome Extension (Manifest V3)
│   ├── manifest.json              # 扩展配置清单
│   ├── popup.html                 # 插件弹窗布局 (秒开 UI)
│   └── popup.js                   # 插件后台刮削算法 (Indeed/LinkedIn 深度解析)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── applications/      # 职位持久化 CRUD 接口 (具备韧性降级保护)
│   │   │   └── parse-and-check/   # 剪贴板文本快速解析与防重比对 API
│   │   ├── page.tsx               # Web 端状态色彩看板主页面 (Filter Bar / Stamps)
│   │   └── layout.tsx             # 根布局配置
│   ├── components/
│   │   ├── ApplicationEditModal.tsx # 职位信息全字段完整编辑弹窗
│   │   └── JdViewerModal.tsx        # 沉浸式全屏 JD 阅读器
│   └── lib/
│       ├── scraper/               # 本地正则与规则提取库
│       │   ├── normalizer.ts      # 职位名/公司名防污清洗算法
│       │   └── parser.ts          # 剪贴板智能解析逻辑
│       └── supabase.ts            # Supabase 客户端与 TypeScript 数据模型
└── README.md
```

---

## 🏷️ 版本记录

- **v0.1.0** (2026-11-06)
  - 🚀 **Chrome 扩展全面升级**：秒开 Loading、支持星标（⭐ 纯图标镂空/实心切换）、多档评级选择（S+ ~ C）、支持先保存为 `SAVED`。
  - 🎨 **Excel 对齐配色与盖章水印**：已投递鲜绿、HR 沟通紫色、技术面试橙色、Offer 饱满绿 + `OFFER SUCCESS` 水印、未通过灰黑 + `FAILED` 水印。
  - ⏰ **超期自动预警**：满 60 天未有反馈自动呈现浅粉红并标记 `[⚠️ 已超过2个月]`。
  - 🔍 **多维过滤工具栏**：动态平台计数筛选、最低评级筛选、仅看星标、合同类型联动过滤。

---

## 📄 开源许可

本项目基于 [MIT License](LICENSE) 开源。欢迎提 Issue 与 PR，助每一位在法留学生和工程师斩获心仪 Offer！Bon courage ! 🚀
