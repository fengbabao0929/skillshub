#!/usr/bin/env node

/**
 * 对标文章拆解与模仿系统
 *
 * 核心功能：
 * 1. 上传对标文章（支持 txt/md/pdf/docx）
 * 2. 自动拆解文章结构
 * 3. 分析写作风格
 * 4. 生成模仿指南
 * 5. 基于访谈素材进行模仿创作
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// 文章拆解方法论
// ============================================================================

const ANALYSIS_METHODOLOGY = `
# 对标文章拆解方法论

## 拆解维度

### 1. 结构拆解
- 文章框架：总分总、时间线、并列式、递进式...
- 段落结构：每段功能、段落间衔接
- 开场方式：场景化、提问、故事、数据...
- 结尾方式：总结升华、开放式、行动号召...

### 2. 风格分析
- 语言特征：口语化/书面化、华丽/朴实
- 句式特点：长短句分布、修辞手法
- 叙事视角：第一人称、第三人称、第二人称
- 情感基调：温暖/理性/激昂/克制...

### 3. 技巧识别
- 场景描写技巧
- 对话处理方式
- 细节刻画手法
- 节奏控制策略
- 情感渲染方式

### 4. 关键元素
- 金句提炼
- 转折词使用
- 过渡句设计
- 标题风格
`;

// ============================================================================
// 文章解析器
// ============================================================================

class ArticleParser {
  constructor() {
    this.supportedFormats = ['.txt', '.md', '.json'];
  }

  // 读取文章内容
  parse(filePath) {
    const ext = path.extname(filePath).toLowerCase();

    if (!this.supportedFormats.includes(ext)) {
      throw new Error(`不支持的文件格式: ${ext}`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return {
      raw: content,
      paragraphs: this.extractParagraphs(content),
      sentences: this.extractSentences(content),
      wordCount: this.countWords(content)
    };
  }

  extractParagraphs(content) {
    // 按空行分段
    return content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  }

  extractSentences(content) {
    // 简单的句子分割（中文和英文）
    const contentClean = content.replace(/\n+/g, ' ');
    const sentences = contentClean.match(/[^。！？.!?]+[。！？.!?]*/g) || [];
    return sentences.map(s => s.trim()).filter(s => s.length > 0);
  }

  countWords(content) {
    // 中文字符 + 英文单词
    const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (content.match(/[a-zA-Z]+/g) || []).length;
    return chineseChars + englishWords;
  }

  // 从文本直接解析（用于已读取的内容）
  parseText(text) {
    return {
      raw: text,
      paragraphs: this.extractParagraphs(text),
      sentences: this.extractSentences(text),
      wordCount: this.countWords(text)
    };
  }
}

// ============================================================================
// 结构分析器
// ============================================================================

class StructureAnalyzer {
  constructor(article) {
    this.article = article;
  }

  // 分析文章框架
  analyzeFramework() {
    const paragraphs = this.article.paragraphs;
    const total = paragraphs.length;

    // 识别各段落功能
    const structure = {
      opening: this.identifyOpening(paragraphs.slice(0, Math.min(3, total))),
      body: this.analyzeBody(paragraphs.slice(Math.min(3, total), Math.max(3, total - 2))),
      ending: this.identifyEnding(paragraphs.slice(Math.max(-2, total - 2))),
      framework: this.identifyFrameworkType(paragraphs)
    };

    return structure;
  }

  identifyOpening(openingParagraphs) {
    const text = openingParagraphs.join(' ');

    if (text.includes('你有没有') || text.includes('你是否')) {
      return { type: '提问式', technique: '用问题引发读者思考' };
    }
    if (text.match(/\d{4}年|那天|记得/) && text.length < 200) {
      return { type: '场景化', technique: '从具体场景切入' };
    }
    if (text.includes('我') && text.length > 100) {
      return { type: '故事式', technique: '用个人故事开场' };
    }
    if (text.match(/\d+%|\d+万|\d+亿/)) {
      return { type: '数据式', technique: '用数据引起注意' };
    }
    if (text.includes('"') || text.includes('"')) {
      return { type: '引用式', technique: '用名言或金句开场' };
    }

    return { type: '其他', technique: '待分析' };
  }

