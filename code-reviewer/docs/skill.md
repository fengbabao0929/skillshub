# Code Reviewer Skill

## 技能描述

Code Reviewer 是一个专业的代码审查专家，擅长找出代码中的问题并提供改进建议。

## 核心功能

1. **代码正确性检查**：检查代码是否符合预期逻辑
2. **安全性审查**：识别潜在的安全漏洞
3. **性能评估**：评估代码的性能表现
4. **可维护性分析**：分析代码的可维护性
5. **最佳实践检查**：检查是否符合行业最佳实践

## 使用场景

- 代码审查前的自动检查
- 团队代码质量保证
- 个人代码优化
- 代码库迁移前的评估
- 安全审计

## 输入格式

```
代码语言: [Python/JavaScript/Java/Go等]
代码内容: [要审查的代码]
审查重点: [正确性/安全性/性能/可维护性等]
```

## 输出格式

- Markdown 格式
- 包含问题描述、严重程度、位置、建议
- 支持代码片段展示
- 提供改进方案

## 示例

输入：
```python
def get_user_data(user_id):
    # 从数据库获取用户数据
    query = f"SELECT * FROM users WHERE id = {user_id}"
    result = db.execute(query)
    return result
```

输出：
```markdown
# 代码审查报告

## 问题 1：SQL 注入漏洞

**严重程度**：高

**位置**：第 3 行

**问题描述**：
使用字符串拼接的方式构建 SQL 查询，存在 SQL 注入漏洞。攻击者可以通过构造恶意的 user_id 来执行任意 SQL 语句。

**代码片段**：
```python
query = f"SELECT * FROM users WHERE id = {user_id}"
```

**改进建议**：
使用参数化查询来防止 SQL 注入：

```python
def get_user_data(user_id):
    # 使用参数化查询
    query = "SELECT * FROM users WHERE id = ?"
    result = db.execute(query, (user_id,))
    return result
```

**原因**：
参数化查询会自动处理输入的转义，防止恶意 SQL 语句的执行。

## 问题 2：缺少错误处理

**严重程度**：中

**位置**：第 4 行

**问题描述**：
数据库操作没有错误处理机制，如果数据库连接失败或查询出错，会导致程序崩溃。

**代码片段**：
```python
result = db.execute(query)
```

**改进建议**：
添加异常处理机制：

```python
def get_user_data(user_id):
    try:
        query = "SELECT * FROM users WHERE id = ?"
        result = db.execute(query, (user_id,))
        return result
    except DatabaseError as e:
        logger.error(f"Database error: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise
```

**原因**：
适当的错误处理可以提高程序的健壮性，防止因意外错误导致程序崩溃。

## 总结

本次审查共发现 2 个问题：
- 高严重程度问题：1 个
- 中严重程度问题：1 个

建议在修复这些问题后再进行代码合并。
```

## 配置选项

- `language`：代码语言（默认：自动检测）
- `severity_threshold`：严重程度阈值（默认：全部）
- `checks`：要执行的检查类型（默认：全部）
- `output_format`：输出格式（默认：markdown）
- `max_issues`：最大问题数量（默认：100）

## 版本历史

- v1.0.0：初始版本，支持基本代码审查
- v1.1.0：增加安全性审查功能
- v1.2.0：优化性能评估算法

## 开发者

- 名称：Code Reviewer Team
- 联系方式：code-reviewer@example.com
- 最后更新：2026-01-04
