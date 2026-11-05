# FR Job Tracker - Chrome 扩展使用指南

基于 Chrome 扩展 Manifest V3 开发的极简求职插件，支持在浏览电脑端法国招聘网站（LinkedIn, Indeed FR, Apec, HelloWork, JobTeaser, Welcome to the Jungle 等）时一键提取 DOM、结构化清洗、三级历史查重并入库。

---

## 🚀 安装步骤 (10 秒快速载入)

1. **打开浏览器扩展管理页面**：
   - Chrome 浏览器：在地址栏输入 `chrome://extensions` 并回车
   - Edge 浏览器：在地址栏输入 `edge://extensions` 并回车
   - Brave 浏览器：在地址栏输入 `brave://extensions` 并回车

2. **开启「开发者模式」**：
   - 在扩展管理页面右上角，勾选或打开 **「开发者模式」(Developer mode)** 开关。

3. **加载扩展程序**：
   - 点击左上角出现的 **「加载已解压的扩展程序」(Load unpacked)** 按钮。
   - 在弹出的文件选择器中，选择本项目根目录下的 **`extension`** 文件夹（即包含 `manifest.json` 的目录）。

4. **固定到浏览器工具栏**：
   - 点击浏览器右上角拼图形状的「扩展」图标，找到 **FR Job Tracker** 并点击「固定 (Pin)」图钉。

---

## 💡 使用场景与流程

1. 在浏览器中打开任意法国职位页面（例如 LinkedIn 职位详情页、Apec 岗位页、Indeed 详情页等）。
2. 点击右上角 **FR Job Tracker** 扩展图标。
3. 插件会自动：
   - 读取当前标签页的 URL、Title 与全部 `<script type="application/ld+json">` 结构化元数据；
   - 提取职位详情核心文本容器；
   - POST 发送到本地 `http://localhost:3000/api/parse-and-check` 完成双语归一化清洗；
   - 执行 L1（同平台同ID）、L2（相同链接）、L3（同公司且职位相似度 > 0.45）三级查重；
4. 若有重复历史记录，将立即弹出**高危黄色/红色警示卡片**，显示上次投递日期与当时状态，防止重复投递。
5. 点击 **「确认记录投递」** 即可瞬间录入 Supabase 数据库，无需切换窗口或复制粘贴。
