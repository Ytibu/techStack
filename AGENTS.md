# Repository Guidelines

## 项目结构

本仓库是面向 Java 后端开发者的 VitePress 中文知识库。

- `docs/mysql/`：默认知识体系型 MySQL，沿原资料章节组织；`scenarios/` 为可选业务型正文。
- `docs/redis/`：默认知识体系型 Redis，按五个资料模块组织。
- 各技术栈默认只有知识体系型；直接子目录的 `index.md` 声明 `style` 后才识别为其他风格，普通章节不算风格。
- `docs/.vitepress/`：目录扫描、导航、搜索范围和 Vue 主题组件；`docs/public/` 存放静态资源。
- `tests/catalog.test.mjs`：目录与搜索逻辑测试；`audits/` 保存内容审核，`VALIDATION.md` 记录验证过程及边界。

## 开发与构建

使用 Node.js 20 及以上版本，在仓库根目录执行：

```sh
npm ci              # 按 package-lock.json 安装依赖
npm run dev         # 启动本地开发服务，支持热更新
npm test            # 运行目录与搜索测试
npm run build       # 构建静态站并检查内部链接
npm run preview     # 预览最近一次构建产物
```

构建输出为 `docs/.vitepress/dist/`。修改内容后，重新构建并重启预览才能检查新产物；日常编辑使用开发服务。

## 编写风格与命名

正文、注释优先中文；文件名、变量名使用英文。Markdown 文件采用数字前缀与短横线，例如 `01-overview.md`；分组入口使用 `index.md`，每页写明确的一级标题。

导航名称读取首个一级标题，目录按自然顺序自动收录，`index.md` 优先。新增文章放入对应技术目录，不手工维护导航列表；草稿放到 `docs/` 外。

JavaScript 使用 ES modules、两空格缩进、单引号和无分号风格；Vue 组件使用 PascalCase 文件名和 `<script setup>`。沿用 VitePress 默认主题；仓库未配置独立 lint 或格式化命令。

## 测试与验收

测试使用 Node.js 内置 `node:test` 和严格断言，新增测试沿用 `*.test.mjs` 命名，并确保被 `npm test` 脚本纳入。当前无覆盖率阈值。

修改目录、路由或搜索逻辑时，补充对应行为测试，覆盖增删、标题变化、排序及搜索范围。内容或站点改动运行 `npm test` 与 `npm run build`；导航、主题或交互改动再检查桌面和窄屏浏览器。将结果、排查过程和未验证范围写入 `VALIDATION.md`，构建成功不能代替数据库示例运行验证。

## 提交与合并请求

历史提交采用 `feat: 中文说明`、`docs: 中文说明`，例如 `docs: 补充 Redis 持久化边界`。提交保持单一目的。

PR 应说明修改原因、影响目录、验证命令及结果，关联已有问题；界面调整附桌面和窄屏截图，内容校正注明资料依据和版本边界。

## 资料与代理操作

保留来源说明，如 `99-sources.md`；区分原文结论、补充与校正。不要提交原始大文件、凭据、`node_modules/`、构建产物或 `.work/` 临时文件。

任务开始和结束时的 Git 操作先征询用户；发现无关的未提交修改，先询问是否提交，避免混入当前任务。新增下载或依赖前先检查主机环境并提供选择；用户确认后沿用所选方案。
