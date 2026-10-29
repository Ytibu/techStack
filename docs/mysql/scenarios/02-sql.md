# 02 SQL 语义与业务查询

## WHERE 和 HAVING 有什么区别？

**面试回答：** WHERE 在分组前筛选行，HAVING 在分组后筛选分组结果。只依赖原始行的条件尽量提前筛选，减少进入聚合的数据；针对总金额、订单数等聚合值的条件写在 HAVING。

常见查询的逻辑理解顺序是 `FROM / JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT`。这是理解语义的顺序，优化器可以改变物理执行路径，不能据此断言数据库必定先扫描完所有表。

```sql
SELECT user_id, COUNT(*) AS order_count
FROM orders
WHERE status = 'PAID'
GROUP BY user_id
HAVING COUNT(*) >= 3;
```

这表示“至少有三笔已支付订单的用户”。不应把支付状态的筛选拖到分组之后，也不能随便返回既未分组又未聚合、且不满足函数依赖条件的字段。

## LEFT JOIN 为什么会查丢主表记录？

**面试回答：** LEFT JOIN 会保留左表行，没有匹配时右表补 NULL。但如果在 WHERE 中要求右表某列等于某个值，补 NULL 的行会被过滤，效果可能变成内连接。需要保留没有匹配数据的主表记录时，应把右表的匹配限制放进 ON。

```sql
SELECT u.id, o.id AS order_id
FROM users u
LEFT JOIN orders o
  ON o.user_id = u.id AND o.status = 'PAID';
```

这条 SQL 保留没有已支付订单的用户。若把 `o.status = 'PAID'` 放在 WHERE，未匹配行会被排除。应先确定业务到底要“所有用户及其支付订单”，还是“有支付订单的用户”。

**追问：为什么 LEFT JOIN 后 COUNT(*) 不是 0？** 补 NULL 的那一行仍然存在。统计匹配订单数量应使用 `COUNT(o.id)`，并确保 o.id 是非空标识。

## 一对多关联为什么导致金额或数量翻倍？

**面试回答：** 连接结果的粒度发生了变化。一笔订单有多条明细，JOIN 后订单金额会重复出现；再对订单金额求和就会重复计算。先确定统计粒度，再选择明细预聚合、分别聚合或用 EXISTS 只判断是否存在。

`SUM(DISTINCT order_amount)` 不能通用解决，因为两笔不同订单可能金额相同，去重会误删合法金额。`DISTINCT` 也不能掩盖错误的连接条件。

**业务追问：用户列表只需要“是否下过单”？** 使用 EXISTS 表达存在性，避免把所有订单连接出来再对用户去重。实际性能仍需结合索引和执行计划，不能只凭 EXISTS 或 JOIN 的写法断言优劣。

## NULL 为什么经常造成查询结果异常？

**面试回答：** NULL 表示缺失或未知，`= NULL` 和 `<> NULL` 不能用于常规空值判断，应使用 `IS NULL`、`IS NOT NULL`。WHERE 只保留条件为 TRUE 的行，UNKNOWN 也会被过滤。

尤其注意 `NOT IN`：当子查询结果含 NULL 时，某些“不等于任何值”的判断会变成 UNKNOWN，导致预期记录消失。排除关联记录时，通常可以用正确关联的 NOT EXISTS，或明确排除子查询中的 NULL。

**追问：SUM 没有数据时返回什么？** `SUM` 等聚合在没有可用输入时返回 NULL，`COUNT` 返回 0。需要把“没有金额”显示为 0 时，可以用 `COALESCE(SUM(amount), 0)`，但要明确这符合业务展示含义。

## COUNT(*)、COUNT(1)、COUNT(字段) 有什么区别？

**面试回答：** COUNT(*) 统计结果行数，COUNT(1) 统计非 NULL 常量，结果相同；COUNT(字段) 只统计该字段非 NULL 的行。统计总行数优先用 COUNT(*)，语义最清楚，不能说 COUNT(1) 固定比 COUNT(*) 快。

InnoDB 在并发事务下，不同快照可见的行数可能不同，因此一般不能靠一个全局精确计数直接返回带事务语义的总数。即使遍历较小的索引，精确 COUNT 也可能有明显成本。

**追问：分页接口一定要每次查总数吗？** 若只需要“是否还有下一页”，可以多查一条判断；总量可按业务接受程度使用异步统计或缓存，但必须说明这是近似或延迟值。

## UNION 与 UNION ALL 怎么选？

**面试回答：** UNION 合并后去重，UNION ALL 保留重复行，通常减少去重成本。是否去重取决于业务语义；不能为了性能把需要去重的查询直接改为 UNION ALL。

如果两个结果集按互斥条件拆分，确认不会重叠后可以使用 UNION ALL。外层需要全局排序和分页时，应针对合并结果处理，不能误把每个分支的局部排序当成最终顺序。

## 时间范围查询为什么常用左闭右开？

**面试回答：** 查询某一天的数据时，使用 `created_at >= 当天零点 AND created_at < 次日零点`。这样不依赖最后一秒的小数精度，连续时间区间不会重叠，也更容易利用普通时间列索引。

避免直接对索引列写 `DATE(created_at) = ?` 再假定普通索引仍能高效定位；函数索引或生成列索引是另外的设计。时间边界要使用数据库与应用一致的时区。

## DELETE、TRUNCATE、DROP 面试怎么答？

**面试回答：** DELETE 删除符合条件的数据，在 InnoDB 事务中通常可以回滚；TRUNCATE 清空整张表，属于会隐式提交的 DDL，不能按普通 DELETE 那样用业务事务回滚；DROP 删除表对象本身。

“TRUNCATE 更快”不是选择依据的全部。业务需要条件过滤、回滚、审计或触发器语义时，都不能随意替换。MySQL 8.0 的原子 DDL 指故障时 DDL 的原子性，不等于支持用户 ROLLBACK 撤销 DDL。

::: details 资料对应与补充
PDF：《基础篇》34–49 页（DML/DQL）、53–61 页（函数）、69–87 页（关联和子查询）；《进阶篇》60–61 页（COUNT）。统计粒度、时间边界与分页取舍为业务补充。

官方核对：[聚合函数](https://dev.mysql.com/doc/refman/8.0/en/aggregate-functions.html)、[隐式提交](https://dev.mysql.com/doc/refman/8.0/en/implicit-commit.html)。
:::
