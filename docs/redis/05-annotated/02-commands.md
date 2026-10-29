# 2. Redis 常见命令

## 2.1 通用命令

| 命令 | 作用 |
| --- | --- |
| `TYPE key` | 查看值的逻辑类型 |
| `EXISTS key` | 判断键是否存在 |
| `DEL key` | 删除键，释放大对象可能阻塞 |
| `UNLINK key` | 移除键，按对象释放成本与引用计数决定是否后台回收 |
| `EXPIRE key seconds` | 设置键的剩余有效期 |
| `TTL key` | 剩余秒数；-1 为无过期时间，-2 为不存在 |
| `SCAN cursor MATCH pattern COUNT count` | 游标遍历，COUNT 是工作量提示，不保证每批数量 |

`KEYS pattern` 会扫描并一次返回匹配键，大键空间下不适合线上日常遍历。`SCAN` 要循环到返回游标为 0，且需允许重复结果。

## 2.2 String 与 key 结构

String 可保存普通字节内容，也可让命令按整数或浮点文本处理。按 `业务:实体:id` 命名 key，有助于区分不同数据。

| 命令 | 用途 |
| --- | --- |
| `SET` / `GET` | 设置、读取值 |
| `MSET` / `MGET` | 批量设置、读取多个值 |
| `INCR` / `INCRBY` | 整数加一、按步长增加 |
| `INCRBYFLOAT` | 按浮点步长增加 |
| `SET key value NX EX seconds` | 键不存在时写入，并在同一命令内设置过期时间 |

```text
SET shop:item:1001 '{"name":"键盘","price":199}' EX 300
INCR shop:views:1001
```

`SETNX` 后再单独 `EXPIRE` 中间可能中断。需要同时设置时使用一条带 NX 与过期选项的 SET；这仍只是基础能力，不是完整分布式锁方案。

## 2.3 Hash

Hash 保存 field-value 映射，适合按字段访问对象。

```text
HSET shop:user:1 name Alice age 20
HGET shop:user:1 name
HMGET shop:user:1 name age
HINCRBY shop:user:1 age 1
```

`HGETALL` 返回全部字段和值，`HKEYS`、`HVALS` 分别取字段或值，`HDEL` 删除字段，`HSETNX` 只在字段不存在时设置。大 Hash 避免高频全量读取，可使用 `HSCAN` 分批遍历。

原文的多字段写入示例包含 HMSET，这里统一使用支持多字段的 HSET。

## 2.4 List

List 按位置组织元素，允许重复，支持两端插入和弹出。

```text
LPUSH queue:jobs job1 job2
RPOP queue:jobs
LRANGE queue:jobs 0 9
```

`LPUSH` / `RPUSH` 从左/右插入，`LPOP` / `RPOP` 从左/右弹出；`BLPOP` / `BRPOP` 可在没有元素时等待。`LRANGE` 的结束下标包含在结果内，负数下标从尾部计算。

用左进右出可实现基础队列，但简单弹出后消费者崩溃会有消息丢失风险，不能直接等同于有确认、重试的可靠消息系统。

## 2.5 Set

Set 保存无序且不重复的成员，适合去重、成员判断和集合关系。

| 命令 | 用途 |
| --- | --- |
| `SADD` / `SREM` | 添加、移除成员 |
| `SISMEMBER` | 判断成员是否存在 |
| `SCARD` | 返回成员数量 |
| `SINTER` / `SUNION` / `SDIFF` | 交集、并集、差集 |

例如 `SINTER user:1:follows user:2:follows` 查询共同关注。`SMEMBERS` 会读取全部成员，大集合宜使用 `SSCAN` 或限制业务规模。

## 2.6 SortedSet（ZSet）

ZSet 的 member 唯一，每个 member 对应一个 score，适合排行榜与有序范围查询。同分时按 member 字节序排序。

```text
ZADD rank:weekly 100 Alice 80 Bob
ZINCRBY rank:weekly 5 Bob
ZRANGE rank:weekly 0 9 REV WITHSCORES
```

`ZSCORE` 查分数，`ZRANK` / `ZREVRANK` 查升序/降序排名，排名从 0 开始；`ZCARD` 查成员数，`ZCOUNT` 查分数区间数量，`ZREM` 删除成员。

`ZRANGE ... BYSCORE` 可按分数范围读取；区间默认含边界，可用 `(` 表示排除边界。原文使用的 `ZRANGEBYSCORE` 等命令也表达相应查询；示例以支持 REV / BYSCORE 的 Redis 6.2 及以上版本为背景。
