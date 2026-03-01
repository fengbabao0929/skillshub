/**
 * 竞品文章分析模块
 * 分析同类账号的爆款文章，提取成功规律
 */

const fs = require('fs');
const path = require('path');

class CompetitorAnalyzer {
  constructor() {
    // 内置的竞品爆款文章数据库（模拟数据）
    this.viralArticlesDB = this.initializeViralArticlesDB();

    // 分析维度
    this.analysisDimensions = [
      'title_type',      // 标题类型
      'title_length',    // 标题长度
      'content_type',    // 内容类型
      'article_length',  // 文章长度
      'publish_time',    // 发布时间
      'interaction',     // 互动数据
      'keywords'         // 关键词
    ];
  }

  /**
   * 初始化爆款文章数据库
   */
  initializeViralArticlesDB() {
    return [
      {
        title: '为什么小公司财务总是乱？建这5个制度就够了',
        account: '财务总监',
        publishDate: '2024-02-15',
        views: 120000,
        likes: 8500,
        shares: 3200,
        comments: 680,
        titleType: '疑问+痛点',
        contentType: '干货教程',
        articleLength: 2800,
        keywords: ['小公司', '财务', '制度', '内控'],
        summary: '针对小公司财务管理混乱问题，提出5个核心制度建设方案',
        successfulPoints: [
          '标题直击痛点（为什么...乱）',
          '给出具体数量（5个制度）',
          '承诺解决问题（...就够了）',
          '内容结构清晰，可操作性强'
        ]
      },
      {
        title: '同样做财务，为什么他月薪3万你只有8千？',
        account: '职场财务人',
        publishDate: '2024-02-10',
        views: 150000,
        likes: 12000,
        shares: 5600,
        comments: 1200,
        titleType: '对比+反差',
        contentType: '观点文章',
        articleLength: 3200,
        keywords: ['财务', '薪资', '职业发展', '能力'],
        summary: '分析财务人员薪资差距的原因，提出提升方向',
        successfulPoints: [
          '强烈对比（3万 vs 8千）',
          '身份认同（同样做财务）',
          '引发好奇（为什么）',
          '实用建议，可借鉴性强'
        ]
      },
      {
        title: '财务人必看：年底前必须做的3项工作，不然麻烦大了',
        account: '税务师姐',
        publishDate: '2023-12-01',
        views: 98000,
        likes: 6700,
        shares: 4100,
        comments: 520,
        titleType: '身份+时间+紧迫',
        contentType: '干货教程',
        articleLength: 2500,
        keywords: ['财务', '年底', '必做', '风险'],
        summary: '提醒财务人员年底必须完成的关键工作，避免风险',
        successfulPoints: [
          '身份精准（财务人必看）',
          '时间明确（年底前）',
          '制造紧迫感（不然麻烦大了）',
          '内容实用，时效性强'
        ]
      },
      {
        title: '金税四期来了！这3种操作会被税务局稽查',
        account: '税务实战',
        publishDate: '2024-01-20',
        views: 180000,
        likes: 15000,
        shares: 8900,
        comments: 2100,
        titleType: '警告+揭秘',
        contentType: '风险提示',
        articleLength: 2200,
        keywords: ['金税四期', '税务稽查', '风险', '合规'],
        summary: '介绍金税四期下的税务风险点，提醒合规操作',
        successfulPoints: [
          '热点话题（金税四期）',
          '警告性质（会被稽查）',
          '具体数量（3种操作）',
          '风险警示，传播性强'
        ]
      },
      {
        title: '10年财务总监总结：这7个习惯让你升职加薪',
        account: 'CFO笔记',
        publishDate: '2024-01-15',
        views: 135000,
        likes: 9800,
        shares: 5200,
        comments: 890,
        titleType: '数字+收益',
        contentType: '经验分享',
        articleLength: 3500,
        keywords: ['财务总监', '习惯', '升职', '加薪'],
        summary: '资深财务总监分享职业发展经验',
        successfulPoints: [
          '权威背书（10年财务总监）',
          '明确收益（升职加薪）',
          '具体数量（7个习惯）',
          '经验价值，可信度高'
        ]
      },
      {
        title: '财务人员注意！这5个操作正在悄悄害你',
        account: '财务避坑指南',
        publishDate: '2024-02-05',
        views: 110000,
        likes: 7800,
        shares: 4300,
        comments: 650,
        titleType: '警告+数字',
        contentType: '风险提示',
        articleLength: 2000,
        keywords: ['财务', '风险', '避坑', '操作'],
        summary: '揭示财务工作中常见的风险操作',
        successfulPoints: [
          '警告语气（注意！正在害你）',
          '负面暗示（害你）',
          '具体数量（5个操作）',
          '恐惧诉求，点击率高'
        ]
      },
      {
        title: '揭秘：为什么财务总监从来不亲自做账？',
        account: '财务职场',
        publishDate: '2024-01-28',
        views: 89000,
        likes: 6200,
        shares: 3100,
        comments: 480,
        titleType: '疑问+揭秘',
        contentType: '观点文章',
        articleLength: 2700,
        keywords: ['财务总监', '做账', '管理', '思维'],
        summary: '分析财务总监与基层会计的思维差异',
        successfulPoints: [
          '揭秘性质（揭秘）',
          '反常识（不亲自做账）',
          '引发好奇（为什么）',
          '思维升级，有启发性'
        ]
      },
      {
        title: '小企业vs大企业：财务管理的5大区别',
        account: '财务管理圈',
        publishDate: '2024-02-08',
        views: 76000,
        likes: 5100,
        shares: 2800,
        comments: 340,
        titleType: '对比+数字',
        contentType: '干货教程',
        articleLength: 3000,
        keywords: ['小企业', '大企业', '财务管理', '区别'],
        summary: '对比分析不同规模企业的财务管理差异',
        successfulPoints: [
          '对比结构（小企业vs大企业）',
          '明确数量（5大区别）',
          '对比清晰，结构完整',
          '实用价值，适用面广'
        ]
      }
    ];
  }

