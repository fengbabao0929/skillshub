# 智谱清言平台 - 流控制问题解决方案

> 针对"无论说什么都进入青春节点"问题的智谱清言专属解决方案

---

## 问题诊断

在智谱清言平台配置多Agent节点时，你遇到的问题是：
- 无论用户说什么，系统都直接进入青春节点
- 无法按照正确的顺序（总控 → 童年 → 青春...）流转

---

## 智谱清言平台的流控制机制

### 关键理解

智谱清言平台的智能体画布中，**Agent节点之间的流转是通过"触发条件"控制的**，而不是简单的顺序连接。

**核心概念**：
1. **开始节点** - 用户对话的入口
2. **Agent节点** - 处理对话的智能体
3. **触发条件** - 决定何时跳转到下一个Agent
4. **变量/记忆** - 跨节点共享数据

---

## 解决方案：使用"条件触发"节点

### 正确的架构

```
[开始节点]
    ↓
[条件判断节点]
    ↓
┌───┴───┬─────────┬─────────┬─────────┬─────────┬─────────┐
↓       ↓         ↓         ↓         ↓         ↓         ↓
总控Agent 童年Agent 青春Agent 转折Agent 挣扎Agent 意义Agent 真实Agent
```

**核心思想**：使用一个**条件判断节点**作为中央路由器，根据变量状态决定跳转到哪个Agent。

---

## 详细配置步骤

### 步骤1：创建变量

在智能体配置中，添加以下变量：

| 变量名 | 类型 | 初始值 | 说明 |
|--------|------|--------|------|
| `当前阶段` | string | "initial" | 当前处于哪个阶段 |
| `童年进度` | number | 0 | 童年阶段已完成的问题数 |
| `青春进度` | number | 0 | 青春阶段已完成的问题数 |
| `转折进度` | number | 0 | 转折阶段已完成的问题数 |
| `挣扎进度` | number | 0 | 挣扎阶段已完成的问题数 |
| `意义进度` | number | 0 | 意义阶段已完成的问题数 |
| `真实进度` | number | 0 | 真实阶段已完成的问题数 |
| `访谈记录` | array | [] | 存储所有问答记录 |

**重要**：`当前阶段` 的初始值必须是 `"initial"`，表示首次进入。

---

### 步骤2：创建条件判断节点（中央路由器）

在智谱清言画布中，添加一个**代码节点**或**条件判断节点**：

#### 节点类型：代码节点（推荐）

