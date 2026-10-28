# Java 后端知识库

使用 VitePress 默认主题的中文知识库。业务型与知识体系型的正文、目录和搜索范围各自独立，首页直接选择。技术栈按目录维护，新增 Markdown 自动进入相应目录与搜索。

MySQL 两套均已完成：业务型保留 11 篇正文与 20 问速记；知识体系型按三份原资料的十七章主线整理为 21 篇正文，另有分篇目录和资料说明。Redis、RabbitMQ、Spring Boot 在两套中均为预留入口。

## 两套内容与地址

| 内容 | 地址 | 维护目录 |
| --- | --- | --- |
| 总首页 | `/` | `docs/index.md` |
| 业务型入口 | `/business/` | `docs/business/index.md` |
| 业务型 MySQL | `/mysql/` | `docs/mysql/` |
| 知识体系型入口 | `/knowledge/` | `docs/knowledge/index.md` |
| 知识体系型 MySQL | `/knowledge/mysql/` | `docs/knowledge/mysql/` |

已有业务文章的地址保持有效。正文上方可切换到另一风格的同技术栈首页；缺少对应技术栈时返回目标知识库入口。首页搜索覆盖两套，进入后只返回当前知识库结果。

## 本地使用

环境：Node.js 20 或以上，已在 Node.js 24.12.0、npm 11.6.2 下验证。项目固定使用 VitePress 1.6.4，依赖版本由 package-lock.json 锁定。

```sh
npm ci
npm run dev
```

开发地址默认是 http://127.0.0.1:5173，以终端输出为准。

```sh
npm test
npm run build
npm run preview
```

构建产物位于 `docs/.vitepress/dist/`。预览展示上次构建的静态产物，修改 Markdown 后需要重新构建并重启预览服务；开发模式会自动更新。

## 新增文档

在对应风格、技术目录中加入 Markdown，并写好一级标题：

```text
docs/
  mysql/
    index.md
    01-schema.md
  knowledge/
    mysql/
      index.md
      01-basics/
        index.md
        01-overview.md
        02-sql.md
```

```md
# 新知识点

## 概念与结构

按当前知识库风格编写正文。
```

- 文件名用英文和数字；页面、导航名称读取第一个一级标题。
- 文件名按自然顺序排列，`index.md` 排第一；需要控制顺序时加数字前缀。
- 支持嵌套目录，嵌套目录的 `index.md` 一级标题作为分组名称；没有 index 时用目录名。
- 业务型技术目录位于 `docs/`，知识体系型位于 `docs/knowledge/`。新建技术目录并加入 Markdown 会自动增加入口；已知四个技术栈使用标准名称，其他默认使用目录名。
- 业务型技术首页使用 `<KnowledgeCatalog topic="mysql" />`；知识体系型使用 `<KnowledgeCatalog library="knowledge" topic="mysql" />`。
- 知识体系型分组首页可增加 `section="01-basics"` 或 `section="02-advanced/02-indexes"`，自动列出该分组；`section` 是相对于技术目录的路径。
- 技术目录没有 index 时，入口指向首篇文章；`public`、隐藏目录及 `business`、`knowledge` 入口目录不作为业务技术栈收录。
- 开发模式新增、删除文章或修改标题，会自动刷新目录配置；正文修改使用普通热更新。正式静态站必须重新构建后才会包含新增文章。

不需要手动修改导航列表或文章目录。站点范围内的公开 Markdown 都会进入对应技术栈导航；草稿请放到 docs 外或隐藏目录。

## 目录说明

| 路径 | 职责 |
| --- | --- |
| `docs/mysql/` | 业务型 MySQL 正文、速记和资料说明 |
| `docs/knowledge/mysql/` | 按原资料目录组织的知识体系型 MySQL |
| 两套技术目录中的 Redis、RabbitMQ、Spring Boot | 后续技术栈的独立入口 |
| `docs/.vitepress/catalog.mjs` | 扫描 Markdown，生成目录数据及监听目录变化 |
| `docs/.vitepress/config.mjs` | VitePress 基础配置、本地搜索和自动导航 |
| `docs/.vitepress/libraries.mjs` | 风格识别、同技术栈切换和搜索范围过滤 |
| `docs/.vitepress/theme/` | 自动分层目录、当前知识库标识与切换，复用默认主题 |
| `tests/` | 自动目录、双库隔离、切换与搜索范围测试 |

## 内容维护原则

业务型按问题组织，优先解释结论、原因、做法与边界。知识体系型参考原资料目录，按知识点自然组织概念、机制和联系，不强制安排导入、结束或额外的前置学习模板。两套正文不互相依赖。

两套都面向 Java 后端开发者，保留必要原理，省略环境安装、部署和完整项目操作；知识体系型运维篇适当压缩纯运维内容。PDF 来源、补充与校正在文末说明。旧样章和自拟大纲已移除，版本历史仍可从 Git 查询。

本次 PDF 原文件保留在原目录，仓库不复制大文件。提取的中间文本与临时验证文件位于忽略的 `.work/`，站点运行不依赖 PDF 或 Python。

本次检查结果、排查过程和未验证范围见 [验证记录](./VALIDATION.md)。
