# Content Writer 参考文档

## API 参考

### generateContent(options)

生成自媒体文案

**参数：**
- `options` (Object)：配置选项
  - `topic` (String)：文案主题
  - `platform` (String)：目标平台（微信公众号/小红书/微博等）
  - `style` (String)：文案风格
  - `maxLength` (Number)：最大字数
  - `keywords` (Array)：关键词列表

**返回值：**
- `String`：生成的文案内容

**示例：**
```javascript
const options = {
  topic: 'AI工具Claude Code的使用体验',
  platform: '微信公众号',
  style: '轻松有趣',
  maxLength: 500,
  keywords: ['AI编程', '效率提升', '程序员']
};

const content = await generateContent(options);
console.log(content);
```

### polishContent(content, options)

润色现有文案

**参数：**
- `content` (String)：原始文案内容
- `options` (Object)：配置选项
  - `platform` (String)：目标平台
  - `style` (String)：目标风格
  - `maxLength` (Number)：最大字数

**返回值：**
- `String`：润色后的文案内容

**示例：**
```javascript
const content = 'Claude Code是一个很好的AI编程工具，它能帮助程序员提高工作效率。';
const options = {
  platform: '小红书',
  style: '轻松有趣',
  maxLength: 300
};

const polishedContent = await polishContent(content, options);
console.log(polishedContent);
```

### convertFormat(content, fromFormat, toFormat)

转换文案格式

**参数：**
- `content` (String)：原始文案内容
- `fromFormat` (String)：原始格式
- `toFormat` (String)：目标格式

**返回值：**
- `String`：转换后的文案内容

**示例：**
```javascript
const content = '# 标题\n\n正文内容';
const fromFormat = 'markdown';
const toFormat = 'html';

const htmlContent = await convertFormat(content, fromFormat, toFormat);
console.log(htmlContent);
```

## 配置参考

### 平台配置

#### 微信公众号
- 标题长度：20-30字
- 正文风格：正式、专业
- 标签数量：3-5个
- 图片要求：900*500像素

#### 小红书
- 标题长度：10-20字
- 正文风格：轻松、有趣、使用表情符号
- 标签数量：5-10个
- 图片要求：3:4比例

#### 微博
- 标题长度：10-15字
- 正文风格：简洁、生动
- 标签数量：2-3个
- 图片要求：正方形

### 风格配置

#### 正式风格
- 使用专业术语
- 结构清晰
- 逻辑严谨
- 避免使用表情符号

#### 轻松风格
- 使用口语化表达
- 加入适当的幽默
- 使用表情符号
- 段落短小精悍

#### 幽默风格
- 使用夸张的比喻
- 加入网络流行语
- 使用大量表情符号
- 结构灵活

#### 专业风格
- 使用行业术语
- 提供数据支持
- 引用权威来源
- 格式规范

## 最佳实践

### 1. 主题选择
- 选择热门话题
- 结合当前热点
- 关注用户需求
- 保持内容独特性

### 2. 标题设计
- 使用数字吸引注意力
- 提出问题引发好奇
- 使用感叹号增强语气
- 包含关键词

### 3. 内容结构
- 开头吸引眼球
- 中间详细阐述
- 结尾总结升华
- 加入适当的图片

### 4. 标签使用
- 选择热门标签
- 结合内容主题
- 控制标签数量
- 使用相关标签

### 5. 发布时间
- 微信公众号：早上8点、中午12点、晚上8点
- 小红书：早上9点、下午3点、晚上7点
- 微博：中午12点、晚上8点、周末全天

## 常见问题

### Q: 生成的文案不符合预期怎么办？
A: 可以尝试以下方法：
1. 调整关键词
2. 改变文案风格
3. 增加详细描述
4. 分步骤生成

### Q: 如何提高文案质量？
A: 建议：
1. 提供详细的主题描述
2. 指定明确的风格要求
3. 提供示例文案
4. 多生成几次选择最佳结果

### Q: 支持哪些语言？
A: 目前主要支持中文，未来会考虑增加其他语言支持。

### Q: 文案生成速度慢怎么办？
A: 可能的原因：
1. 网络连接问题
2. 服务器负载高
3. 文案长度过长

建议：
1. 检查网络连接
2. 减少文案长度
3. 选择非高峰时段使用

## 版本历史

### v1.2.0 (2026-01-04)
- 优化内容润色算法
- 增加格式转换功能
- 改进配置选项

### v1.1.0 (2026-01-03)
- 增加多平台适配功能
- 优化文案生成质量
- 修复已知问题

### v1.0.0 (2026-01-02)
- 初始版本
- 支持基本文案生成
- 支持微信公众号和小红书平台
