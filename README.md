# Java 后端知识库

使用 VitePress 默认主题的中文知识库。MySQL 保留业务型与知识体系型两套内容；Redis 只有一套正文，两边入口共用。技术栈按目录维护，新增 Markdown 自动进入相应目录与搜索。

首页介绍项目并提供各技术栈入口。顶部按技术栈导航：`MySQL（业务型）` 中的 `MySQL` 链接到知识体系型首页，`业务型` 链接到业务型首页；Redis、RabbitMQ、Spring Boot 直接进入对应专题。其他专题优先链接知识体系型首页，没有对应页面时使用已有技术目录入口。

MySQL 两套均已完成：业务型保留 11 篇正文与 20 问速记；知识体系型按三份原资料的十七章主线整理为 21 篇正文，另有分篇目录和资料说明。Redis 根据五份 Markdown 的原章节整理为 26 篇正文，覆盖分布式缓存、多级缓存、最佳实践、原理篇和注释版，另有分篇目录和资料说明。RabbitMQ、Spring Boot 暂为预留入口。

## 内容与地址

| 内容 | 地址 | 维护目录 |
| --- | --- | --- |
| 总首页 | `/` | `docs/index.md` |
| 业务型入口 | `/business/` | `docs/business/index.md` |
| 业务型 MySQL | `/mysql/` | `docs/mysql/` |
| 知识体系型入口 | `/knowledge/` | `docs/knowledge/index.md` |
| 知识体系型 MySQL | `/knowledge/mysql/` | `docs/knowledge/mysql/` |
| Redis 统一知识库 | `/redis/` | `docs/redis/` |

已有业务文章的地址保持有效。双风格正文上方可切换到另一风格的同技术栈首页；缺少对应技术栈时返回目标知识库入口。Redis 页面标识为“Redis 知识库”，不提供风格切换。两种入口的 Redis 目录均指向 `/redis/`，旧 `/knowledge/redis/` 页面保留前往统一正文的链接。

首页搜索覆盖全部内容；两种风格的搜索均包含共享 Redis；进入 Redis 页面后只搜索 Redis。

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
  redis/
    index.md
    01-distributed/
      index.md
      01-persistence.md
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
- Redis 只在 `docs/redis/` 增加正文，不在 `docs/knowledge/redis/` 复制；两边目录与搜索会自动引用统一内容。分篇目录使用 `<KnowledgeCatalog topic="redis" section="01-distributed" />`。
- 知识体系型分组首页可增加 `section="01-basics"` 或 `section="02-advanced/02-indexes"`，自动列出该分组；`section` 是相对于技术目录的路径。
- 技术目录没有 index 时，入口指向首篇文章；`public`、隐藏目录及 `business`、`knowledge` 入口目录不作为业务技术栈收录。
- 开发模式新增、删除文章或修改标题，会自动刷新目录配置；正文修改使用普通热更新。正式静态站必须重新构建后才会包含新增文章。

不需要手动修改导航列表或文章目录。站点范围内的公开 Markdown 都会进入对应技术栈导航；草稿请放到 docs 外或隐藏目录。

## 目录说明

| 路径 | 职责 |
| --- | --- |
| `docs/mysql/` | 业务型 MySQL 正文、速记和资料说明 |
| `docs/knowledge/mysql/` | 按原资料目录组织的知识体系型 MySQL |
| `docs/redis/` | 按五份原文目录改编的统一 Redis 知识库 |
| `docs/knowledge/redis/index.md` | 旧地址兼容入口，不维护第二套正文 |
| 两套技术目录中的 RabbitMQ、Spring Boot | 后续技术栈的独立入口 |
| `docs/.vitepress/catalog.mjs` | 扫描 Markdown，生成目录数据及监听目录变化 |
| `docs/.vitepress/config.mjs` | VitePress 基础配置、本地搜索和自动导航 |
| `docs/.vitepress/libraries.mjs` | 风格识别、同技术栈切换和搜索范围过滤 |
| `docs/.vitepress/theme/` | 自动分层目录、当前知识库标识与切换，复用默认主题 |
| `tests/` | 自动目录、双库隔离、共享 Redis、切换与搜索范围测试 |

## 内容维护原则

业务型按问题组织，优先解释结论、原因、做法与边界。知识体系型参考原资料目录，按知识点自然组织概念、机制和联系，不强制安排导入、结束或额外的前置学习模板。两套正文不互相依赖。

Redis 面向已有基础、需要系统复习的读者，保留原文目录和解释顺序，压缩长篇概念与工程操作。相似目录或标题的重复资料直接跳过，不合并；五份来源、章节映射与必要校正见 `docs/redis/99-sources.md`。未纳入本次范围的实战篇不另行扩写。

两套都面向 Java 后端开发者，保留必要原理，省略环境安装、部署和完整项目操作；知识体系型运维篇适当压缩纯运维内容。PDF 来源、补充与校正在文末说明。旧样章和自拟大纲已移除，版本历史仍可从 Git 查询。

本次 PDF 原文件保留在原目录，仓库不复制大文件。提取的中间文本与临时验证文件位于忽略的 `.work/`，站点运行不依赖 PDF 或 Python。

本次检查结果、排查过程和未验证范围见 [验证记录](./VALIDATION.md)。