```javascript
// 智谱清言代码节点配置
// 功能：根据当前状态判断应该跳转到哪个Agent

// 获取变量
const currentStage = "{{当前阶段}}";
const userInput = "{{用户输入}}";

// 判断逻辑
if (currentStage === "initial" || userInput.includes("开始")) {
  // 首次进入或用户说"开始" → 跳转到总控Agent
  return {
    nextAgent: "总控Agent",
    action: "updateVar",
    varName: "当前阶段",
    varValue: "controller"
  };
}

if (currentStage === "controller" && userInput.includes("开始")) {
  // 总控完成后，用户说"开始" → 跳转到童年Agent
  return {
    nextAgent: "童年Agent",
    action: "updateVar",
    varName: "当前阶段",
    varValue: "childhood"
  };
}

if (currentStage === "childhood") {
  const childhoodProgress = parseInt("{{童年进度}}");
  if (childhoodProgress >= 4 || userInput.includes("继续")) {
    // 童年完成，跳转到青春Agent
    return {
      nextAgent: "青春Agent",
      action: "updateVar",
      varName: "当前阶段",
      varValue: "youth"
    };
  } else {
    // 继续童年阶段
    return {
      nextAgent: "童年Agent",
      action: "none"
    };
  }
}

if (currentStage === "youth") {
  const youthProgress = parseInt("{{青春进度}}");
  if (youthProgress >= 4 || userInput.includes("继续")) {
    // 青春完成，跳转到转折Agent
    return {
      nextAgent: "转折Agent",
      action: "updateVar",
      varName: "当前阶段",
      varValue: "turning"
    };
  } else {
    // 继续青春阶段
    return {
      nextAgent: "青春Agent",
      action: "none"
    };
  }
}

if (currentStage === "turning") {
  if (userInput.includes("跳过")) {
    // 跳过转折阶段
    return {
      nextAgent: "挣扎Agent",
      action: "updateVar",
      varName: "当前阶段",
      varValue: "struggle"
    };
  }
  const turningProgress = parseInt("{{转折进度}}");
  if (turningProgress >= 4 || userInput.includes("继续")) {
    // 转折完成，跳转到挣扎Agent
    return {
      nextAgent: "挣扎Agent",
      action: "updateVar",
      varName: "当前阶段",
      varValue: "struggle"
    };
  } else {
    // 继续转折阶段
    return {
      nextAgent: "转折Agent",
      action: "none"
    };
  }
}

if (currentStage === "struggle") {
  if (userInput.includes("跳过")) {
    // 跳过挣扎阶段
    return {
      nextAgent: "意义Agent",
      action: "updateVar",
      varName: "当前阶段",
      varValue: "meaning"
    };
  }
  const struggleProgress = parseInt("{{挣扎进度}}");
  if (struggleProgress >= 4 || userInput.includes("继续")) {
    // 挣扎完成，跳转到意义Agent
    return {
      nextAgent: "意义Agent",
      action: "updateVar",
      varName: "当前阶段",
      varValue: "meaning"
    };
  } else {
    // 继续挣扎阶段
    return {
      nextAgent: "挣扎Agent",
      action: "none"
    };
  }
}

if (currentStage === "meaning") {
  const meaningProgress = parseInt("{{意义进度}}");
  if (meaningProgress >= 4 || userInput.includes("继续")) {
    // 意义完成，跳转到真实Agent
    return {
      nextAgent: "真实Agent",
      action: "updateVar",
      varName: "当前阶段",
      varValue: "vulnerable"
    };
  } else {
    // 继续意义阶段
    return {
      nextAgent: "意义Agent",
      action: "none"
    };
  }
}

if (currentStage === "vulnerable") {
  const vulnerableProgress = parseInt("{{真实进度}}");
  if (vulnerableProgress >= 4 || userInput.includes("继续") || userInput.includes("生成故事")) {
    // 真实完成，跳转到写作助手Agent
    return {
      nextAgent: "写作助手Agent",
      action: "updateVar",
      varName: "当前阶段",
      varValue: "completed"
    };
  } else {
    // 继续真实阶段
    return {
      nextAgent: "真实Agent",
      action: "none"
    };
  }
}

// 默认：根据当前阶段返回对应Agent
const stageToAgentMap = {
  "controller": "总控Agent",
  "childhood": "童年Agent",
  "youth": "青春Agent",
  "turning": "转折Agent",
  "struggle": "挣扎Agent",
  "meaning": "意义Agent",
  "vulnerable": "真实Agent",
  "completed": "写作助手Agent"
};

return {
  nextAgent: stageToAgentMap[currentStage] || "总控Agent",
  action: "none"
};
```

---

### 步骤3：节点连接方式

#### ❌ 错误的连接方式

```
[开始] → [总控] → [童年] → [青春] → ...
```

这种连接方式会导致：无论用户说什么，都按照固定的顺序流向下一个节点。

#### ✅ 正确的连接方式

```
[开始节点]
    ↓
[条件判断节点]
    ↓
[由条件判断决定跳转到哪个Agent]
```

**每个Agent完成后，都返回到条件判断节点**，而不是直接连接到下一个Agent。

---

### 步骤4：配置每个Agent的"触发条件"

在智谱清言中，每个Agent节点需要配置**触发条件**：

#### 总控Agent

| 配置项 | 值 |
|--------|---|
| 触发条件 | `{{当前阶段}} == "controller"` |
| 触发后动作 | 更新 `{{当前阶段}}` 为 "childhood" |
| 跳转目标 | 条件判断节点 |

#### 童年Agent

| 配置项 | 值 |
|--------|---|
| 触发条件 | `{{当前阶段}} == "childhood"` |
| 完成条件 | `{{童年进度}} >= 4` 或 用户说"继续" |
| 触发后动作 | 更新 `{{当前阶段}}` 为 "youth" |
| 跳转目标 | 条件判断节点 |

