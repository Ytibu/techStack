# Java 后端知识库

使用 VitePress 默认主题的中文知识库。技术栈按目录相互独立，导航、侧边栏和文章目录自动生成，提供本地全文搜索、页内目录、明暗主题与移动端阅读。

目前完成 MySQL：11 篇知识正文、1 篇高频速记、1 篇资料说明和阅读路线。Redis、RabbitMQ、Spring Boot 仅预留入口。

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

构建产物位于 `docs/.vitepress/dist/`。预览只展示上次构建的静态产物，修改 Markdown 后需要重新构建；开发模式会自动更新。

## 新增文档

直接在对应技术目录加入 Markdown，并在第一行标题写文章名称：

```text
docs/
  mysql/
    index.md
    01-schema.md
    14-new-topic.md
  redis/
    index.md
    01-cache.md
```

```md
# 14 新知识点

## 面试问题

**面试回答：** 先写结论，再写原因、业务做法和边界。
```

- 文件名用英文和数字；页面、导航名称读取第一个一级标题。
- 文件名按自然顺序排列，`index.md` 排第一；需要控制顺序时加数字前缀。
- 支持嵌套目录，嵌套目录的 `index.md` 一级标题作为分组名称；没有 index 时用目录名。
- 新建顶层技术目录并加入 Markdown，会自动增加技术入口；已知四个技术栈使用标准名称，其他技术栈默认用目录名。
- 新模块可建 `index.md`，写一级标题和 `<KnowledgeCatalog topic="目录名" />`，自动展示模块文章；没有 index 时入口指向首篇文章。
- 开发模式新增、删除文章或修改标题，会自动刷新目录配置；正文修改使用普通热更新。正式静态站必须重新构建后才会包含新增文章。

不需要手动修改导航列表或文章目录。站点范围内的公开 Markdown 都会进入对应技术栈导航；草稿请放到 docs 外或隐藏目录。

## 目录说明

| 路径 | 职责 |
| --- | --- |
| `docs/mysql/` | MySQL 面试知识、速记和资料取舍 |
| `docs/redis/`、`docs/rabbitmq/`、`docs/springboot/` | 后续技术栈的独立入口 |
| `docs/.vitepress/catalog.mjs` | 扫描 Markdown，生成目录数据及监听目录变化 |
| `docs/.vitepress/config.mjs` | VitePress 基础配置、本地搜索和自动导航 |
| `docs/.vitepress/theme/` | 默认主题扩展，只注册自动文章目录组件 |
| `tests/` | 自动目录的行为测试 |

## 内容维护原则

面向 Java 后端业务面试，按问题组织，优先“结论—原因—业务做法—边界”。保留支撑业务判断的必要原理，省略环境安装、部署操作与完整项目例子。PDF 来源与补充内容在文章末尾区分，关键版本条件和不适用情形写清楚。

本次 PDF 原文件保留在原目录，仓库不复制大文件。提取的中间文本与临时验证文件位于忽略的 `.work/`，站点运行不依赖 PDF 或 Python。