  analyzeBody(bodyParagraphs) {
    // 分析正文段落结构
    const structure = {
      pattern: this.identifyBodyPattern(bodyParagraphs),
      transitions: this.extractTransitions(bodyParagraphs),
      scenes: this.countScenes(bodyParagraphs)
    };

    return structure;
  }

  identifyBodyPattern(paragraphs) {
    // 识别正文结构模式
    const hasTimeMarkers = paragraphs.some(p =>
      p.match(/首先|然后|接着|最后|第一阶段|第二阶段|那时|后来|现在/));

    const hasParallelStructure = paragraphs.some(p =>
      p.match(/一方面|另一方面|同时|此外|另外/));

    const hasNumbering = paragraphs.some(p =>
      p.match(/第一|第二|第三|其一|其二/));

    if (hasNumbering) return '编号式';
    if (hasTimeMarkers) return '时间线式';
    if (hasParallelStructure) return '并列式';

    return '递进式';
  }

  extractTransitions(paragraphs) {
    const transitions = [];
    const transitionWords = ['但是', '然而', '不过', '可是', '其实', '事实上',
      '因此', '所以', '于是', '结果', '最后', '最终',
      '此外', '另外', '同时', '而且', '更重要的是'];

    paragraphs.forEach((p, i) => {
      transitionWords.forEach(word => {
        if (p.includes(word)) {
          transitions.push({ word, position: i + 1 });
        }
      });
    });

    return transitions.slice(0, 10); // 返回前10个
  }

  countScenes(paragraphs) {
    // 粗略统计场景数量（有明显场景转换的段落）
    const sceneMarkers = paragraphs.filter(p =>
      p.match(/那天|晚上|凌晨|那年|那时候|后来/)).length;

    return sceneMarkers || 1;
  }

  identifyEnding(endingParagraphs) {
    const text = endingParagraphs.join(' ');

    if (text.includes('希望') || text.includes('愿')) {
      return { type: '祝福式', technique: '给读者送上祝福或期许' };
    }
    if (text.includes('?') && !text.includes('。')) {
      return { type: '开放式', technique: '以问题引发思考' };
    }
    if (text.match(/总之|综上|因此|所以/)) {
      return { type: '总结式', technique: '总结全文观点' };
    }
    if (text.includes('现在') && text.includes('开始')) {
      return { type: '行动号召', technique: '鼓励读者采取行动' };
    }

    return { type: '其他', technique: '待分析' };
  }

  identifyFrameworkType(paragraphs) {
    const text = paragraphs.join(' ');

    // 时间线结构
    if (text.match(/小时候|后来|现在|那一年|那时候/)) {
      return '时间线式';
    }

    // 总分总结构
    if (text.match(/首先|第一|一方面/) && text.match(/总之|综上|最后/)) {
      return '总分总式';
    }

    // 问题-解决结构
    if (text.match(/问题|困扰|烦恼/) && text.match(/解决|方法|办法/)) {
      return '问题解决式';
    }

    // 对比结构
    if (text.match(/以前|过去|曾经/) && text.match(/现在|如今|今天/)) {
      return '对比式';
    }

    return '叙事式';
  }

  // 生成结构分析报告
  generateReport() {
    const framework = this.analyzeFramework();

    let report = `# 文章结构分析\n\n`;
    report += `## 基本信息\n\n`;
    report += `- 总字数: ${this.article.wordCount} 字\n`;
    report += `- 段落数: ${this.article.paragraphs.length} 段\n`;
    report += `- 句子数: ${this.article.sentences.length} 句\n\n`;

    report += `## 文章框架\n\n`;
    report += `**结构类型**: ${framework.framework}\n\n`;

    report += `### 开场 (${framework.opening.type})\n\n`;
    report += `${framework.opening.technique}\n\n`;

    report += `### 正文\n\n`;
    report += `- 结构模式: ${framework.body.pattern}\n`;
    report += `- 场景数量: 约 ${framework.body.scenes} 个\n`;
    if (framework.body.transitions.length > 0) {
      report += `- 转折词: ${framework.body.transitions.map(t => t.word).join('、')}\n`;
    }
    report += `\n`;

    report += `### 结尾 (${framework.ending.type})\n\n`;
    report += `${framework.ending.technique}\n\n`;

    return report;
  }
}

