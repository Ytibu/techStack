# 2. JVM 进程缓存

## 2.1 商品与库存缓存

原文为“按 ID 查询商品”和“按 ID 查询库存”分别建立本地缓存。缓存命中直接返回，未命中才查询数据库并保存结果；分开管理便于设置不同容量与更新周期。

进程缓存仅对当前 JVM 有效。重启会丢失，多实例之间也不会自动保持一致。

## 2.2 Caffeine

Caffeine 是 Java 本地缓存库，提供并发访问、加载与淘汰等能力。相比直接使用无限增长的 Map，它能控制缓存规模与生命周期。

| 策略 | 常用配置 | 含义 |
| --- | --- | --- |
| 按容量 | `maximumSize` | 限制条目数量，达到限制后选择条目淘汰 |
| 按写入时间 | `expireAfterWrite` | 自创建或最近一次替换值开始计时 |
| 按访问时间 | `expireAfterAccess` | 自最近一次读写访问开始计时 |
| 按引用 | 弱引用、软引用配置 | 借助 GC 回收，行为受对象可达性等影响 |

过期条目对正常读取不可见，物理清理由维护任务等完成，不必在到期瞬间立即释放全部内存。容量限制统计的是条目数时，也不能直接当成内存字节上限。

## 2.3 实现 JVM 缓存

```java
Cache<Long, Item> itemCache = Caffeine.newBuilder()
    .initialCapacity(100)
    .maximumSize(10_000)
    .expireAfterWrite(Duration.ofMinutes(5))
    .build();

Item item = itemCache.get(id, itemRepository::findById);
```

`get(key, loader)` 将未命中后的加载交给缓存处理，避免自行散落“先查再放”的代码。初始容量影响初始化，上限控制最终规模，两者含义不同。

数据库更新后需要使相应本地条目失效或更新；多台 Java 服务要分别接收失效通知。给缓存配置 TTL 可限制旧值保留时间，但不能保证实时一致。
