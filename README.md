# Java 后端知识库

使用 VitePress 默认主题的中文知识库，面向已有基础、需要系统复习的 Java 后端开发者。所有技术栈默认采用知识体系型内容；其他风格作为该技术目录下的可选子目录维护。

首页、顶部导航、侧边栏和搜索范围从 Markdown 目录生成。只有技术栈存在其他风格时，首页和导航才显示括号中的额外入口；普通章节子目录不会被识别为另一种风格。

## 内容与地址

| 内容 | 地址 | 维护目录 |
| --- | --- | --- |
| 总首页 | `/` | `docs/index.md` |
| MySQL 知识体系 | `/mysql/` | `docs/mysql/` |
| MySQL 业务型 | `/mysql/scenarios/` | `docs/mysql/scenarios/` |
| Redis 知识体系 | `/redis/` | `docs/redis/` |
| RabbitMQ 预留专题 | `/rabbitmq/` | `docs/rabbitmq/` |
| Spring Boot 预留专题 | `/springboot/` | `docs/springboot/` |

MySQL 默认内容按三份原资料的十七章主线整理为 21 篇正文，业务型保留 11 篇正文与 20 问速记。Redis 根据五份 Markdown 整理为 26 篇正文，覆盖分布式缓存、多级缓存、最佳实践、原理篇和注释版。

原来的全局风格容器已移除。原知识体系型 MySQL 地址从 `/knowledge/mysql/` 改为 `/mysql/`，原业务文章移动到 `/mysql/scenarios/`；站内链接与目录同步更新，不再通过风格总入口中转。

## 本地使用

环境：Node.js 20 或以上。现有环境为 Node.js 24.12.0、npm 11.6.2；VitePress 固定为 1.6.4，依赖版本由 package-lock.json 锁定。

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

构建产物位于 `docs/.vitepress/dist/`。preview 展示上次构建的静态产物，修改后需要重新构建并重启预览；日常编辑可使用开发模式热更新。

## 目录约定

```text
docs/
  index.md
  mysql/
    index.md                 # 默认知识体系
    01-basics/
      index.md               # 普通章节，不产生其他风格入口
      01-overview.md
    scenarios/
      index.md               # 标记 style 后识别为其他风格
      01-schema.md
  redis/
    index.md
    01-distributed/
      index.md
      01-persistence.md
```

### 默认知识体系

直接在技术目录下维护正文和章节。技术首页可用单行 `description` 说明首页显示的内容简介：

```md
---
description: 基础、索引、事务、锁与运维机制。
---

# MySQL 知识体系

<KnowledgeCatalog topic="mysql" />
```

分组首页使用 `<KnowledgeCatalog topic="mysql" section="01-basics" />`。`section` 相对于当前风格的根目录；嵌套章节也可写为 `02-advanced/02-indexes`。

### 可选的其他风格

在技术目录的直接子目录中创建 `index.md`，添加单行 `style` 字段：

```md
---
style: 业务型
---

# MySQL 面试知识库

<KnowledgeCatalog topic="mysql" />
```

目录名可以按内容命名，例如 `scenarios/`、`quick-reference/`；显示名称读取 `style`，不依赖固定目录名或特定技术栈。普通章节即使有 `index.md`，没有该标记就仍然属于默认知识体系。

- 只在存在风格标记时显示额外入口，增加、改名、移除标记后自动更新。
- 一个技术栈可有多个其他风格，各自维护正文、目录和上下篇。
- 默认侧边栏排除其他风格，其他风格的侧边栏只显示自身正文。
- 首页搜索覆盖全部；专题内搜索当前技术栈与当前风格，默认内容排除其他风格的结果。
- 默认内容与其他风格的页面使用同一个目录组件，不需要手工填写文章清单。

### 自动收录

文件名优先英文和数字，页面标题读取首个一级标题；按自然顺序排列，`index.md` 优先。支持任意深度的普通章节，分组名读取该目录首页的一级标题。

新增技术目录会自动进入首页和顶部导航。已知四个技术栈使用标准名称，其他技术栈默认使用目录名。技术目录没有首页时，入口指向首篇文章。

隐藏目录和 `public/` 不收录。草稿应放在 docs 外或隐藏目录。新增、删除文章、修改标题或目录元数据会刷新导航和搜索，正文修改使用普通热更新。

## 实现职责

| 路径 | 职责 |
| --- | --- |
| `docs/.vitepress/catalog.mjs` | 扫描技术栈、章节、可选风格及元数据，监听目录变化 |
| `docs/.vitepress/catalog.data.mjs` | 向页面组件提供统一目录数据 |
| `docs/.vitepress/scopes.mjs` | 根据当前路由定位技术栈和风格，过滤搜索结果 |
| `docs/.vitepress/config.mjs` | 默认主题、本地搜索、自动导航和独立侧边栏 |
| `docs/.vitepress/theme/` | 通用技术导航、专题上下文、首页入口及分层目录 |
| `tests/catalog.test.mjs` | 自动收录、可选风格识别、路由及搜索隔离测试 |

## 内容维护

知识体系型参考原资料目录，解释概念、机制和联系，压缩安装、完整项目操作和重复演示。业务型按问题组织，保留结论、原因、做法和边界。来源对应、补充与校正保存在各专题的资料说明中。

Redis 的相似目录或标题资料直接跳过，不合并；本次未纳入额外实战篇。原资料保留在原位置，仓库不复制大文件，站点运行也不依赖原 PDF、图片或提取工具。

验证过程、排查记录和未验证范围见 [验证记录](./VALIDATION.md)。
