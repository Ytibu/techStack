# 1.3 RedisObject 与五种数据类型

## RedisObject

数据库字典的 key 主要使用 SDS，value 则通过 RedisObject 表达类型、编码和具体内容。原文把“键和值都封装成 RedisObject”一概而论，这里区分数据库内部存储与临时命令参数对象。

RedisObject 的核心信息包括逻辑类型、内部编码、访问统计信息、引用计数和内容指针。**类型决定对外能执行什么命令，编码决定内部怎样保存。**

可用 `TYPE key` 查看逻辑类型，用 `OBJECT ENCODING key` 查看当前内部编码。

## String

| 编码 | 用途 |
| --- | --- |
| `int` | 可按对应范围整数表示的值，节省字符串存储空间 |
| `embstr` | 较短字符串，对象头与 SDS 连续分配 |
| `raw` | 较长或需要相应修改形式的字符串，对象与 SDS 分别管理 |

原资料对应的 Redis 6.2 中，embstr 阈值为不超过 44 字节。它是特定实现中 String **值对象**的优化阈值，不是 key 命名限制。内容变长或执行修改时，内部编码可能变化。见 [Redis 6.2 object.c](https://github.com/redis/redis/blob/6.2/src/object.c)。

## List

原文介绍 3.2 之前的 ZipList / LinkedList，以及 3.2 后引入的 QuickList。QuickList 结合双向链表和紧凑块，适合双端操作。

List 按索引访问通常需要定位遍历，不具备数组式任意位置 O(1) 访问能力。较新版本的具体编码选择仍需结合对象规模和版本查看。

## Set

在原文版本中，小型纯整数集合可采用 IntSet；超过相应规模或出现非整数成员时转为哈希表编码。Set 对外只承诺成员唯一，不承诺顺序。

Redis 7.2 起，小型 Set 还可能使用 Listpack，不能把“Set 永远只有 IntSet 和哈希表”作为通用结论。

## ZSet

大规模有序集合使用 Dict 和 SkipList 配合：Dict 支持按 member 查询分数，SkipList 支持有序遍历、范围查询和排名。

小规模集合可用紧凑结构节省空间。在原文版本中为 ZipList，member 与 score 相邻保存；达到成员数量或长度阈值后转换。Redis 7.0 起相关紧凑编码改用 Listpack。

## Hash

小 Hash 使用紧凑结构保存相邻的 field 与 value，较大时使用 Dict。Hash 不需要按分数排序，因此没有 ZSet 的 SkipList 部分。

原文以 `hash-max-ziplist-entries 512` 和 `hash-max-ziplist-value 64` 解释转换：字段数量或字段/值长度超过阈值，均可能触发转为字典。Redis 7.0 起对应配置使用 `listpack` 名称。见[编码版本与阈值说明](https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/memory-optimization/)。