// ============================================================================
// 风格分析器
// ============================================================================

class StyleAnalyzer {
  constructor(article) {
    this.article = article;
  }

  // 分析写作风格
  analyze() {
    return {
      tone: this.analyzeTone(),
      perspective: this.analyzePerspective(),
      sentence: this.analyzeSentenceStyle(),
      techniques: this.identifyTechniques(),
      quotes: this.extractQuotes()
    };
  }

  analyzeTone() {
    const text = this.article.raw;

    // 检测情感基调
    const positiveWords = ['开心', '快乐', '兴奋', '骄傲', '满足', '希望', '幸运', '幸福'];
    const negativeWords = ['痛苦', '难过', '绝望', '害怕', '焦虑', '迷茫', '孤独', '疲惫'];

    const positiveCount = positiveWords.filter(w => text.includes(w)).length;
    const negativeCount = negativeWords.filter(w => text.includes(w)).length;

    let tone = '中性';
    if (positiveCount > negativeCount + 2) tone = '积极向上';
    else if (negativeCount > positiveCount + 2) tone = '沉重反思';
    else if (positiveCount > 0 || negativeCount > 0) tone = '情感丰富';

    // 检测语言风格
    const colloquial = text.match(/吧|呢|嘛|呗|呀/g);
    const formal = text.match(/因此|故而|因而|亦/g);

    let languageStyle = '书面化';
    if (colloquial && colloquial.length > 5) languageStyle = '口语化';
    if (formal && formal.length > 3) languageStyle = '正式书面';

    return {
      emotion: tone,
      language: languageStyle,
      description: this.generateToneDescription(tone, languageStyle)
    };
  }

  generateToneDescription(emotion, language) {
    const descriptions = {
      '积极向上': {
        '口语化': '温暖亲切，像朋友聊天',
        '书面化': '积极正面，理性乐观'
      },
      '沉重反思': {
        '口语化': '真诚内省，带有自嘲',
        '书面化': '深度思考，富有哲理'
      },
      '情感丰富': {
        '口语化': '真挚感人，情感细腻',
        '书面化': '情感深沉，叙事克制'
      },
      '中性': {
        '口语化': '平实自然，娓娓道来',
        '书面化': '客观冷静，条理清晰'
      }
    };

    return descriptions[emotion]?.[language] || '待分析';
  }

  analyzePerspective() {
    const text = this.article.raw;

    // 统计人称代词
    const firstPerson = (text.match(/我[们]?/g) || []).length;
    const secondPerson = (text.match(/你[们]?/g) || []).length;
    const thirdPerson = (text.match(/他|她|它|他们/g) || []).length;

    if (firstPerson > secondPerson * 2 && firstPerson > thirdPerson * 2) {
      return { type: '第一人称', feature: '以"我"的视角叙述，强调个人经历' };
    }
    if (secondPerson > firstPerson && secondPerson > thirdPerson) {
      return { type: '第二人称', feature: '以"你"的视角叙述，增强代入感' };
    }
    if (thirdPerson > firstPerson) {
      return { type: '第三人称', feature: '客观叙事，观察者视角' };
    }

    return { type: '混合视角', feature: '灵活切换多种人称' };
  }