#### 青春Agent

| 配置项 | 值 |
|--------|---|
| 触发条件 | `{{当前阶段}} == "youth"` |
| 完成条件 | `{{青春进度}} >= 4` 或 用户说"继续" |
| 触发后动作 | 更新 `{{当前阶段}}` 为 "turning" |
| 跳转目标 | 条件判断节点 |

#### 其他阶段Agent...

类似配置，每个Agent完成后都**跳转回条件判断节点**。

---

## 调试检查清单

如果仍然出现流控制问题，请按以下清单检查：

### 基础检查

- [ ] `当前阶段` 变量的初始值是否设置为 `"initial"`？
- [ ] 是否创建了**条件判断节点**作为中央路由器？
- [ ] 条件判断节点是否放在**开始节点之后**？
- [ ] 所有Agent是否都**不直接连接**，而是通过条件判断节点跳转？

### 连接检查

- [ ] 开始节点 → 条件判断节点
- [ ] 条件判断节点 → 根据判断结果 → 各个Agent
- [ ] 每个Agent完成后 → 条件判断节点（不是直接到下一个Agent）

### 变量检查

- [ ] 每个Agent是否正确更新了对应的进度变量？
- [ ] 条件判断节点是否正确读取了变量状态？
- [ ] 变量名是否完全一致（注意大小写）？

### 条件检查

- [ ] 条件判断的顺序是否正确？（从特殊到一般）
- [ ] "跳过"判断是否在"继续"判断之前？
- [ ] 默认情况（else）是否正确处理？

---

## 简化方案：单Agent架构

如果上述配置仍然复杂或不稳定，可以考虑**单Agent架构**：

### 架构

```
[开始] → [访谈Agent] → [写作Agent] → [结束]
```

### 优势

- ✅ 无需复杂的条件判断
- ✅ 状态管理在Agent内部
- ✅ 配置简单，调试容易
- ✅ 不依赖平台的流控制机制

### 配置方法

参考文档：[life-story-simple-solution.md](./life-story-simple-solution.md)

---

## 测试流程

正确的测试流程应该是：

1. **首次对话**
   - 用户输入任意内容
   - 预期：进入总控Agent，看到欢迎语

2. **说"开始"**
   - 用户输入"开始"
   - 预期：进入童年Agent，看到第1个问题

3. **回答问题**
   - 用户回答童年问题
   - 预期：继续在童年Agent，看到第2个问题

4. **完成童年阶段（4个问题）**
   - 用户输入"继续"
   - 预期：进入青春Agent，看到青春第1个问题

5. **跳过转折阶段**
   - 在转折Agent，用户输入"跳过"
   - 预期：进入挣扎Agent

6. **完成所有阶段**
   - 完成所有6个阶段
   - 用户输入"生成故事"
   - 预期：进入写作助手Agent

---

## 常见问题

### Q1: 为什么总是进入青春节点？

**A**: 可能的原因：
1. 青春Agent被设置为默认节点
2. 条件判断节点配置错误
3. `当前阶段` 变量初始值不是 "initial"
4. 节点之间直接连接，没有通过条件判断

**解决**：按照上述步骤重新配置条件判断节点。

### Q2: 变量没有更新怎么办？

**A**: 检查：
1. Agent是否配置了"变量/记忆"工具
2. 变量名是否完全匹配
3. 是否有权限写入变量

### Q3: 跳过功能不生效？

**A**: 检查：
1. 条件判断中"跳过"的判断是否在"继续"之前
2. 转折和挣扎阶段的条件是否正确

---

## 推荐方案对比

| 方案 | 复杂度 | 稳定性 | 适用场景 |
|------|--------|--------|----------|
| 多节点+条件判断 | 高 | 中 | 有丰富配置经验，需要高度模块化 |
| 单Agent架构 | 低 | 高 | 快速部署，配置经验有限 |

---

*文档版本: 1.0*
*创建日期: 2026-01-13*
*针对平台: 智谱清言*
*解决问题: 无论说什么都进入青春节点*
