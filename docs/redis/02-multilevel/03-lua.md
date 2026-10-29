# 3. Lua 语法入门

## 3.1 Lua 的用途

Lua 是轻量脚本语言。OpenResty 将它嵌入 Nginx，用于读取请求、查询缓存和组织响应。Redis 中的 Lua 脚本则在 Redis 服务端执行，两者运行环境与 API 不同。

## 3.2 变量、table 与循环

变量通常使用 `local` 声明。常见类型包括 `nil`、`boolean`、`number`、`string`、`table` 和 `function`；可用 `type(value)` 查看类型。

```lua
local item = { id = 1001, name = "键盘" }
local ids = { 1001, 1002 }

for index, id in ipairs(ids) do
    print(index, id)
end

for field, value in pairs(item) do
    print(field, value)
end
```

table 同时承担数组和映射用途。常规序列从 1 开始；`ipairs` 顺序遍历并在首个缺失整数项处停止，`pairs` 遍历键值但不保证顺序。

## 3.3 条件控制与函数

```lua
local function describe(item)
    if item == nil then
        return "商品不存在"
    elseif item.id == nil then
        return "缺少商品 ID"
    else
        return "商品：" .. item.name
    end
end
```

逻辑运算使用 `and`、`or`、`not`，不等于使用 `~=`，字符串拼接使用 `..`。只有 `nil` 和 `false` 被判为假，`0` 和空字符串都为真。

函数可返回多个值，常见 `local value, err = read_data()` 模式分别接收结果与错误。模块可通过返回 table 导出函数，再使用 `require` 加载。
