/**
 * 大模型客户端 - 调用智谱AI API生成内容
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

class LLMClient {
  constructor() {
    // 加载API配置
    this.apiKey = this.loadApiKey();
    this.apiUrl = 'open.bigmodel.cn';
    this.model = 'glm-4.7'; // 使用高质量模型
    this.writingStyle = this.loadWritingStyle();
  }

  /**
   * 加载写作风格
   */
  loadWritingStyle() {
    const stylePath = path.join(__dirname, '../../config/writing-style.md');
    if (fs.existsSync(stylePath)) {
      return fs.readFileSync(stylePath, 'utf8');
    }
    // 返回默认风格
    return this.getDefaultWritingStyle();
  }

  /**
   * 获取默认写作风格
   */
  getDefaultWritingStyle() {
    return `
## 写作风格要求

### 1. 口语化表达
像和朋友聊天一样写文章，避免书面语

### 2. 情绪外放
直接表达感受：太爽了、气死、坑、真香、翻车

### 3. 完整段落表达（重要！）
用完整段落表达，避免碎片化短句
- 段落之间要有逻辑连接
- 一个完整意思用一段话完成
- 避免一句话就分段

### 4. 实用主义
少废话，多干货，每段都要有信息量

### 5. 真实体验
敢吐槽，敢承认不足，分享真实经历

## 禁用词汇
❌ 震惊、奇迹、绝密、此外、综上所述、显然、毋庸置疑
`;
  }

  /**
   * 加载API密钥
   */
  loadApiKey() {
    // 尝试从 image.env 加载（已有智谱API密钥）
    const imageEnvPath = path.join(__dirname, '../image.env');
    if (fs.existsSync(imageEnvPath)) {
      const config = dotenv.parse(fs.readFileSync(imageEnvPath));
      if (config.API_KEY) {
        return config.API_KEY;
      }
    }

    // 尝试从 llm.env 加载
    const llmEnvPath = path.join(__dirname, '../llm.env');
    if (fs.existsSync(llmEnvPath)) {
      const config = dotenv.parse(fs.readFileSync(llmEnvPath));
      if (config.API_KEY) {
        return config.API_KEY;
      }
    }

    throw new Error('未找到API密钥，请配置 image.env 或 llm.env 文件');
  }

  /**
   * 调用大模型生成内容
   * @param {string} prompt - 提示词
   * @param {Object} options - 选项
   * @returns {Promise<string>} 生成的内容
   */
  async generate(prompt, options = {}) {
    const {
      temperature = 0.7,
      maxTokens = 4000,
      model = null
    } = options;

    const requestData = JSON.stringify({
      model: model || this.model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature,
      max_tokens: maxTokens
    });

    const jwtToken = this.generateToken();

    return new Promise((resolve, reject) => {
      const req = https.request({
        hostname: this.apiUrl,
        path: '/api/paas/v4/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        }
      }, (res) => {
        let data = '';

        res.on('data', chunk => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (response.error) {
              reject(new Error(`API错误: ${response.error.message}`));
            } else if (response.choices && response.choices[0]) {
              resolve(response.choices[0].message.content);
            } else {
              reject(new Error('API返回格式异常'));
            }
          } catch (error) {
            reject(new Error(`解析响应失败: ${error.message}`));
          }
        });
      });

      req.on('error', error => {
        reject(new Error(`请求失败: ${error.message}`));
      });

      req.write(requestData);
      req.end();
    });
  }

  /**
   * 生成JWT Token（简化版本，实际应使用jsonwebtoken库）
   * 注：智谱API的认证方式，这里使用API Key的简化方式
   */
  generateToken() {
    // 智谱API可以直接使用API Key作为Bearer token
    return this.apiKey;
  }

  /**
   * 生成文章关键点
   * @param {string} topic - 主题
   * @param {number} count - 数量
   * @returns {Promise<Array>} 关键点数组
   */
  async generateKeyPoints(topic, count = 5) {
    const prompt = `你是一位专业的财务领域内容创作者。请为文章主题"${topic}"生成${count}个核心关键点。

**要求：**
1. 每个关键点必须是具体、可操作的专业建议
2. 标题要简洁有力，包含数字或具体利益点
3. 说明要专业准确，符合财务/税务规范，避免空洞套话
4. 案例要具体场景化，能实际应用
5. 如果是政策变化类话题，关键点应是具体的"变化"
6. 如果是实操方法类话题，关键点应是具体的"步骤/方法"

**财务领域专业示例：**
- 差：建立规范的财务流程 → 好：建立"三单匹配"机制，确保业务真实可追溯
- 差：做好税务筹划 → 好：充分利用研发费用加计扣除政策，最高可抵免175%

请以JSON数组格式返回：
[
  {
    "title": "关键点标题（8-15字，包含数字或利益点）",
    "description": "详细说明（60-100字，专业且具体）",
    "example": "具体案例（40-60字，真实场景）"
  }
]

只返回JSON数组，不要其他内容。`;

    try {
      const response = await this.generate(prompt, { temperature: 0.8 });

      // 尝试解析JSON
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const keyPoints = JSON.parse(jsonMatch[0]);
        return keyPoints.slice(0, count);
      }

      throw new Error('无法解析生成的关键点');
    } catch (error) {
      console.error(`生成关键点失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 生成完整文章
   * @param {Object} options - 选项
   * @returns {Promise<string>} 文章内容
   */
  async generateFullArticle(options) {
    const {
      title,
      topic,
      targetAudience = '财务人',
      hookType = '痛点暴击型',
      keyPoints = [],
      callToAction = ''
    } = options;

    // 提取关键点标题作为参考
    const keyPointTitles = keyPoints.length > 0
      ? keyPoints.map((p, i) => `${i + 1}. ${p.title}`).join('\n')
      : '';

    const prompt = `你是一位专业的微信公众号内容创作者。

请直接写一篇完整的文章，格式如下：

# ${title || topic}

## 一、开篇钩子

（150-250字，直接切入场景）

## 二、主体内容

### 1. ${keyPoints[0]?.title || '第一部分'}

（直接写2-3段完整内容，不要有占位符）

### 2. ${keyPoints[1]?.title || '第二部分'}

（直接写2-3段完整内容）

### 3. ${keyPoints[2]?.title || '第三部分'}

（直接写2-3段完整内容）

### 4. ${keyPoints[3]?.title || '第四部分'}

（直接写2-3段完整内容）

### 5. ${keyPoints[4]?.title || '第五部分'}

（直接写2-3段完整内容）

## 三、写在最后

（200-350字，包含价值总结、互动提问、关注引导）

---

${this.writingStyle}

---

## 核心要求

1. **直接写内容**：不要使用"（第一段：...）"这种占位符，直接写出完整内容
2. **完整段落**：每段3-6句话，有逻辑连接
3. **禁用列表**：不要用"1. 2. 3."或"首先、其次、最后"
4. **案例融入**：不要单独列出"案例："，要把案例融入段落
5. **口语化**：像聊天一样写
6. **情绪外放**：用"太爽了、气死、坑、真香"等词

请直接输出文章内容，不要添加任何解释性文字。`;

    try {
      return await this.generate(prompt, {
        temperature: 0.8,
        maxTokens: 5000
      });
    } catch (error) {
      console.error(`生成文章失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 生成爆款标题
   * @param {string} topic - 主题
   * @param {number} count - 数量
   * @returns {Promise<Array>} 标题数组
   */
  async generateTitles(topic, count = 8) {
    const prompt = `你是一位专业的标题策划师。请为文章主题"${topic}"生成${count}个爆款标题。

爆款标题公式：
1. 数字+收益：用具体数字承诺收益（如"5个方法让...提高3倍"）
2. 疑问+痛点：用疑问句戳中读者痛点（如"为什么...总是做不好？"）
3. 对比+反差：制造对比或反差（如"同样做...，为什么他比你轻松？"）
4. 时间+紧迫：添加时间紧迫感（如"年底前必须..."）
5. 身份+场景：针对特定身份场景（如"财务人最怕的..."）
6. 警示+避坑：警示风险帮助避坑（如"千万别...，否则..."）

要求：
- 标题字数15-25字
- 包含具体数字
- 直击痛点或利益点
- 适合微信公众号

请以JSON数组格式返回：
[
  {
    "title": "标题内容",
    "formula": "使用的公式（如"数字+收益"）"
  }
]

只返回JSON数组，不要其他内容。`;

    try {
      const response = await this.generate(prompt, { temperature: 0.9 });
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const titles = JSON.parse(jsonMatch[0]);
        return titles.slice(0, count);
      }
      throw new Error('无法解析生成的标题');
    } catch (error) {
      console.error(`生成标题失败: ${error.message}`);
      throw error;
    }
  }
}

module.exports = LLMClient;
