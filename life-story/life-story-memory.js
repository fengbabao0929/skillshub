#!/usr/bin/env node

/**
 * 人生故事工作台 - 记忆系统
 *
 * 设计理念：
 * - 短期记忆：当前对话中的活跃信息（上下文窗口内）
 * - 长期记忆：存储在数据库中的所有访谈内容
 * - 索引记忆：关键标签、主题、金句的快速检索
 *
 * 核心能力：
 * 1. 在大量追问后仍能记住最前面的细节
 * 2. 主动回溯之前的细节进行关联提问
 * 3. 跨会话保持访谈状态
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// 数据库设计 (SQLite 兼容的 JSON 存储)
// ============================================================================

class InterviewMemoryDB {
  constructor(dbPath = null) {
    this.dbPath = dbPath || path.join(__dirname, '..', '.interview-data', 'memory.db');
    this.ensureDirectory();
    this.data = this.load();
  }

  ensureDirectory() {
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  load() {
    if (fs.existsSync(this.dbPath)) {
      try {
        return JSON.parse(fs.readFileSync(this.dbPath, 'utf-8'));
      } catch (e) {
        console.error('数据库加载失败，创建新数据库');
      }
    }
    return this.createEmptyDB();
  }

  createEmptyDB() {
    return {
      sessions: {},          // 会话数据
      facts: {},             // 事实细节
      sensory: {},           // 感官细节
      emotions: {},          // 情绪细节
      themes: [],            // 主题标签
      quotes: [],            // 金句库
      timeline: [],          // 时间线
      relationships: {},     // 人物关系
      highlights: [],        // 高光时刻（新增）
      peaks: [],             // 情绪峰值时刻（新增）
      metadata: {
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        currentCategory: null,
        totalQuestions: 0,
        totalWords: 0
      }
    };
  }

  save() {
    this.data.metadata.lastUpdated = new Date().toISOString();
    fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
  }

  // ========================================================================
  // 会话管理
  // ========================================================================

  createSession(categoryId) {
    const sessionId = Date.now().toString();
    this.data.sessions[sessionId] = {
      id: sessionId,
      category: categoryId,
      startTime: new Date().toISOString(),
      questions: [],
      summary: ''
    };
    this.data.metadata.currentCategory = categoryId;
    this.save();
    return sessionId;
  }

  getCurrentSession() {
    const sessions = Object.values(this.data.sessions);
    if (sessions.length === 0) return null;
    // 返回最新的会话
    return sessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime))[0];
  }

  // ========================================================================
  // 细节存储（按类型分类）
  // ========================================================================

  storeFact(questionId, fact) {
    if (!this.data.facts[questionId]) {
      this.data.facts[questionId] = [];
    }
    this.data.facts[questionId].push({
      content: fact,
      timestamp: new Date().toISOString(),
      type: 'fact'
    });
    this.save();
  }

  storeSensory(questionId, detail, senseType) {
    if (!this.data.sensory[questionId]) {
      this.data.sensory[questionId] = [];
    }
    this.data.sensory[questionId].push({
      content: detail,
      senseType: senseType, // visual, auditory, olfactory, gustatory, tactile
      timestamp: new Date().toISOString()
    });
    this.save();
  }

  storeEmotion(questionId, emotion) {
    if (!this.data.emotions[questionId]) {
      this.data.emotions[questionId] = [];
    }
    this.data.emotions[questionId].push({
      content: emotion,
      timestamp: new Date().toISOString()
    });
    this.save();
  }

  storeQuote(quote, context) {
    this.data.quotes.push({
      content: quote,
      context: context,
      timestamp: new Date().toISOString()
    });
    this.save();
  }

  // ========================================================================
  // 时间线管理
  // ========================================================================

  addToTimeline(event) {
    this.data.timeline.push({
      ...event,
      createdAt: new Date().toISOString()
    });
    // 按时间排序
    this.data.timeline.sort((a, b) => {
      if (!a.year || !b.year) return 0;
      return a.year - b.year;
    });
    this.save();
  }

  getTimeline() {
    return this.data.timeline;
  }

  // ========================================================================
  // 人物关系
  // ========================================================================

  addPerson(name, details) {
    if (!this.data.relationships[name]) {
      this.data.relationships[name] = {
        mentions: [],
        relationships: [],
        firstMentioned: new Date().toISOString()
      };
    }
    this.data.relationships[name].mentions.push({
      context: details.context,
      timestamp: new Date().toISOString()
    });
    this.save();
  }

  // ========================================================================
  // 主题标签
  // ========================================================================

  addTheme(theme) {
    if (!this.data.themes.includes(theme)) {
      this.data.themes.push(theme);
      this.save();
    }
  }

  // ========================================================================
  // 高光时刻管理（新增）
  // ========================================================================

  storeHighlight(questionId, description, reason = '') {
    this.data.highlights.push({
      questionId,
      description,
      reason,
      timestamp: new Date().toISOString(),
      type: 'highlight'
    });
    this.save();
  }

  getHighlights() {
    return this.data.highlights;
  }

  // ========================================================================
  // 情绪峰值时刻管理（新增 - 用于峰终效应）
  // ========================================================================

  storePeakMoment(questionId, description, intensity = 'medium') {
    this.data.peaks.push({
      questionId,
      description,
      intensity, // low, medium, high
      timestamp: new Date().toISOString(),
      type: 'peak'
    });
    this.save();
  }

  getPeakMoments() {
    return this.data.peaks.sort((a, b) => {
      const intensityOrder = { high: 3, medium: 2, low: 1 };
      return intensityOrder[b.intensity] - intensityOrder[a.intensity];
    });
  }

  // 获取最重要的峰值时刻
  getMostImportantPeak() {
    const peaks = this.getPeakMoments();
    return peaks.length > 0 ? peaks[0] : null;
  }

  // ========================================================================
  // 记忆检索（核心能力）
  // ========================================================================

  getAllFacts() {
    const all = [];
    Object.entries(this.data.facts).forEach(([questionId, facts]) => {
      facts.forEach(fact => {
        all.push({ questionId, ...fact });
      });
    });
    return all;
  }

  getAllSensory() {
    const all = [];
    Object.entries(this.data.sensory).forEach(([questionId, details]) => {
      details.forEach(detail => {
        all.push({ questionId, ...detail });
      });
    });
    return all;
  }

  getAllEmotions() {
    const all = [];
    Object.entries(this.data.emotions).forEach(([questionId, emotions]) => {
      emotions.forEach(emotion => {
        all.push({ questionId, ...emotion });
      });
    });
    return all;
  }

  // 关键词搜索
  search(keyword) {
    const results = {
      facts: [],
      sensory: [],
      emotions: [],
      quotes: []
    };

    // 搜索事实
    Object.entries(this.data.facts).forEach(([questionId, facts]) => {
      facts.forEach(fact => {
        if (fact.content.toLowerCase().includes(keyword.toLowerCase())) {
          results.facts.push({ questionId, ...fact });
        }
      });
    });

    // 搜索感官细节
    Object.entries(this.data.sensory).forEach(([questionId, details]) => {
      details.forEach(detail => {
        if (detail.content.toLowerCase().includes(keyword.toLowerCase())) {
          results.sensory.push({ questionId, ...detail });
        }
      });
    });

    // 搜索情绪
    Object.entries(this.data.emotions).forEach(([questionId, emotions]) => {
      emotions.forEach(emotion => {
        if (emotion.content.toLowerCase().includes(keyword.toLowerCase())) {
          results.emotions.push({ questionId, ...emotion });
        }
      });
    });

    // 搜索金句
    results.quotes = this.data.quotes.filter(q =>
      q.content.toLowerCase().includes(keyword.toLowerCase())
    );

    return results;
  }

  // 获取特定问题的所有细节
  getQuestionDetails(questionId) {
    return {
      facts: this.data.facts[questionId] || [],
      sensory: this.data.sensory[questionId] || [],
      emotions: this.data.emotions[questionId] || []
    };
  }

  // ========================================================================
  // 上下文构建（用于提供给 AI）
  // ========================================================================

  buildContextPrompt(maxLength = 3000) {
    let context = '# 访谈记忆库\n\n';

    // 高光时刻（优先显示）
    if (this.data.highlights.length > 0) {
      context += '## 高光时刻（重要）\n\n';
      this.data.highlights.forEach(h => {
        context += `- ${h.description}\n`;
        if (h.reason) context += `  原因: ${h.reason}\n`;
      });
      context += '\n';
    }

    // 情绪峰值时刻（用于峰终效应）
    if (this.data.peaks.length > 0) {
      context += '## 情绪峰值时刻\n\n';
      const topPeak = this.getMostImportantPeak();
      if (topPeak) {
        context += `- **最强烈时刻**: ${topPeak.description}\n`;
      }
      context += '\n';
    }

    // 时间线
    if (this.data.timeline.length > 0) {
      context += '## 时间线\n\n';
      this.data.timeline.slice(-5).forEach(event => {
        context += `- ${event.year || '未知年份'}: ${event.description}\n`;
      });
      context += '\n';
    }

    // 重要人物
    const people = Object.keys(this.data.relationships);
    if (people.length > 0) {
      context += '## 重要人物\n\n';
      people.slice(0, 5).forEach(name => {
        const person = this.data.relationships[name];
        context += `- **${name}**: ${person.mentions[0]?.context || '无详细信息'}\n`;
      });
      context += '\n';
    }

    // 主题标签
    if (this.data.themes.length > 0) {
      context += '## 核心主题\n\n';
      context += this.data.themes.join('、') + '\n\n';
    }

    // 最近的事实细节（最多 5 条）
    const recentFacts = this.getAllFacts().slice(-5);
    if (recentFacts.length > 0) {
      context += '## 关键事实细节\n\n';
      recentFacts.forEach(fact => {
        context += `- ${fact.content}\n`;
      });
      context += '\n';
    }

    // 金句（最多 3 条）
    if (this.data.quotes.length > 0) {
      context += '## 金句摘录\n\n';
      this.data.quotes.slice(-3).forEach(quote => {
        context += `> ${quote.content}\n`;
      });
      context += '\n';
    }

    return context;
  }

  // 构建用于关联提问的记忆片段
  buildMemoryBridge(keyword) {
    const searchResults = this.search(keyword);
    let bridge = '';

    if (searchResults.facts.length > 0) {
      bridge += `\n### 之前提到的相关信息：\n\n`;
      searchResults.facts.slice(0, 3).forEach(fact => {
        bridge += `- ${fact.content}\n`;
      });
    }

    if (searchResults.sensory.length > 0) {
      bridge += `\n### 相关的感官细节：\n\n`;
      searchResults.sensory.slice(0, 2).forEach(detail => {
        bridge += `- ${detail.content}\n`;
      });
    }

    return bridge;
  }

  // ========================================================================
  // 统计与分析
  // ========================================================================

  getStats() {
    const totalFacts = Object.values(this.data.facts).reduce((sum, arr) => sum + arr.length, 0);
    const totalSensory = Object.values(this.data.sensory).reduce((sum, arr) => sum + arr.length, 0);
    const totalEmotions = Object.values(this.data.emotions).reduce((sum, arr) => sum + arr.length, 0);

    return {
      totalFacts,
      totalSensory,
      totalEmotions,
      totalQuotes: this.data.quotes.length,
      timelineEvents: this.data.timeline.length,
      peopleMentioned: Object.keys(this.data.relationships).length,
      themes: this.data.themes.length,
      estimatedWordCount: (totalFacts * 100) + (totalSensory * 80) + (totalEmotions * 120)
    };
  }

  // ========================================================================
  // 导出与备份
  // ========================================================================

  exportJSON() {
    return JSON.stringify(this.data, null, 2);
  }

  exportMarkdown() {
    let md = `# 人生故事访谈记录\n\n`;
    md += `创建时间: ${this.data.metadata.created}\n`;
    md += `最后更新: ${this.data.metadata.lastUpdated}\n\n`;

    // 时间线
    md += `## 时间线\n\n`;
    this.data.timeline.forEach(event => {
      md += `- **${event.year || '未知年份'}**: ${event.description}\n`;
    });
    md += `\n`;

    // 重要人物
    md += `## 重要人物\n\n`;
    Object.entries(this.data.relationships).forEach(([name, data]) => {
      md += `### ${name}\n\n`;
      data.mentions.forEach(mention => {
        md += `- ${mention.context}\n`;
      });
      md += `\n`;
    });

    // 按问题组织的内容
    const allQuestionIds = new Set([
      ...Object.keys(this.data.facts),
      ...Object.keys(this.data.sensory),
      ...Object.keys(this.data.emotions)
    ]);

    md += `## 访谈内容\n\n`;
    allQuestionIds.forEach(qId => {
      md += `### 问题: ${qId}\n\n`;

      const facts = this.data.facts[qId] || [];
      const sensory = this.data.sensory[qId] || [];
      const emotions = this.data.emotions[qId] || [];

      if (facts.length > 0) {
        md += `**事实细节**:\n`;
        facts.forEach(f => md += `- ${f.content}\n`);
        md += `\n`;
      }

      if (sensory.length > 0) {
        md += `**感官细节**:\n`;
        sensory.forEach(s => md += `- [${s.senseType}] ${s.content}\n`);
        md += `\n`;
      }

      if (emotions.length > 0) {
        md += `**情绪细节**:\n`;
        emotions.forEach(e => md += `- ${e.content}\n`);
        md += `\n`;
      }
    });

    // 金句
    if (this.data.quotes.length > 0) {
      md += `## 金句摘录\n\n`;
      this.data.quotes.forEach(q => {
        md += `> ${q.content}\n\n`;
      });
    }

    return md;
  }
}

// ============================================================================
// 记忆管理器（提供给 AI 的接口）
// ============================================================================

class InterviewMemoryManager {
  constructor(dbPath = null) {
    this.db = new InterviewMemoryDB(dbPath);
  }

  // 从用户回答中提取和存储记忆
  extractAndStore(questionId, userAnswer, category) {
    // 创建会话（如果需要）
    if (!this.db.getCurrentSession() || this.db.data.metadata.currentCategory !== category) {
      this.db.createSession(category);
    }

    // 这里应该有 NLP 提取逻辑
    // 简化版本：直接存储完整回答
    this.db.storeFact(questionId, `用户回答: ${userAnswer}`);

    // 提取可能的年份
    const yearMatch = userAnswer.match(/(\d{4})年?/);
    if (yearMatch) {
      this.db.addToTimeline({
        year: parseInt(yearMatch[1]),
        description: userAnswer.slice(0, 100),
        questionId
      });
    }

    // 提取人名（简单启发式）
    const nameMatches = userAnswer.match(/([A-Z][a-z]+|[\u4e00-\u9fa5]{2,3})/g) || [];
    nameMatches.forEach(name => {
      this.db.addPerson(name, {
        context: userAnswer.slice(0, 50),
        questionId
      });
    });

    return true;
  }

  // 生成包含记忆的上下文提示
  generateContextualPrompt(nextQuestion, currentQuestionId = null) {
    let prompt = this.db.buildContextPrompt();

    // 如果有关联记忆，添加记忆桥接
    if (currentQuestionId) {
      const details = this.db.getQuestionDetails(currentQuestionId);
      if (details.facts.length > 0 || details.sensory.length > 0) {
        prompt += `\n## 当前问题的已知细节\n\n`;
        details.facts.forEach(f => {
          prompt += `- 事实: ${f.content}\n`;
        });
        details.sensory.forEach(s => {
          prompt += `- 感官[${s.senseType}]: ${s.content}\n`;
        });
        prompt += `\n`;
      }
    }

    prompt += `\n## 下一个问题\n\n${nextQuestion}\n`;
    prompt += `\n---\n\n`;
    prompt += `**重要**: 在提问时，主动引用上述记忆库中的细节，形成关联。\n`;

    return prompt;
  }

  // 获取统计信息
  getStats() {
    return this.db.getStats();
  }

  // 导出访谈记录
  export(format = 'markdown') {
    if (format === 'json') {
      return this.db.exportJSON();
    }
    return this.db.exportMarkdown();
  }
}

// ============================================================================
// 命令行接口
// ============================================================================

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    action: args[0] || 'help',
    category: args.find((a, i) => a === '--category' && args[i + 1]) ?
      args[args.indexOf('--category') + 1] : null,
    format: args.find((a, i) => a === '--format' && args[i + 1]) ?
      args[args.indexOf('--format') + 1] : 'markdown'
  };
}

function main() {
  const options = parseArgs();
  const manager = new InterviewMemoryManager();

  switch (options.action) {
    case 'stats':
      const stats = manager.getStats();
      console.log('# 访谈记忆统计\n');
      console.log(`- 事实细节: ${stats.totalFacts} 条`);
      console.log(`- 感官细节: ${stats.totalSensory} 条`);
      console.log(`- 情绪细节: ${stats.totalEmotions} 条`);
      console.log(`- 金句: ${stats.totalQuotes} 条`);
      console.log(`- 时间线事件: ${stats.timelineEvents} 个`);
      console.log(`- 提及人物: ${stats.peopleMentioned} 人`);
      console.log(`- 核心主题: ${stats.themes} 个`);
      console.log(`- 预估可支撑字数: ${stats.estimatedWordCount} 字`);
      break;

    case 'export':
      const content = manager.export(options.format);
      console.log(content);
      break;

    case 'context':
      const context = manager.db.buildContextPrompt();
      console.log(context);
      break;

    case 'help':
    default:
      console.log(`
人生故事工作台 - 记忆系统

用法:
  node life-story-memory.js stats      查看记忆统计
  node life-story-memory.js export     导出访谈记录
  node life-story-memory.js context    查看当前上下文
  node life-story-memory.js help       显示帮助
      `);
  }
}

main();