  analyzeSentenceStyle() {
    const sentences = this.article.sentences;

    // 分析句子长度分布
    const lengths = sentences.map(s => s.length);
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const shortSentences = lengths.filter(l => l < 20).length;
    const longSentences = lengths.filter(l => l > 50).length;

    let rhythm = '中等';
    if (shortSentences > sentences.length * 0.5) rhythm = '轻快';
    if (longSentences > sentences.length * 0.3) rhythm = '舒缓';

    // 检测修辞手法
    const text = this.article.raw;
    const techniques = [];

    if (text.match(/像|仿佛|好似|如同/)) techniques.push('比喻');
    if (text.match(/不是...而是|既不...也不/)) techniques.push('对比');
    if (text.match(/啊|呀|呢|吧/)) techniques.push('语气词');
    if (text.match(/！|！/)) techniques.push('感叹');
    if (text.match(/\d+|\d+万|\d+亿/)) techniques.push('数字');

    return {
      avgLength: Math.round(avgLength),
      rhythm,
      techniques: techniques.length > 0 ? techniques : ['平实叙述']
    };
  }

  identifyTechniques() {
    const text = this.article.raw;
    const techniques = [];

    // 场景描写
    if (text.match(/那天|晚上|凌晨|街道|房间|天空/)) {
      techniques.push('场景描写');
    }

    // 对话使用
    if (text.match(/"|"|说|问|答/)) {
      techniques.push('对话穿插');
    }

    // 细节刻画
    if (text.match(/手指|眼睛|眉毛|心跳|呼吸/)) {
      techniques.push('细节刻画');
    }

    // 心理描写
    if (text.match(/想|觉得|感到|内心|心里/)) {
      techniques.push('心理描写');
    }

    // 数据引用
    if (text.match(/\d+%|\d+次|\d+天/)) {
      techniques.push('数据支撑');
    }

    // 金句
    if (text.match(/。|！/) && text.includes('，')) {
      // 简单检测：有完整的、有节奏的句子
      techniques.push('金句提炼');
    }

    return techniques;
  }

  extractQuotes() {
    const sentences = this.article.sentences;
    const quotes = [];

    // 提取可能成为金句的句子
    // 特征：长度适中、有节奏感、有哲理
    sentences.forEach(s => {
      if (s.length >= 15 && s.length <= 50) {
        if (s.match(/就是|才是|莫过于|不过是|意味着/)) {
          quotes.push(s);
        }
      }
    });

    return quotes.slice(0, 5); // 最多返回5句
  }

  // 生成风格分析报告
  generateReport() {
    const style = this.analyze();

    let report = `# 文章风格分析\n\n`;

    report += `## 整体风格\n\n`;
    report += `- **情感基调**: ${style.tone.emotion}\n`;
    report += `- **语言风格**: ${style.tone.language}\n`;
    report += `- **风格描述**: ${style.tone.description}\n\n`;

    report += `## 叙事视角\n\n`;
    report += `- **类型**: ${style.perspective.type}\n`;
    report += `- **特征**: ${style.perspective.feature}\n\n`;

    report += `## 句式特点\n\n`;
    report += `- **平均句长**: ${style.sentence.avgLength} 字\n`;
    report += `- **节奏**: ${style.sentence.rhythm}\n`;
    report += `- **修辞**: ${style.sentence.techniques.join('、')}\n\n`;

    report += `## 写作技巧\n\n`;
    if (style.techniques.length > 0) {
      style.techniques.forEach(t => {
        report += `- ${t}\n`;
      });
    } else {
      report += `- 平实叙述\n`;
    }
    report += `\n`;

    if (style.quotes.length > 0) {
      report += `## 金句摘录\n\n`;
      style.quotes.forEach((q, i) => {
        report += `${i + 1}. ${q}\n`;
      });
      report += `\n`;
    }

    return report;
  }
}

// ============================================================================
// 模仿指南生成器
// ============================================================================

class ImitationGuideGenerator {
  constructor(structure, style) {
    this.structure = structure;
    this.style = style;
  }