  /**
   * 分析竞品爆款文章
   * @param {Object} options - 分析选项
   * @param {string} options.keyword - 关键词筛选
   * @param {number} options.limit - 返回数量
   * @param {string} options.sortBy - 排序方式（views/likes/shares）
   * @returns {Object} 分析结果
   */
  analyzeViralArticles(options = {}) {
    const { keyword = '', limit = 10, sortBy = 'views' } = options;

    // 筛选文章
    let articles = this.viralArticlesDB;

    if (keyword) {
      articles = articles.filter(article =>
        article.title.includes(keyword) ||
        article.keywords.some(k => k.includes(keyword))
      );
    }

    // 排序
    articles = this.sortArticles(articles, sortBy);

    // 限制数量
    articles = articles.slice(0, limit);

    // 生成分析报告
    return {
      articles,
      summary: this.generateSummary(articles),
      patterns: this.extractPatterns(articles),
      suggestions: this.generateSuggestions(articles)
    };
  }

  /**
   * 排序文章
   */
  sortArticles(articles, sortBy) {
    return [...articles].sort((a, b) => {
      if (sortBy === 'views') return b.views - a.views;
      if (sortBy === 'likes') return b.likes - a.likes;
      if (sortBy === 'shares') return b.shares - a.shares;
      return b.views - a.views;
    });
  }

  /**
   * 生成分析摘要
   */
  generateSummary(articles) {
    const totalViews = articles.reduce((sum, a) => sum + a.views, 0);
    const totalLikes = articles.reduce((sum, a) => sum + a.likes, 0);
    const totalShares = articles.reduce((sum, a) => sum + a.shares, 0);
    const avgViews = Math.round(totalViews / articles.length);
    const avgLength = Math.round(articles.reduce((sum, a) => sum + a.articleLength, 0) / articles.length);

    return {
      total: articles.length,
      totalViews,
      totalLikes,
      totalShares,
      avgViews,
      avgLength,
      topAccount: this.getTopAccount(articles)
    };
  }

