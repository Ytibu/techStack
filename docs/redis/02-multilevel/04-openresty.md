# 4. 实现多级缓存

## 4.1 OpenResty 的位置

OpenResty 基于 Nginx 集成 Lua 和相关库。原文由前置 Nginx 接收请求，再交给 OpenResty 执行缓存查询逻辑；Java 服务负责最终回源。

## 4.2 请求监听与参数处理

通过 `location` 匹配路由，再使用 `content_by_lua_file` 执行 Lua 文件。路径捕获参数可从 `ngx.var` 获取，查询参数通过 `ngx.req.get_uri_args()` 获取。

```nginx
location ~ /api/item/(\d+) {
    content_by_lua_file lua/item.lua;
}
```

Lua 处理前应校验 ID 格式；响应可用 `ngx.say()` 输出，并设置对应内容类型。路由中的捕获值可通过 `ngx.var[1]` 读取。

## 4.3 查询 Tomcat 与 JSON 处理

原文使用 `ngx.location.capture()` 发起内部子请求，通过配置好的代理 location 访问 Java 服务。结果中读取 `status`、`header` 和 `body`，先判断 HTTP 状态再使用响应体。

`cjson.decode()` 将 JSON 转为 Lua 值，`cjson.encode()` 将结果编码为 JSON；商品和库存数据应解析后组合，避免靠字符串拼接产生无效 JSON。

### 基于 ID 的负载均衡

轮询会让同一商品访问多个 JVM，各自建立重复缓存。按稳定的商品标识或请求 URI 哈希，可使相关请求较稳定地落到同一应用实例，提高局部命中率。

节点变化可能改变路由，热点 ID 也可能造成实例负载倾斜；路由稳定不等于缓存一致。

## 4.4 Redis 缓存预热

启动后完全没有缓存称为冷启动。原文在应用初始化时读取商品数据并写入 Redis，实际应优先预热热点数据，控制批量大小和数据库压力。

预热不代表永久有效，仍需设计 TTL 和后续更新。多实例同时启动时，要避免重复全量预热。

## 4.5 查询 Redis 缓存

OpenResty 可通过 `lua-resty-redis` 查询 Redis。一次请求创建或借用连接，设置超时，完成后归还连接池。连接对象不宜作为多个请求任意共享的全局变量。

未命中值需按该库约定识别，例如 `ngx.null`；连接错误和键不存在应分别记录。两者都允许回源时，也要限制回源流量，避免 Redis 故障变成数据库故障。

## 4.6 Nginx 本地缓存

使用共享字典 `lua_shared_dict`，同一 OpenResty 实例的多个 worker 可访问它；不同机器或独立实例间不共享。

```nginx
lua_shared_dict item_cache 150m;
```

```lua
local cache = ngx.shared.item_cache
local value = cache:get(key)
cache:set(key, json, 60)
```

最终读取顺序是“共享字典 → Redis → Java 服务”，命中下层后可回填上层。原文逐步从查询 Tomcat 开始，再加 Redis，最后加本地缓存；实现顺序与最终请求顺序不同。

商品信息与库存可以设置不同 TTL。容量不足时共享字典也可能提前淘汰条目，应检查写入结果，不能假定设置后一定保留到到期。