  // 生成模仿指南
  generate() {
    let guide = `# 模仿写作指南\n\n`;

    guide += `## 目标风格\n\n`;
    guide += `**整体**: ${this.style.tone.description}\n\n`;

    guide += `## 结构模仿\n\n`;
    guide += `### 开场 (${this.structure.opening.type})\n\n`;
    guide += `**技巧**: ${this.structure.opening.technique}\n\n`;
    guide += `**写作要求**:\n`;
    guide += this.generateOpeningGuide();
    guide += `\n`;

    guide += `### 正文 (${this.structure.body.pattern})\n\n`;
    guide += `**场景数量**: ${this.structure.body.scenes} 个\n\n`;
    guide += `**过渡技巧**: 使用转折词如 ${this.structure.body.transitions.slice(0, 5).map(t => t.word).join('、')}\n\n`;
    guide += `**写作要求**:\n`;
    guide += this.generateBodyGuide();
    guide += `\n`;

    guide += `### 结尾 (${this.structure.ending.type})\n\n`;
    guide += `**技巧**: ${this.structure.ending.technique}\n\n`;
    guide += `**写作要求**:\n`;
    guide += this.generateEndingGuide();
    guide += `\n`;

    guide += `## 风格模仿\n\n`;
    guide += `### 语言风格\n\n`;
    guide += `- 基调: ${this.style.tone.emotion}\n`;
    guide += `- 语言: ${this.style.tone.language}\n`;
    guide += `- 视角: ${this.style.perspective.type}\n\n`;

    guide += `### 句式要求\n\n`;
    guide += `- 平均句长: 约 ${this.style.sentence.avgLength} 字\n`;
    guide += `- 节奏: ${this.style.sentence.rhythm}\n`;
    guide += `- 使用技巧: ${this.style.sentence.techniques.join('、')}\n\n`;

    guide += `### 必用技巧\n\n`;
    this.style.techniques.forEach(t => {
      guide += `- **${t}**: ${this.getTechniqueGuide(t)}\n`;
    });
    guide += `\n`;

    if (this.style.quotes.length > 0) {
      guide += `## 金句参考\n\n`;
      guide += `模仿文章的金句风格:\n\n`;
      this.style.quotes.forEach((q, i) => {
        guide += `${i + 1}. ${q}\n`;
      });
      guide += `\n`;
    }

    guide += `## 写作检查清单\n\n`;
    guide += this.generateChecklist();

    return guide;
  }

  generateOpeningGuide() {
    const type = this.structure.opening.type;
    const guides = {
      '提问式': '- 用一个直击人心的问题开场\n- 问题要与读者经历相关\n- 引发好奇和思考',
      '场景化': '- 从一个具体场景切入\n- 包含时间、地点、动作\n- 让读者有画面感',
      '故事式': '- 用个人简短故事开场\n- 故事要有冲突或转折\n- 快速切入主题',
      '数据式': '- 用令人惊讶的数据开场\n- 数据要具体、有冲击力\n- 引出背后的故事',
      '引用式': '- 用名言或金句开场\n- 引用要与主题相关\n- 稍作阐释后转入正文',
      '其他': '- 自定义开场方式'
    };

    return guides[type] || guides['场景化'];
  }

  generateBodyGuide() {
    const pattern = this.structure.body.pattern;
    const guides = {
      '时间线式': '- 按时间顺序展开\n- 用时间词连接各个阶段\n- 突出每个阶段的变化',
      '并列式': '- 用并列结构组织内容\n- 每个部分地位相当\n- 用"同时""另外"等词连接',
      '编号式': '- 用序号明确标识\n- 每个点独立完整\n- 最后总结升华',
      '递进式': '- 层层深入\n- 后文在前文基础上推进\n- 最后达到高潮'
    };

    return guides[pattern] || guides['递进式'];
  }

  generateEndingGuide() {
    const type = this.structure.ending.type;
    const guides = {
      '祝福式': '- 给读者送上祝福或期许\n- 语言温暖有力\n- 让读者感受到关怀',
      '开放式': '- 以问题结尾\n- 引发读者继续思考\n- 留有余韵',
      '总结式': '- 总结全文观点\n- 强调核心信息\n- 给出明确结论',
      '行动号召': '- 鼓励读者采取行动\n- 行动要具体可行\n- 激发改变的动力',
      '其他': '- 自定义结尾方式'
    };

    return guides[type] || guides['总结式'];
  }

