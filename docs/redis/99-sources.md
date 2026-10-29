# 资料说明与章节对应

## 采用的五份原文

以下路径相对于原始 `redis/` 资料目录。站点正文已独立保存，运行时不依赖原文件或原资料中的图片。

| 模块 | 唯一采用的文件 | 知识库目录 |
| --- | --- | --- |
| 分布式缓存 | `01-分布式缓存/Redis高级-分布式缓存.md` | [分布式缓存](./01-distributed/) |
| 多级缓存 | `02-多级缓存/多级缓存.md` | [多级缓存](./02-multilevel/) |
| 最佳实践 | `03-Redis最佳实践/Redis高级篇之最佳实践.md` | [最佳实践](./03-best-practices/) |
| 原理篇 | `Redis原理篇/原理篇.md` | [原理篇](./04-internals/) |
| 注释版 | `Redis注释版/Redis.md` | [注释版](./05-annotated/) |

目录或标题相似的重复材料直接跳过，不做内容合并。三个“Redis高级篇-”目录下的对应文档与前三份文件逐一哈希相同，故仅使用上表版本；注释版中的《01.快速入门.md》不参与编写。《00.课程介绍.md》和本次范围之外的《Redis实战篇.md》也不收录为正文来源。

## 原章节如何对应

| 原文章节 | 改编后的页面 |
| --- | --- |
| 分布式缓存 1～4 章 | 持久化、主从、哨兵、分片集群，逐章对应 |
| 多级缓存 1～5 章 | 架构、JVM 缓存、Lua、实现多级缓存、缓存同步，逐章对应 |
| 最佳实践 1～7 章 | 键值、批处理、持久化、慢查询、安全、内存、集群选择，逐章对应 |
| 原理篇第 1 章 | 按原小节顺序拆为基础结构、序列结构、对象与五种数据类型三页 |
| 原理篇第 2 章 | 网络模型，保留 I/O 模型、复用机制与线程模型顺序 |
| 原理篇第 3 章 | RESP 单独一页；其后的过期处理与内存淘汰单独一页 |
| 注释版第 1～3 章 | 略去导读与课程目录，正文集中到“初识 Redis” |
| 注释版第 4～6 章 | 常见命令、Jedis、Spring Data Redis，逐章对应 |

原理篇的 SkipList 小节在原文中缺少规范 Markdown 标题，仍按所在位置保留。原文的局部重号改为可阅读的层级，不改变知识点的先后关系。

共 26 篇正文，另有五个分篇目录、Redis 总目录和本页。每篇围绕原有知识点缩写，不改为面试问答，也不另行编写第二种风格。

## 简化与校正

省略课程串场、环境安装截图、工程导入和长篇重复测试。保留有助于复习的命令、短代码和流程；代码是机制示例，不是经过完整工程运行的应用。

保留原文以 Redis 6.x 为主的背景，不把历史实现写成全版本通则。主要校正包括：

- `repl_backlog` 是内存缓冲区；增量同步还需复制历史和偏移范围匹配。
- Sentinel 的 quorum 与多数授权不同；Cluster 通常通过客户端重定向完成访问。
- 同步双写不自动获得强一致，多级本地缓存需分别传播失效。
- 44 字节属于相应版本 embstr 值对象的阈值，不是数据库 key 的命名限制。
- Pipeline 不等于事务；Cluster 中满足同槽条件时可使用 Lua 和事务。
- ZipList、Listpack 与 Set 编码按版本区分；LFU 保留概率增长与衰减机制，移除原文错误公式。
- 不把 NoSQL 等同于纯内存或完全无事务，也不把 Redis 误述为提供 SSH 免密登录。

正文中的校正链接仅用于核对机制与版本，不用于扩展出原文之外的新课程。主要核对来源为 [Redis 6.2 源码](https://github.com/redis/redis/tree/6.2)、[持久化](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/)、[Sentinel](https://redis.io/docs/latest/operate/oss_and_stack/management/sentinel/)、[Cluster 规范](https://redis.io/docs/latest/operate/oss_and_stack/reference/cluster-spec/)、[内存编码](https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/memory-optimization/)、[Pipeline](https://redis.io/docs/latest/develop/using-commands/pipelining/)与[事务](https://redis.io/docs/latest/develop/using-commands/transactions/)。
