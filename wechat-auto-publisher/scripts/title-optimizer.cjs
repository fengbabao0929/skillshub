/**
 * 标题优化器 - 爆款标题生成模块
 * 集成大模型API生成优质标题
 */

const fs = require('fs');
const path = require('path');
const LLMClient = require('./utils/llm-client.cjs');

class TitleOptimizer {
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
      const configPath = this.configPath;
      if (fs.existsSync(configPath)) {
        const data = fs.readFileSync(configPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn(`Failed to load creation rules: ${error.message}`);
    }
    return this.getDefaultRules();
  }

  /**
   * 获取默认规则（如果配置文件不存在）
   */
  getDefaultRules() {
    return {
      titleRules: {
        formulas: [
          {
            name: '数字+收益',
            pattern: '{数字}+{关键词}，{核心收益}',
            examples: ['5个方法，让效率提升10倍', '3个技巧，帮你省下30%成本']
          },
          {
            name: '疑问+痛点',
            pattern: '为什么{痛点}？{解决方案}',
            examples: ['为什么效率低？因为这3个误区']
          },
          {
            name: '对比+反差',
            pattern: '{负面状态}vs{正面状态}，{方法}',
            examples: ['同样工作，为什么他比你强？']
          },
          {
            name: '时间+紧迫',
            pattern: '{时间限定}，{行动}+{后果}',
            examples: ['年底前必须做的3件事']
          },
          {
            name: '身份+场景',
            pattern: '{身份}必看：{场景}+{解决方案}',
            examples: ['财务人必看：提升效率的5个方法']
          },
          {
            name: '警告+揭秘',
            pattern: '{警告词}！{揭秘内容}',
            examples: ['注意！这3个操作正在害你']
          }
        ],
        titleLength: { min: 15, max: 25, optimal: 18 }
      }
    };
  }

  /**
   * 为主题生成爆款标题（异步，支持大模型）
   * @param {Object} options - 生成选项
   * @param {string} options.topic - 文章主题
   * @param {string} options.targetAudience - 目标受众
   * @param {string} options.benefit - 核心收益
   * @param {number} options.count - 生成数量（默认5）
   * @param {Array<string>} options.formulaTypes - 指定使用的公式类型
   * @param {boolean} options.useLLM - 是否使用大模型生成
   * @returns {Promise<Array<Object>>} 标题列表，每个包含title、formula、score
   */
  async generateTitles(options) {
    const {
      topic = '',
      targetAudience = '',
      benefit = '',
      count = 5,
      formulaTypes = null,
      useLLM = this.useLLM
    } = options;

    if (!topic) {
      throw new Error('Topic is required for title generation');
    }

    // 使用大模型生成标题
    if (useLLM && this.llmClient) {
      console.log(`\n🤖 正在调用大模型生成标题...`);
      const llmTitles = await this.llmClient.generateTitles(topic, count);
      console.log(`✓ 生成${llmTitles.length}个标题\n`);

      // 为LLM生成的标题评分
      return llmTitles.map(t => ({
        title: t.title,
        formula: t.formula || '大模型生成',
        score: this.scoreTitle(t.title)
      }));
    }

    throw new Error('标题生成必须使用大模型，请确保API配置正确');
  }

