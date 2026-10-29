# 4. Spring Data Redis

## 4.1 RedisTemplate

Spring Data Redis 统一 Lettuce、Jedis 等底层客户端的访问方式。Spring Boot 项目一般引入相应 starter、配置连接工厂，再注入模板使用。

| 模板操作入口 | Redis 类型 |
| --- | --- |
| `opsForValue()` | String |
| `opsForHash()` | Hash |
| `opsForList()` | List |
| `opsForSet()` | Set |
| `opsForZSet()` | ZSet |

模板负责序列化、命令封装等工作，连接工厂负责底层连接。不要把模板的泛型参数直接当成 Redis 中实际存储的字节格式。

## 4.2 序列化

Redis 存储的是字节数据。写入 Java 对象前需要选择序列化方式，读取时按相同规则还原。

- JDK 序列化：与 Java 类型体系绑定，可读性与跨语言协作较弱，通常有额外元数据开销。
- JSON：便于观察与跨语言处理；是否携带 Java 类名，取决于所用序列化器与配置。
- 字符串：格式直观，复杂对象需要应用自己编码、解码。

key、value、Hash field、Hash value 的序列化配置应分别明确。迁移格式时，还要考虑旧数据是否能被新读取逻辑识别。

## 4.3 StringRedisTemplate

`StringRedisTemplate` 预设字符串序列化，适合显式使用 JSON 或纯文本的场景。核心操作示意如下，省略注入和异常处理：

```java
String key = "shop:item:" + item.getId();
String json = objectMapper.writeValueAsString(item);
stringRedisTemplate.opsForValue()
    .set(key, json, Duration.ofMinutes(5));

String cached = stringRedisTemplate.opsForValue().get(key);
Item result = cached == null ? null
    : objectMapper.readValue(cached, Item.class);
```

显式指定目标类型可避免依赖值中携带的 Java 类名，但仍需维护数据格式、字段演进和空值语义。

## 4.4 Hash 操作

```java
stringRedisTemplate.opsForHash()
    .put("shop:user:1", "name", "Alice");
Object name = stringRedisTemplate.opsForHash()
    .get("shop:user:1", "name");
```

Hash 便于字段级读写，适合经常局部更新的对象。使用原文所对应的常规 key 级 `EXPIRE` 时，过期针对整个 Hash；字段级过期能力需另行核对版本，不将它当作所有版本都具备的基础行为。

模板也不会自动处理数据库与缓存的同步。缓存键设计、TTL、失效与序列化规则应由应用明确约定。
