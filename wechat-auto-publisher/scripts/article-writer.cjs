/**
 * 文章生成器 - 爆款文章结构生成模块
 * 集成大模型API生成专业内容
 */

const fs = require('fs');
const path = require('path');
const LLMClient = require('./utils/llm-client.cjs');

class ArticleWriter {
  constructor(configPath = null, useLLM = true) {
    this.configPath = configPath || path.join(__dirname, '../config/creation-rules.json');
    this.rules = this.loadRules();
    this.useLLM = useLLM;
    this.llmClient = useLLM ? new LLMClient() : null;
  }

  /**
   * 加载创作规则配置
   */
  loadRules() {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn(`Failed to load creation rules: ${error.message}`);
    }
    return this.getDefaultRules();
  }

  /**
   * 获取默认规则
   */
  getDefaultRules() {
    return {
      openingRules: {
        golden3Seconds: { wordsLimit: 300 }
      },
      contentRules: {
        structure: {
          parts: ['悬念冲突', '痛点放大', '解决方案', '价值升华']
        },
        paragraphRules: { maxLinesMobile: 3 }
      },
      endingRules: {
        templates: []
      }
    };
  }

  /**
   * 生成完整文章
   * @param {Object} options - 生成选项
   * @param {string} options.title - 文章标题
   * @param {string} options.topic - 文章主题
   * @param {string} options.targetAudience - 目标受众
   * @param {string} options.hookType - 开头钩子类型
   * @param {Array<Object>} options.keyPoints - 关键点列表
   * @param {string} options.callToAction - 行动号召
   * @param {boolean} options.useLLM - 是否使用大模型生成
   * @returns {Promise<string>} 完整文章内容（Markdown格式）
   */
  async generateArticle(options) {
    const {
      title = '',
      topic = '',
      targetAudience = '财务人',
      hookType = '痛点暴击型',
      keyPoints = [],
      callToAction = '',
      useLLM = this.useLLM
    } = options;

    if (!topic) {
      throw new Error('Topic is required for article generation');
    }

    // 使用大模型生成完整文章
    if (useLLM && this.llmClient) {
      console.log('\n🤖 正在调用大模型生成文章...');

      // 如果没有提供关键点，先让大模型生成关键点
      let points = keyPoints;
      if (points.length === 0) {
        console.log('📋 生成关键点...');
        points = await this.llmClient.generateKeyPoints(topic, 5);
        console.log(`✓ 生成${points.length}个关键点`);
      }

      // 生成完整文章
      console.log('✍️  生成文章内容...');
      const article = await this.llmClient.generateFullArticle({
        title,
        topic,
        targetAudience,
        hookType,
        keyPoints: points,
        callToAction
      });
      console.log('✓ 文章生成完成\n');
      return article;
    }

    // 不使用大模型时，抛出错误
    throw new Error('文章生成必须使用大模型，请确保API配置正确');
  }

  /**
   * 使用本地模板生成文章（降级方案）
   */
  generateArticleLocal(options) {
    const { title, topic, targetAudience, hookType, keyPoints, callToAction } = options;

    // 生成文章各部分
    const opening = this.generateOpening({ topic, targetAudience, hookType });
    const body = this.generateBody({ topic, keyPoints, targetAudience });
    const ending = this.generateEnding({ topic, callToAction, targetAudience });

    // 组装完整文章
    return this.assembleArticle(title, opening, body, ending);
  }

  /**
   * 生成开头钩子（黄金3秒）
   */
  generateOpening(context) {
    const { topic, targetAudience, hookType } = context;
    const hookTypes = {
      '痛点暴击型': this.generatePainPointHook.bind(this),
      '数据冲击型': this.generateDataHook.bind(this),
      '价值承诺型': this.generateValueHook.bind(this)
    };

    const generator = hookTypes[hookType] || hookTypes['痛点暴击型'];
    return generator(context);
  }

  /**
   * 生成痛点暴击型钩子
   */
  generatePainPointHook(context) {
    const { topic, targetAudience } = context;
    const templates = [
      `你是不是也经常遇到这种情况：做${topic}的时候，总是觉得哪里不对，但又说不上来？`,
      `又是一个加班的夜晚。看着电脑屏幕上${topic}的报表，你叹了口气...`,
      `昨天，一位${targetAudience}找到我，满脸愁容地说："做${topic}太痛苦了，有没有更好的办法？"`
    ];

    const template = templates[Math.floor(Math.random() * templates.length)];

    return `${template}

这不仅仅是你的问题。我接触过成千上万的${targetAudience}，90%的人都在${topic}上踩过坑。

更严重的是，这个问题正在悄悄吞噬你的时间和精力...

别急，今天我就把经过实战检验的方法毫无保留地分享给你。

`;
  }

  /**
   * 生成数据冲击型钩子
   */
  generateDataHook(context) {
    const { topic, targetAudience } = context;

    return `你知道吗？有一项调研显示：

- 75%的${targetAudience}在${topic}上花费的时间超过预期
- 60%的人因为${topic}做不好而影响工作绩效
- 只有不到10%的人掌握了${topic}的精髓

这些数据背后，是一个个${targetAudience}的真实困境。

我也曾是其中一员。直到我发现了一个方法...

今天，我要把这个方法分享给你。

`;
  }

  /**
   * 生成价值承诺型钩子
   */
  generateValueHook(context) {
    const { topic, targetAudience } = context;

    return `接下来的3分钟，我将教你一套让${topic}变得轻松简单的方法。

这套方法我已经用了10年，帮助过无数${targetAudience}：

✓ 效率提升至少50%
✓ 错误率降低80%
✓ 工作时长减少1/3

最重要的是，这套方法简单易学，任何人都能掌握。

准备好了吗？我们开始。

`;
  }

  /**
   * 生成文章主体
   */
  generateBody(context) {
    const { topic, keyPoints, targetAudience } = context;

    let body = `## 一、认清现状：${topic}的常见问题\n\n`;

    // 生成第一部分：问题分析
    body += this.generateProblemSection(topic, targetAudience);

    body += `\n## 二、解决方案：${keyPoints.length}个方法让你事半功倍\n\n`;

    // 生成各个关键点的内容
    keyPoints.forEach((point, index) => {
      body += this.generateKeyPointSection(point, index + 1, targetAudience);
    });

    body += `\n## 三、实战建议：如何快速上手\n\n`;
    body += this.generateActionSection(topic, targetAudience);

    return body;
  }

  /**
   * 生成问题分析部分
   */
  generateProblemSection(topic, targetAudience) {
    return `大多数${targetAudience}在做${topic}时，都会遇到这几个问题：

**问题1：方法不对**
很多人凭感觉做${topic}，没有系统的方法论，结果就是效率低下，错误频出。

**问题2：工具不会**
明明有更好的工具，却还在用最原始的方法，浪费了大量时间。

**问题3：流程混乱**
没有标准化的流程，每次都从头开始，效率自然高不了。

这些问题如果不解决，${topic}永远都是你的痛点。

`;
  }

  /**
   * 生成关键点部分
   */
  generateKeyPointSection(point, index, targetAudience) {
    const { title, description, example } = point;

    let section = `### ${index}. ${title}\n\n`;
    section += `${description}\n\n`;

    if (example) {
      section += `**举个例子**\n\n${example}\n\n`;
    }

    section += `这个方法的好处是什么？

✓ 简单易学
✓ 立竿见影
✓ 效果持久

`;

    return section;
  }

  /**
   * 生成行动建议部分
   */
  generateActionSection(topic, targetAudience) {
    return `学会了方法，关键在于执行。这里给你3个建议：

**建议1：从今天开始**

不要等明天，不要等下个月，就从今天开始尝试这些方法。

**建议2：循序渐进**

不要想着一次性掌握所有方法，先从最简单的开始，逐步深入。

**建议3：持续迭代**

在使用过程中不断优化，找到最适合自己的方式。

坚持30天，你会发现${topic}变得前所未有的简单。

`;
  }

  /**
   * 生成结尾转化
   */
  generateEnding(context) {
    const { topic, callToAction, targetAudience } = context;

    let ending = `## 总结\n\n`;
    ending += `今天我们分享了关于${topic}的几个核心方法：\n\n`;
    ending += `- 认清问题，才能对症下药\n`;
    ending += `- 掌握方法，效率翻倍\n`;
    ending += `- 立即行动，持续优化\n\n`;
    ending += `希望这些方法对你的工作有所帮助。\n\n`;

    // 互动引导
    ending += `## 互动时间\n\n`;
    ending += `你在做${topic}时遇到过什么问题？\n\n`;
    ending += `欢迎在评论区分享你的经历和想法~\n\n`;

    // 关注引导
    ending += `---\n\n`;
    ending += `**关注我**，每天分享${targetAudience}干货内容。\n\n`;

    // 福利引导
    if (callToAction) {
      ending += `${callToAction}\n\n`;
    }

    ending += `我们下期见！👋\n`;

    return ending;
  }

  /**
   * 组装完整文章
   */
  assembleArticle(title, opening, body, ending) {
    let article = '';

    // 标题
    if (title) {
      article += `# ${title}\n\n`;
    }

    // 开头
    article += opening;

    // 主体
    article += body;

    // 结尾
    article += ending;

    return article;
  }

  /**
   * 使用大模型生成关键点
   * @param {string} topic - 主题
   * @param {number} count - 数量
   * @returns {Promise<Array>} 关键点数组
   */
  async generateKeyPoints(topic, count = 5) {
    if (this.useLLM && this.llmClient) {
      console.log(`\n🤖 正在生成"${topic}"的关键点...`);
      const keyPoints = await this.llmClient.generateKeyPoints(topic, count);
      console.log(`✓ 生成${keyPoints.length}个关键点\n`);
      return keyPoints;
    }
    throw new Error('关键点生成必须使用大模型，请确保API配置正确');
  }

  /**
   * 本地模板生成关键点（降级方案）
   */
  generateKeyPointsFallback(topic, count = 5) {
    // 专业领域的预置内容库
    const professionalContent = {
      '个税汇算清缴': [
        {
          title: '汇算时间跨度延长，建议尽早办理',
          description: '今年汇算清缴期限仍为3月1日至6月30日，但税务机关明确建议尽早办理，避免后期系统拥堵。',
          example: '往年6月下旬高峰期，曾出现大量企业因系统问题导致申报失败的情况。'
        },
        {
          title: '专项附加扣除标准调整',
          description: '3岁以下婴幼儿照护和子女教育扣除标准提高至2000元/月，员工退税可能增加。',
          example: '有这两个扣除项目的员工要及时更新信息，部分人可能从"补税"变为"退税"。'
        },
        {
          title: '全年一次性奖金计税方式选择更关键',
          description: '政策延续至2027年底，但两种计税方式差异可能达数千元，需要帮员工测算。',
          example: '综合所得较低的选择并入计税更划算，综合所得较高的选择单独计税更划算。'
        },
        {
          title: '个人所得税APP功能升级',
          description: '预填服务更精准、申诉处理更快捷，员工自主办理能力增强。',
          example: '财务人员要先熟悉新版APP功能，才能更好地指导员工操作。'
        },
        {
          title: '汇算清缴诚信记录纳入征信',
          description: '未如实申报将计入纳税信用记录，严重的可能影响个人征信。',
          example: '要向员工强调如实申报的重要性，避免因小失大。'
        }
      ],
      '金税四期': [
        {
          title: '智慧税务系统实现"以数治税"',
          description: '金税四期通过大数据分析实现全流程监管，企业税务行为更加透明。',
          example: '税务机关可以通过发票数据、银行流水等多维度数据交叉验证企业申报真实性。'
        },
        {
          title: '重点监控私户收款行为',
          description: '利用个人账户收取经营款项将面临更严格的监控和稽查。',
          example: '企业应规范财务流程，所有收入必须通过对公账户收取。'
        },
        {
          title: '发票管理全流程数字化',
          description: '全电发票（数电票）推广，发票开具、传递、报销全流程电子化。',
          example: '财务人员需要掌握数电票的开具、接收、查验和归档流程。'
        },
        {
          title: '税务稽查更加精准高效',
          description: '通过大数据风险扫描，税务稽查从"大海捞针"变为"精准制导"。',
          example: '异常指标如税负率偏低、存货账实不符等会自动触发风险预警。'
        },
        {
          title: '企业需要建立合规内控体系',
          description: '被动合规转向主动合规，建立完善的税务风险内控制度。',
          example: '定期开展税务健康自查，及时发现并整改潜在风险点。'
        }
      ],
      '全电发票': [
        {
          title: '发票信息数字化自动传递',
          description: '数电票通过税务数字账户自动交付，无需人工发送和接收。',
          example: '购买方税务数字账户会自动收到销售方开具的数电票。'
        },
        {
          title: '发票版式文件全面电子化',
          description: '支持XML、PDF、OFD等多种格式，法律效力与纸质发票相同。',
          example: '财务人员需要了解不同格式的使用场景和归档要求。'
        },
        {
          title: '开票流程更加简化',
          description: '无需税控设备，无需领用发票，通过网页或APP即可开具。',
          example: '销售人员外出办公时，也可以通过手机随时为客户开具发票。'
        },
        {
          title: '发票查验更加便捷',
          description: '通过全国增值税发票查验平台或税务数字账户即可实时查验。',
          example: '收到数电票后，建议立即查验真伪和状态，防止接收异常发票。'
        },
        {
          title: '企业财务系统需要升级对接',
          description: 'ERP、费控系统等需要升级以支持数电票的接收和处理。',
          example: '提前规划系统升级，确保数电票推广后业务正常运行。'
        }
      ]
    };

    // 检查是否有匹配的专业内容
    const topicKey = Object.keys(professionalContent).find(key => topic.includes(key));

    if (topicKey) {
      console.log(`\n✓ 使用专业预置内容: ${topicKey}`);
      return professionalContent[topicKey].slice(0, count);
    }

    // 如果没有匹配的专业内容，返回通用模板（并提示用户）
    console.log(`\n⚠️  未找到"${topic}"的专业预置内容，使用通用模板`);
    console.log(`💡 建议: 手动提供 keyPoints 参数以获得更专业的文章内容\n`);

    const templates = [
      {
        title: `建立标准化的${topic}流程`,
        description: `制定清晰的流程和标准，让每次${topic}都有章可循。`,
        example: `例如，可以制作一个${topic}检查清单，确保每个步骤都不遗漏。`
      },
      {
        title: `使用合适的工具`,
        description: `选择适合的工具，可以让${topic}效率提升数倍。`,
        example: `比如Excel的高级功能、专业软件等，都是提升效率的好帮手。`
      },
      {
        title: `做好时间管理`,
        description: `合理安排${topic}的时间，避免临时抱佛脚。`,
        example: `建议每周固定时间处理${topic}相关事务，形成习惯。`
      },
      {
        title: `持续学习提升`,
        description: `${topic}的方法在不断更新，要持续学习新知识。`,
        example: `可以关注行业公众号、参加培训课程，保持知识更新。`
      },
      {
        title: `建立复盘机制`,
        description: `定期复盘${topic}的效果，找出改进空间。`,
        example: `每月做一次总结，分析哪些方法有效，哪些需要改进。`
      }
    ];

    return templates.slice(0, count);
  }

  /**
   * 生成文章大纲
   */
  async generateOutline(options) {
    const { topic, keyPoints } = options;
    const points = keyPoints || await this.generateKeyPoints(topic, 5);

    let outline = `# ${topic} - 文章大纲\n\n`;
    outline += `## 一、开头（黄金3秒）\n`;
    outline += `- 场景共情：描述读者遇到的具体场景\n`;
    outline += `- 痛点揭露：指出问题的严重性\n`;
    outline += `- 解决方案预告：给出希望和承诺\n\n`;

    outline += `## 二、主体内容\n\n`;
    outline += `### 1. 认清现状\n`;
    outline += `- 分析${topic}的常见问题\n`;
    outline += `- 用数据或案例强化痛点\n\n`;

    outline += `### 2. 解决方案\n`;
    points.forEach((point, i) => {
      outline += `- **${i + 1}. ${point.title}**\n`;
      outline += `  - ${point.description}\n`;
    });
    outline += `\n`;

    outline += `### 3. 实战建议\n`;
    outline += `- 从今天开始\n`;
    outline += `- 循序渐进\n`;
    outline += `- 持续迭代\n\n`;

    outline += `## 三、结尾（转化）\n`;
    outline += `- 价值总结\n`;
    outline += `- 互动引导\n`;
    outline += `- 关注引导\n`;
    outline += `- 福利承诺\n`;

    return outline;
  }

  /**
   * 保存文章到文件
   */
  saveArticle(content, filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, 'utf8');
    return filePath;
  }
}

// 导出
module.exports = ArticleWriter;

// 如果直接运行此文件，执行示例
if (require.main === module && process.argv.length > 2) {
  (async () => {
    const writer = new ArticleWriter();
    const topic = process.argv[2] || '财务管理';
    const title = process.argv[3] || `让${topic}变简单的5个方法`;

    const article = await writer.generateArticle({
      title,
      topic,
      targetAudience: '财务人',
      hookType: '痛点暴击型'
    });

    console.log(article);

    // 保存到文件
    const outputPath = path.join(process.cwd(), `${topic}-article.md`);
    writer.saveArticle(article, outputPath);
    console.log(`\n文章已保存到: ${outputPath}`);
  })();
}