  getTechniqueGuide(technique) {
    const guides = {
      '场景描写': '用具体的时间、地点、感官细节构建场景',
      '对话穿插': '用对话推进情节，展现人物性格',
      '细节刻画': '聚焦具体细节，用细节传递情感',
      '心理描写': '直接描写内心活动，展现心理变化',
      '数据支撑': '用具体数据增强说服力',
      '金句提炼': '在关键处提炼金句，增强记忆点'
    };

    return guides[technique] || '使用该技巧增强表达效果';
  }

  generateChecklist() {
    let checklist = `- [ ] 开场使用了${this.structure.opening.type}技巧\n`;
    checklist += `- [ ] 正文采用${this.structure.body.pattern}结构\n`;
    checklist += `- [ ] 包含约${this.structure.body.scenes}个场景\n`;
    checklist += `- [ ] 使用了${this.style.perspective.type}\n`;
    checklist += `- [ ] 语言风格为${this.style.tone.language}，基调${this.style.tone.emotion}\n`;
    checklist += `- [ ] 平均句长约${this.style.sentence.avgLength}字\n`;
    checklist += `- [ ] 结尾使用了${this.structure.ending.type}技巧\n`;

    this.style.techniques.forEach(t => {
      checklist += `- [ ] 运用了${t}技巧\n`;
    });

    return checklist;
  }
}

// ============================================================================
// 命令行接口
// ============================================================================

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    action: args[0] || 'help',
    filePath: args.find((a, i) => a === '--file' && args[i + 1]) ?
      args[args.indexOf('--file') + 1] : null,
    output: args.find((a, i) => a === '--output' && args[i + 1]) ?
      args[args.indexOf('--output') + 1] : null
  };
}

function main() {
  const options = parseArgs();

  switch (options.action) {
    case 'analyze': {
      if (!options.filePath) {
        console.log('请指定要分析的文件: --file <path>');
        return;
      }

      console.log(`正在分析: ${options.filePath}\n`);

      const parser = new ArticleParser();
      const article = parser.parse(options.filePath);

      const structureAnalyzer = new StructureAnalyzer(article);
      const styleAnalyzer = new StyleAnalyzer(article);

      const structureReport = structureAnalyzer.generateReport();
      const styleReport = styleAnalyzer.generateReport();

      const fullReport = structureReport + '\n' + styleReport;

      if (options.output) {
        fs.writeFileSync(options.output, fullReport, 'utf-8');
        console.log(`分析报告已保存到: ${options.output}`);
      } else {
        console.log(fullReport);
      }
      break;
    }

    case 'guide': {
      if (!options.filePath) {
        console.log('请指定要分析的文章: --file <path>');
        return;
      }

      console.log(`正在生成模仿指南: ${options.filePath}\n`);

      const parser = new ArticleParser();
      const article = parser.parse(options.filePath);

      const structureAnalyzer = new StructureAnalyzer(article);
      const styleAnalyzer = new StyleAnalyzer(article);

      const structure = structureAnalyzer.analyzeFramework();
      const style = styleAnalyzer.analyze();

      const guideGenerator = new ImitationGuideGenerator(structure, style);
      const guide = guideGenerator.generate();

      if (options.output) {
        fs.writeFileSync(options.output, guide, 'utf-8');
        console.log(`模仿指南已保存到: ${options.output}`);
      } else {
        console.log(guide);
      }
      break;
    }

    case 'help':
    default:
      console.log(`
对标文章拆解与模仿系统

用法:
  node article-analyzer.js analyze --file <path> [--output <path>]
      分析文章结构和风格

  node article-analyzer.js guide --file <path> [--output <path>]
      生成模仿写作指南

支持的格式: .txt, .md, .json

示例:
  /article-analyze article.txt           分析文章
  /article-analyze article.txt --save    保存分析报告
  /article-guide article.txt             生成模仿指南
  /article-guide article.txt --save      保存模仿指南
      `);
  }
}

main();
