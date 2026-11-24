# FR Job Tracker 🇫🇷

> 专为在法留学生与工程师打造的现代化求职管理雷达 · 零 Token 本地确定性爬虫 · 三级智能防重查重 · 多用户 RLS 数据隔离 · 移动端 PWA 系统分享直达录入 · HR 来电急救反查

![Next.js](https://img.shields.io/badge/Next.js-16.4-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)
![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_RLS-3ecf8e.svg)
![Chrome Extension](https://img.shields.io/badge/Chrome_Extension-Manifest_V3-yellow.svg)
![PWA](https://img.shields.io/badge/PWA-Web_Share_Target-purple.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

---

## 💡 为什么需要 FR Job Tracker？

在法国找工作或实习（CDI、CDD、Stage、Alternance），海投不可避免，但往往面临三大痛点：
1. **重复投递车祸**：各大平台同个职位变着花样发，不小心投了同公司同部门好几次，给法国 HR 留下不严谨的印象；
2. **HR 突袭电话抓瞎**：法国 HR 经常毫无预约直接打电话（Pre-screening Call），电话里报了公司名甚至只报职位，你根本想不起投的是什么、薪资要求写了多少、JD 要什么技术；
3. **管理繁琐、多端脱节**：Excel 维护繁重，手机刷招聘软件看到好岗位无法一键收藏入库，商业软件动辄消耗高额 LLM Token 费用且响应缓慢。

**FR Job Tracker** 彻底解决以上问题：
- **零 Token 纯本地正则/DOM 引擎**：秒级抓取与清洗，不花一分 API 费用；
- **三级防重比对（L1/L2/L3）**：精准识别相同职位或同团队相似岗位，强力避免重复投递；
- **多用户账号与数据隔离（RLS）**：支持自建或使用公网服务，每个人拥有完全私密的投递数据；
- **全平台支持（Web + Chrome 插件 + 手机 PWA 系统分享）**：在电脑用插件一键存，在手机用 App 分享一键入库，电脑手机实时同步。

---

## ✨ 核心特性

### 1. ⚡ 零 Token 确定性 DOM 爬虫引擎
- **深度适配在法主流招聘平台**：
  - **Indeed France**：单栏详情页（`/viewjob`）、双栏分栏视图、页面滚动吸顶头均完美支持；
  - **LinkedIn France**：突破新版 LinkedIn 全混淆 class 与多变 DOM 架构，100% 稳定抓取；
  - **Apec**、**HelloWork**、**Welcome to the Jungle (WTTJ)**、**JobTeaser** 等全渠道适配；
- **精准清洗与规范化**：自动过滤招聘标题杂质（如 `(H/F)`, `(M/F/D)`, `CDI/CDD` 等后缀），自动提取薪资范围、工作地点（75/92/Île-de-France 等）、合同类型与办公模式（On-site / Hybrid / Remote）。

### 2. 🛡️ 三级多维度防重查重机制
- **L1 平台外部 Job ID 比对**：毫秒级精准命中同一招聘链接或同一平台的相同岗位 ID；
- **L2 岗位特征哈希比对**：规范化提取公司名 + 职位名生成唯一哈希指纹，即使换了链接也能准确拦截；
- **L3 模糊相似度与同团队相似岗位预警**：比对历史投递库，若为同公司相似岗位（如近 30 天内曾投过该公司同部门岗位），弹出高危预警卡片并提示上次投递时间与状态，防患于未然。

### 3. 🔐 多用户体系与 Supabase RLS 行级数据隔离
- 采用 Supabase Auth 驱动，全链路开启 PostgreSQL **Row Level Security (RLS)** 策略 (`auth.uid() = user_id`)；
- 支持邮箱密码注册登录与 Google OAuth 快捷登录；
- 提供完善的账号与安全设置：支持自主修改密码、一键清空个人投递数据（二次确认）、永久注销并清除账号（高危二次确认）。

### 4. 📊 核心统计指标与状态看板
- **回复率 (Reply Rate)**：排除「未投递（SAVED）」与待回复「已投递（APPLIED）」后，所有获得明确反馈的岗位占有效投递数的百分比；
- **通过率 (Pass Rate)**：排除未投递、待回复与「未通过（REJECTED）」后，所有推进至 HR 沟通、技术面试或已获 Offer 的有效比例；
- **双视图自由切换**：
  - **列表模式 (List View)**：信息横向铺满、标签清晰紧凑、单屏信息密度高；
  - **紧凑网格模式 (Grid View)**：多列磁贴卡片（手机 2 列、桌面 3~4 列），点击一键呼出详情速览弹窗；
- **Excel 对齐色彩视觉**：
  - 🚀 已投递（鲜绿） / 📞 HR 沟通（淡紫） / 💻 技术面试（暖橙） / 🎉 已获 Offer（饱满绿 + 专属水印） / ❌ 未通过（暗灰虚线水印） / 📌 先保存未投（深灰）；
  - ⏰ **满 60 天自动预警**：投递满 2 个月未回复自动标记为淡粉色并标注 `[⚠️ 已超过2个月]`；
  - ⭐ **特别关注星标**：一键星标置顶高亮，专属金色微光边框。

### 5. ☎️ HR 来电闪电反查 (快捷键 ⌘K / Ctrl+K)
- 顶部常驻反查搜索栏，支持按**电话号码、HR 姓名、公司名称、职位名、JD 关键词**毫秒级全文匹配；
- 电话接通瞬间迅速查出投递版本、自荐信备忘、薪资期望与原始职责要求，告别慌乱。

### 6. 🌐 全端中·法·英三语国际化 (i18n)
- **法语 (Français 🇫🇷) · 英语 (English 🇬🇧) · 中文 (🇨🇳)**：全场景深度适配在法双语与多语求职环境；
- **Web 端与 Chrome 插件深度对齐**：涵盖求职看板、状态流转徽章、统计指标口径、极速录入与详情编辑、JD 阅读器、账号安全中心及 Chrome 插件弹窗；
- **智能自适应与持久化切换**：首次启动自动跟随用户操作系统与浏览器语言，右上角随时一键切换并自动持久化存储（Web 端 `localStorage`，插件端 `chrome.storage.local`）；
- **零路由入侵轻量架构**：无需繁琐的前缀路由重定向，保持 URL 简洁干净，组件按需响应式翻译。

---

## 📱 手机端系统级「分享直达录入（Web Share Target）」

这是本系统最亮眼的移动端体验！无需安装笨重的 Native App，借助现代 PWA 标准，在手机端即可实现**“系统分享即录入”**。

### 📱 Android 端（Chrome / Edge）安装与使用
1. **安装 PWA**：
   - 用手机 Chrome / Edge 访问您的 Web 看板网址（如 `https://your-tracker.vercel.app`）；
   - 点击浏览器右上角菜单（三个点） -> 选择 **「添加到主屏幕」** 或 **「安装应用」**；
   - 桌面即会生成带有专属蓝白科技 Logo 的独立 **FR Job Tracker** 应用。
2. **系统分享一键录入**：
   - 打开 LinkedIn、Indeed 或 HelloWork App 浏览职位；
   - 点击职位页面的 **「分享 (Share)」** 按钮；
   - 在手机系统分享面板中，直接点击 **「FR Job Tracker」** 图标；
   - 页面自动启动，智能正则 `/https?:\/\/[^\s"'<>]+/i` 瞬间提取出岗位链接，**零点击自动发起后台解析与三级防重比对**；
   - 手机屏幕直接呈现结构化结果卡片，点击 **「🚀 确认记录已投递」** 或 **「📌 存为未投递」** 即可入库！

### 🍎 iOS 端（Safari）快捷指令一键录入
iOS Safari 的 PWA 规范目前尚未开放原生的 Share Target 注册，但通过 iOS 原生**「快捷指令（Shortcuts）」**，只需 3 步即可获得与系统分享无差别的极致体验：

#### 3 步极简快捷指令配置教程：
1. 打开 iPhone 自带的 **「快捷指令」** App，点击右上角 `+` 新建一个指令，命名为 `记录到求职雷达`；
2. 点击右上角设置（或下方信息图标），勾选 **「在共享表单中显示」**，并将输入类型设置为 **「URL」** 和 **「文本」**；
3. 在指令操作流程中添加两个动作：
   - **动作 1**：搜索并添加 **「从输入中获取 URL」**；
   - **动作 2**：搜索并添加 **「打开 URL」**，在 URL 输入框中填入：
     ```text
     https://你的线上域名/share?url=[URL]
     ```
     *(注：点击最后的 `[URL]` 变量，选择动作 1 输出的 URL 即可)*
4. **日常使用**：
   - 在 iPhone 的 LinkedIn / Indeed App 浏览职位时，点击「分享」-> 在分享面板中找到并点击 **「记录到求职雷达」**；
   - Safari 将瞬间打开 `/share` 页面，全自动完成解析、查重并展示录入卡片！

---

## 🧩 Chrome 浏览器插件使用指南

### 1. 本地加载插件
1. 确保已将项目克隆到本地；
2. 打开 Chrome 浏览器，在地址栏输入 `chrome://extensions/` 回车；
3. 开启右上角 **“开发者模式” (Developer mode)**；
4. 点击左上角 **“加载已解压的扩展程序” (Load unpacked)**；
5. 选择本项目根目录下的 **`extension/`** 文件夹，即可完成加载；
6. 建议在 Chrome 扩展栏中将 FR Job Tracker 快捷图钉固定到工具栏。

### 2. 账号登录与抓取流程
1. 点击插件图标，未登录时会自动呈现内置登录界面；
2. 输入您的求职雷达账号密码登录（或点击下方外链前往网页版注册）；
3. 打开任意在法招聘网站（如 LinkedIn、Indeed 等）的职位详情页；
4. 再次点击插件图标，插件将**秒级自动完成页面 DOM 提取、数据清洗与防重比对**；
5. 可微调评级（`S+` ~ `C`）、状态（`已投递` / `先保存`）、地点薪资等，点击 **「确认记录投递」** 瞬间入库！

### 3. ⚙️ 开源自托管：自由切换后端环境
插件底部完整保留了 **「⚙️ 后端环境设置」** 折叠区：
- **本地开发**：默认指向 `http://localhost:3000`；
- **自建线上**：点击展开，在输入框填入您部署在 Vercel 或个人 VPS 的后端地址（如 `https://your-tracker.vercel.app`），点击保存即可秒级切换；
- 切换环境时会自动清除上一环境的 Session 缓存，保证安全与数据完全隔离。

---

## 🛠️ 开发者自托管与一键部署指南

### 1. 准备 Supabase 后端与数据库建表
1. 注册并登录 [Supabase](https://supabase.com/)，创建一个新的免费数据库项目；
2. 进入项目仪表盘的 **Authentication -> Providers**，确保启用 **Email** 提供商（如需第三方登录可开启 Google）；
3. 进入 **SQL Editor**，执行以下初始化 SQL 脚本：

```sql
-- 1. 创建求职投递核心表
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

-- 2. 创建高频查询索引
create index if not exists idx_applications_user_id on applications (user_id);
create index if not exists idx_applications_user_applied_at on applications (user_id, applied_at desc);
create index if not exists idx_applications_user_platform_job on applications (user_id, platform, external_job_id);
create index if not exists idx_applications_user_feature_hash on applications (user_id, feature_hash);
create index if not exists idx_applications_company on applications (company_raw);
create index if not exists idx_applications_status on applications (status);

-- 3. 开启 Row Level Security (RLS) 行级数据隔离策略
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

### 2. 本地运行与环境变量
在项目根目录创建 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
# 用于管理员彻底注销账号 (可在 Supabase Project Settings -> API 中获取)
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

运行项目：
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产环境编译测试
npm run build
```

### 3. Vercel 一键云端部署
1. 将本项目代码推送到您的个人 GitHub 仓库；
2. 登录 [Vercel](https://vercel.com/)，点击 **「Add New...」->「Project」** 并导入本仓库；
3. 在 **Environment Variables** 中添加以上三个环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. 点击 **Deploy** 部署完成，即可获得专属的公网访问域名！

---

## 📂 项目结构全景

```text
fr-job-tracker/
├── extension/                     # Chrome Extension (Manifest V3)
│   ├── icons/                     # 插件全尺寸扁平科技风图标 (16/32/48/128)
│   ├── manifest.json              # 扩展清单配置 (icons & actions)
│   ├── popup.html                 # 插件弹窗 (内置登录面板 + 抓取微调 + 环境切换)
│   └── popup.js                   # 插件端鉴权、Session 存储与 DOM 刮削比对引擎
├── public/
│   ├── icons/                     # PWA 桌面全套尺寸高清图标 (192/512)
│   ├── apple-touch-icon.png       # iOS 桌面高清触控图标
│   ├── icon.svg                   # 高清矢量 Logo
│   └── manifest.json              # Web App Manifest & Web Share Target 配置
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── account/           # 账号管理 (清空投递记录、彻底注销)
│   │   │   ├── applications/      # 投递数据 CRUD API (基于用户 Token 严格鉴权与过滤)
│   │   │   ├── auth/              # 插件端登录、注册与 Token 静默刷新端点
│   │   │   └── parse-and-check/   # 正则规则清洗与基于用户隔离的三级防重引擎
│   │   ├── login/                 # Web 端现代暗黑质感登录/注册中心
│   │   ├── share/                 # 手机端 PWA 系统分享直达落地页 (正则抽链即刻解析)
│   │   ├── layout.tsx             # 根布局与 PWA 元数据配置
│   │   └── page.tsx               # 主看板 (状态流转、双视图切换、回复/通过率、急救反查)
│   ├── components/
│   │   ├── AccountSettingsModal.tsx # 账号与安全设置弹窗 (改密、清空、注销、退出)
│   │   ├── ApplicationEditModal.tsx # 职位全字段微调编辑弹窗
│   │   ├── JobDetailModal.tsx       # 网格模式轻量速览抽屉
│   │   ├── QuickAddModal.tsx        # 顶部快捷录入岗位弹窗
│   │   └── JdViewerModal.tsx        # 沉浸式全屏 JD 阅读器
│   └── lib/
│       ├── auth.ts                # 服务端统一双模鉴权中间件 (Bearer & Cookie)
│       ├── i18n/                  # 中法英三语国际化字典 (dictionaries.ts) 与全局 Provider
│       ├── scraper/               # 零 Token 正则清洗、薪资地点规范化与特征哈希
│       └── supabase.ts            # Supabase 客户端与 TypeScript 数据契约
└── README.md
```

---

## 📄 开源许可与致谢

本项目基于 [MIT License](LICENSE) 开源。

祝愿每一位在法留学生、华人工程师与求职者斩获心仪的 Offer！
*Bon courage dans votre recherche d'emploi en France !* 🇫🇷🚀