  /**
   * 使用本地模板生成标题（降级方案）
   */
  generateTitlesLocal(options) {
    const {
      topic = '',
      targetAudience = '',
      benefit = '',
      count = 5,
      formulaTypes = null
    } = options;

    if (!topic) {
      throw new Error('Topic is required for title generation');
    }

    const formulas = this.rules.titleRules.formulas;
    const selectedFormulas = formulaTypes
      ? formulas.filter(f => formulaTypes.includes(f.name))
      : formulas;

    const titles = [];

    // 为每种公式生成标题
    for (const formula of selectedFormulas) {
      const generatedTitles = this.generateByFormula(
        formula,
        { topic, targetAudience, benefit }
      );
      titles.push(...generatedTitles);

      if (titles.length >= count * 2) {
        break;
      }
    }

    // 评分和排序
    const scoredTitles = titles
      .map(t => ({
        ...t,
        score: this.scoreTitle(t.title)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, count);

    return scoredTitles;
  }

  /**
   * 根据公式类型生成标题
   */
  generateByFormula(formula, context) {
    const { topic, targetAudience, benefit } = context;
    const titles = [];

    switch (formula.name) {
      case '数字+收益':
        titles.push(...this.generateNumberBenefit(topic, benefit, targetAudience));
        break;
      case '疑问+痛点':
        titles.push(...this.generateQuestionPain(topic, benefit));
        break;
      case '对比+反差':
        titles.push(...this.generateContrast(topic, benefit, targetAudience));
        break;
      case '时间+紧迫':
        titles.push(...this.generateTimeUrgency(topic, benefit));
        break;
      case '身份+场景':
        titles.push(...this.generateIdentityScene(topic, benefit, targetAudience));
        break;
      case '警告+揭秘':
        titles.push(...this.generateWarningReveal(topic, benefit));
        break;
    }

    return titles.map(title => ({ title, formula: formula.name }));
  }

  /**
   * 生成"数字+收益"型标题
   */
  generateNumberBenefit(topic, benefit, audience) {
    const numbers = [3, 5, 7, 8, 10];
    const templates = [
      '{n}个{keyword}，让{benefit}',
      '{n}种{keyword}，帮你{benefit}',
      '{n}步搞定{keyword}，{benefit}',
      '{n}年经验总结：这{n2}个{keyword}让你{benefit}',
    ];

    const titles = [];
    for (const template of templates) {
      for (const n of numbers) {
        const n2 = n > 5 ? Math.floor(n / 2) : n;
        const keyword = topic.length > 10 ? topic.substring(0, 10) : topic;
        const benefitText = benefit || '提升10倍效率';
        let title = template
          .replace('{n}', n)
          .replace('{n2}', n2)
          .replace('{keyword}', keyword)
          .replace('{benefit}', benefitText);

        if (this.isValidTitle(title)) {
          titles.push(title);
        }
      }
    }
    return titles.slice(0, 5);
  }

  /**
   * 生成"疑问+痛点"型标题
   */
  generateQuestionPain(topic, benefit) {
    const templates = [
      '为什么{keyword}总是{pain}？{solution}',
      '为什么你的{keyword}不行？{solution}',
      '为什么{keyword}这么难？{solution}',
    ];

    const titles = [];
    const pains = ['乱', '慢', '难', '低效', '出错', '被退'];
    const solutions = [
      `这${Math.floor(Math.random() * 5) + 3}个方法就够了`,
      '专家告诉你真相',
      '因为你没做对这件事',
      '看完你就明白了'
    ];

    for (const template of templates) {
      for (const pain of pains.slice(0, 2)) {
        for (const solution of solutions.slice(0, 2)) {
          const keyword = topic.length > 8 ? topic.substring(0, 8) : topic;
          const title = template
            .replace('{keyword}', keyword)
            .replace('{pain}', pain)
            .replace('{solution}', solution);

          if (this.isValidTitle(title)) {
            titles.push(title);
          }
        }
      }
    }
    return titles.slice(0, 5);
  }

  /**
   * 生成"对比+反差"型标题
   */
  generateContrast(topic, benefit, audience) {
    const templates = [
      '同样做{keyword}，为什么他比你强？',
      '{keyword}高手vs新手：区别就在这{n}点',
      '用对方法，{keyword}效率提升{n}倍',
      '{keyword}：这样做vs那样做，差距太大了',
    ];

    const titles = [];
    for (const template of templates) {
      const n = [3, 5, 10][Math.floor(Math.random() * 3)];
      const keyword = topic.length > 8 ? topic.substring(0, 8) : topic;
      let title = template.replace('{keyword}', keyword).replace('{n}', n);

      if (this.isValidTitle(title)) {
        titles.push(title);
      }
    }
    return titles.slice(0, 4);
  }

  /**
   * 生成"时间+紧迫"型标题
   */
  generateTimeUrgency(topic, benefit) {
    const templates = [
      '{time}前必须完成的{n}件事，不然{consequence}',
      '再过{time}，这{n}个{keyword}机会就没了',
      '紧急！{keyword}有新变化，{consequence}',
      '别再等了！{keyword}要{action}了',
    ];

    const titles = [];
    const times = ['本月', '年底', '1个月', '本周'];
    const consequences = ['麻烦大了', '损失惨重', '后悔莫及', '来不及了'];

    for (const template of templates) {
      const time = times[Math.floor(Math.random() * times.length)];
      const consequence = consequences[Math.floor(Math.random() * consequences.length)];
      const n = [3, 5][Math.floor(Math.random() * 2)];
      const keyword = topic.length > 6 ? topic.substring(0, 6) : topic;
      let title = template
        .replace('{time}', time)
        .replace('{n}', n)
        .replace('{keyword}', keyword)
        .replace('{consequence}', consequence)
        .replace('{action}', '有新规');

      if (this.isValidTitle(title)) {
        titles.push(title);
      }
    }
    return titles.slice(0, 4);
  }

  /**
   * 生成"身份+场景"型标题
   */
  generateIdentityScene(topic, benefit, audience) {
    const defaultAudience = audience || '财务人';
    const templates = [
      '{audience}必看：{keyword}的{n}个秘密',
      '{audience}注意：这{n}个{keyword}误区正在害你',
      '{audience}必学：让{benefit}的{n}个方法',
      '写给{audience}：{keyword}完全指南',
    ];

    const titles = [];
    for (const template of templates) {
      const n = [3, 5, 7][Math.floor(Math.random() * 3)];
      const keyword = topic.length > 8 ? topic.substring(0, 8) : topic;
      const benefitText = benefit || '工作更轻松';
      let title = template
        .replace('{audience}', defaultAudience)
        .replace('{keyword}', keyword)
        .replace('{n}', n)
        .replace('{benefit}', benefitText);

      if (this.isValidTitle(title)) {
        titles.push(title);
      }
    }
    return titles.slice(0, 4);
  }

  /**
   * 生成"警告+揭秘"型标题
   */
  generateWarningReveal(topic, benefit) {
    const templates = [
      '{warning}！这{n}个{keyword}正在害你',
      '千万别这样{keyword}！专家的血泪教训',
      '揭秘：为什么{keyword}总是失败？',
      '曝光：{keyword}的{n}大真相',
    ];

    const titles = [];
    const warnings = ['注意', '警惕', '紧急提醒', '千万别这样'];
    const keyword = topic.length > 8 ? topic.substring(0, 8) : topic;

    for (const template of templates) {
      const warning = warnings[Math.floor(Math.random() * warnings.length)];
      const n = [3, 5][Math.floor(Math.random() * 2)];
      let title = template
        .replace('{warning}', warning)
        .replace('{keyword}', keyword)
        .replace('{n}', n);

      if (this.isValidTitle(title)) {
        titles.push(title);
      }
    }
    return titles.slice(0, 4);
  }

  /**
   * 验证标题是否符合要求
   */
  isValidTitle(title) {
    const { min, max } = this.rules.titleRules.titleLength;
    const length = title.length;
    return length >= min && length <= max;
  }

  /**
   * 为标题评分
   * 评分维度：字数、元素、情绪
   */
  scoreTitle(title) {
    let score = 0;

    // 字数得分（最优长度附近得分更高）
    const { min, max, optimal } = this.rules.titleRules.titleLength;
    const length = title.length;
    if (length >= optimal - 2 && length <= optimal + 2) {
      score += 30;
    } else if (length >= min && length <= max) {
      score += 20;
    }

    // 元素得分
    if (/\d+/.test(title)) score += 15; // 包含数字
    if (/[？?！!]/.test(title)) score += 10; // 包含标点
    if (title.includes('为什么')) score += 10; // 包含疑问词
    if (title.includes('必') || title.includes('千万')) score += 10; // 包含强烈词汇
    if (title.includes('vs') || title.includes('比')) score += 10; // 包含对比

    // 情绪得分
    if (/[?!！]/.test(title)) score += 5; // 情绪标点
    if (title.length >= optimal) score += 5; // 有足够信息量

    return Math.min(score, 100);
  }

  /**
   * 格式化输出标题
   */
  formatTitles(titles) {
    return titles.map((t, i) => {
      return `${i + 1}. ${t.title} [${t.formula}] (评分: ${t.score})`;
    }).join('\n');
  }

  /**
   * 获取公式列表
   */
  getFormulaTypes() {
    return this.rules.titleRules.formulas.map(f => f.name);
  }
}

// 导出
module.exports = TitleOptimizer;

// 如果直接运行此文件，执行示例
if (require.main === module && process.argv.length > 2) {
  const optimizer = new TitleOptimizer();
  const topic = process.argv[2] || '财务管理';
  const count = parseInt(process.argv[3]) || 5;

  const titles = optimizer.generateTitles({
    topic,
    targetAudience: '财务人',
    benefit: '让工作更轻松',
    count
  });

  console.log('\n=== 爆款标题生成结果 ===\n');
  console.log(optimizer.formatTitles(titles));
  console.log('\n评分说明：分数越高，爆款潜质越大\n');
}