  /**
   * 获取最活跃账号
   */
  getTopAccount(articles) {
    const accountCount = {};
    articles.forEach(a => {
      accountCount[a.account] = (accountCount[a.account] || 0) + 1;
    });
    return Object.entries(accountCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
  }

  /**
   * 提取爆款规律
   */
  extractPatterns(articles) {
    // 标题类型分布
    const titleTypeCount = {};
    articles.forEach(a => {
      titleTypeCount[a.titleType] = (titleTypeCount[a.titleType] || 0) + 1;
    });

    // 内容类型分布
    const contentTypeCount = {};
    articles.forEach(a => {
      contentTypeCount[a.contentType] = (contentTypeCount[a.contentType] || 0) + 1;
    });

    // 关键词频率
    const keywordCount = {};
    articles.forEach(a => {
      a.keywords.forEach(k => {
        keywordCount[k] = (keywordCount[k] || 0) + 1;
      });
    });

    // 标题长度分布
    const titleLengths = articles.map(a => a.title.length);
    const avgTitleLength = Math.round(
      titleLengths.reduce((sum, len) => sum + len, 0) / titleLengths.length
    );

    return {
      titleTypes: titleTypeCount,
      contentTypes: contentTypeCount,
      topKeywords: Object.entries(keywordCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([k, v]) => ({ keyword: k, count: v })),
      avgTitleLength,
      optimalTitleLength: this.findOptimalTitleLength(articles)
    };
  }

  /**
   * 找出最优标题长度
   */
  findOptimalTitleLength(articles) {
    const lengthGroups = {};
    articles.forEach(a => {
      const length = a.title.length;
      const range = Math.floor(length / 5) * 5;
      if (!lengthGroups[range]) lengthGroups[range] = { total: 0, count: 0 };
      lengthGroups[range].total += a.views;
      lengthGroups[range].count += 1;
    });

    let maxAvg = 0;
    let optimalRange = 15;

    Object.entries(lengthGroups).forEach(([range, data]) => {
      const avg = data.total / data.count;
      if (avg > maxAvg) {
        maxAvg = avg;
        optimalRange = parseInt(range);
      }
    });

    return optimalRange;
  }

  /**
   * 生成写作建议
   */
  generateSuggestions(articles) {
    return {
      titles: [
        '使用疑问+痛点型标题（如：为什么...？）',
        '加入具体数字（5个、3步、7个习惯）',
        '制造对比或反差（同样...，为什么...）',
        '添加时间紧迫感（年底前、现在）',
        '使用警告语气（注意！千万别）'
      ],
      content: [
        `文章长度控制在${this.getOptimalLength(articles)}字左右`,
        '内容结构要清晰（问题-分析-解决方案）',
        '提供可操作的具体建议',
        '加入真实案例或数据支撑',
        '结尾要有互动引导和关注提醒'
      ],
      publishTime: [
        '工作日上午9-10点发布',
        '中午12-13点午休时间',
        '晚上20-22点阅读高峰',
        '周中（周二、周三、周四）效果较好'
      ]
    };
  }

  /**
   * 获取最优文章长度
   */
  getOptimalLength(articles) {
    const lengths = articles.map(a => a.articleLength);
    const avg = Math.round(lengths.reduce((sum, l) => sum + l, 0) / lengths.length);
    return `${avg - 500}-${avg + 500}`;
  }

  /**
   * 格式化输出分析结果
   */
  formatAnalysis(analysisResult) {
    let output = '\n📊 竞品爆款文章分析\n';
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

    // 概览
    const { summary, patterns, suggestions, articles } = analysisResult;
    output += '## 📈 数据概览\n\n';
    output += `分析文章数: ${summary.total}\n`;
    output += `平均阅读: ${this.formatNumber(summary.avgViews)}\n`;
    output += `平均长度: ${summary.avgLength}字\n`;
    output += `最活跃账号: ${summary.topAccount}\n\n`;

    // 爆款规律
    output += '## 🎯 爆款规律\n\n';
    output += '### 标题类型分布\n';
    Object.entries(patterns.titleTypes).forEach(([type, count]) => {
      output += `- ${type}: ${count}篇\n`;
    });
    output += `\n最优标题长度: ${patterns.optimalTitleLength}-${patterns.optimalTitleLength + 4}字\n\n`;

    output += '### 热门关键词\n';
    patterns.topKeywords.slice(0, 8).forEach(({ keyword, count }) => {
      output += `- ${keyword}: ${count}次\n`;
    });
    output += '\n';

    // 写作建议
    output += '## 💡 写作建议\n\n';
    output += '### 标题建议\n';
    suggestions.titles.forEach(s => {
      output += `- ${s}\n`;
    });
    output += '\n### 内容建议\n';
    suggestions.content.forEach(s => {
      output += `- ${s}\n`;
    });
    output += '\n### 发布时间建议\n';
    suggestions.publishTime.forEach(s => {
      output += `- ${s}\n`;
    });
    output += '\n';

    // 爆款文章列表
    output += '## 🔥 爆款文章列表\n\n';
    articles.forEach((article, i) => {
      output += `${i + 1}. ${article.title}\n`;
      output += `   账号: ${article.account} | 阅读: ${this.formatNumber(article.views)}\n`;
      output += `   标题类型: ${article.titleType} | 长度: ${article.articleLength}字\n`;
      output += `   成功要点: ${article.successfulPoints[0]}\n\n`;
    });

    return output;
  }

  /**
   * 格式化数字
   */
  formatNumber(num) {
    if (num >= 10000) return (num / 10000).toFixed(1) + 'W';
    return num.toString();
  }

  /**
   * 基于分析结果推荐标题
   */
  recommendTitles(keyword, count = 5) {
    const analysis = this.analyzeViralArticles({ keyword, limit: 5 });
    const patterns = analysis.patterns;

    // 基于爆款规律生成标题
    const templates = [
      `为什么${keyword}总是{问题}？这{数字}个方法就够了`,
      `同样做${keyword}，为什么他比你强？`,
      `${keyword}必看：{数字}个必须知道的变化`,
      `{数字}年${keyword}总结：这{数字}个习惯让你{收益}`,
      `${keyword}注意！这{数字}个操作正在害你`
    ];

    return templates.slice(0, count);
  }
}

// 导出
module.exports = CompetitorAnalyzer;

// 命令行入口
if (require.main === module) {
  const analyzer = new CompetitorAnalyzer();

  const keyword = process.argv[2] || '';
  const limit = parseInt(process.argv[3]) || 8;

  const result = analyzer.analyzeViralArticles({ keyword, limit });

  console.log(analyzer.formatAnalysis(result));
}
