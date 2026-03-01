/**
 * 热点中心 - 整合所有热点功能
 * 提供统一的热点信息查询入口
 */

const HotTopicSearcher = require('./trend/hot-topic-searcher.cjs');
const RealApiSearcher = require('./trend/real-api-searcher.cjs');
const IndustryNewsFetcher = require('./trend/industry-news-fetcher.cjs');
const CompetitorAnalyzer = require('./trend/competitor-analyzer.cjs');
const TopicRecommender = require('./trend/topic-recommender.cjs');

class TrendHub {
  constructor() {
    this.hotTopicSearcher = new HotTopicSearcher();
    this.realApiSearcher = new RealApiSearcher();
    this.newsFetcher = new IndustryNewsFetcher();
    this.competitorAnalyzer = new CompetitorAnalyzer();
    this.topicRecommender = new TopicRecommender();
  }

  /**
   * 获取热点全景（整合所有数据源）
   * @param {Object} options - 查询选项
   * @returns {Object} 热点全景数据
   */
  async getTrendOverview(options = {}) {
    const { category = 'all', limit = 10 } = options;

    const [hotTopics, news, viralPatterns, recommendations] = await Promise.all([
      this.hotTopicSearcher.searchHotTopics({ category, limit }),
      this.newsFetcher.fetchNews({ category, limit }),
      Promise.resolve(this.competitorAnalyzer.analyzeViralArticles({ limit: 5 })),
      this.topicRecommender.recommendTopics({ category, limit: 5 })
    ]);

    return {
      timestamp: new Date().toISOString(),
      category,
      hotTopics: hotTopics.slice(0, 5),
      latestNews: news.slice(0, 5),
      viralPatterns: viralPatterns.patterns,
      topRecommendations: recommendations.slice(0, 5)
    };
  }

  /**
   * 搜索实时热点（使用真实API）
   */
  searchRealHotTopics(query = '财经热点 财务税务', limit = 10) {
    return this.realApiSearcher.searchRealHotTopics({ query, limit });
  }

  /**
   * 搜索热门话题
   */
  async searchHotTopics(category = 'all', limit = 10) {
    return await this.hotTopicSearcher.searchHotTopics({ category, limit });
  }

  /**
   * 获取行业资讯
   */
  async fetchIndustryNews(category = 'all', limit = 10) {
    return await this.newsFetcher.fetchNews({ category, limit });
  }

  /**
   * 分析竞品文章
   */
  analyzeViralArticles(keyword = '', limit = 10) {
    return this.competitorAnalyzer.analyzeViralArticles({ keyword, limit });
  }

  /**
   * 推荐写作话题
   */
  async recommendTopics(category = 'all', limit = 10) {
    return await this.topicRecommender.recommendTopics({ category, limit });
  }

  /**
   * 生成完整的热点报告
   */
  async generateTrendReport(options = {}) {
    const { category = 'all' } = options;

    const overview = await this.getTrendOverview(options);

    let report = '\n╔════════════════════════════════════════╗\n';
    report += '║       📊 财经热点全景报告              ║\n';
    report += '╚════════════════════════════════════════╝\n\n';

    report += `📅 生成时间: ${new Date().toLocaleString('zh-CN')}\n`;
    report += `🏷️  分类: ${this.getCategoryName(category)}\n\n`;

    // 热门话题
    report += '┌─────────────────────────────────────┐\n';
    report += '│ 🔥 热门话题 TOP5                     │\n';
    report += '└─────────────────────────────────────┘\n\n';
    overview.hotTopics.forEach((topic, i) => {
      const trendIcon = topic.trend === 'rising' ? '📈' : '➡️';
      report += `${i + 1}. ${trendIcon} ${topic.title}\n`;
      report += `   热度: ${this.formatHotness(topic.hotness)} | 标签: ${topic.tags.join('、')}\n\n`;
    });

    // 最新资讯
    report += '┌─────────────────────────────────────┐\n';
    report += '│ 📰 最新资讯 TOP5                     │\n';
    report += '└─────────────────────────────────────┘\n\n';
    overview.latestNews.forEach((news, i) => {
      const icon = this.getImportanceIcon(news.importance);
      report += `${i + 1}. ${icon} ${news.title}\n`;
      report += `   来源: ${news.source} | 时间: ${news.publishTime}\n\n`;
    });

    // 爆款规律
    report += '┌─────────────────────────────────────┐\n';
    report += '│ 🎯 爆款规律                          │\n';
    report += '└─────────────────────────────────────┘\n\n';
    report += `最优标题长度: ${overview.viralPatterns.optimalTitleLength}-${overview.viralPatterns.optimalTitleLength + 4}字\n\n`;
    report += '热门关键词:\n';
    overview.viralPatterns.topKeywords.slice(0, 8).forEach(({ keyword, count }) => {
      report += `  • ${keyword} (${count}次)\n`;
    });
    report += '\n';

    // 推荐话题
    report += '┌─────────────────────────────────────┐\n';
    report += '│ 💡 推荐写作话题 TOP5                │\n';
    report += '└─────────────────────────────────────┘\n\n';
    overview.topRecommendations.forEach((topic, i) => {
      const typeIcon = this.getTypeIcon(topic.type);
      const scorePercent = Math.round(topic.score * 100);
      report += `${i + 1}. ${typeIcon} ${topic.title} [推荐指数: ${scorePercent}%]\n`;
      report += `   推荐标题: ${topic.suggestedTitle}\n\n`;
    });

    // 写作建议
    report += '┌─────────────────────────────────────┐\n';
    report += '│ ✍️  写作建议                         │\n';
    report += '└─────────────────────────────────────┘\n\n';

    report += '标题建议:\n';
    report += '  • 使用疑问+痛点型（为什么...？）\n';
    report += '  • 加入具体数字（5个、3步、7个）\n';
    report += '  • 制造对比或反差（同样...，为什么...）\n';
    report += '  • 添加时间紧迫感（年底前、现在）\n\n';

    report += '内容建议:\n';
    report += '  • 文章长度控制在2500-3000字\n';
    report += '  • 使用黄金3秒开头（场景共情-痛点揭露-解决方案预告）\n';
    report += '  • 三段式内容结构（悬念冲突-痛点放大-解决方案-价值升华）\n';
    report += '  • 结尾要有互动引导和关注提醒\n\n';

    report += '发布时间建议:\n';
    report += '  • 工作日上午9-10点\n';
    report += '  • 中午12-13点\n';
    report += '  • 晚上20-22点\n';
    report += '  • 周二、周三、周四效果较好\n\n';

    report += '╔════════════════════════════════════════╗\n';
    report += '║  报告结束，祝创作出爆款文章！        ║\n';
    report += '╚════════════════════════════════════════╝\n';

    return report;
  }

  /**
   * 获取分类名称
   */
  getCategoryName(category) {
    const names = {
      'all': '全部',
      'tax': '税务',
      'finance': '财务',
      'accounting': '会计'
    };
    return names[category] || category;
  }

  /**
   * 格式化热度
   */
  formatHotness(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 10000) return (num / 10000).toFixed(1) + 'W';
    return num.toString();
  }

  /**
   * 获取重要性图标
   */
  getImportanceIcon(importance) {
    const icons = {
      'high': '🔴',
      'medium': '🟡',
      'low': '🟢'
    };
    return icons[importance] || '⚪';
  }

  /**
   * 获取类型图标
   */
  getTypeIcon(type) {
    const icons = {
      'hot': '🔥',
      'news': '📰',
      'derived': '💡'
    };
    return icons[type] || '📌';
  }

  /**
   * 格式化输出热门话题
   */
  formatHotTopics(topics) {
    return this.hotTopicSearcher.formatHotTopics(topics);
  }

  /**
   * 格式化输出资讯
   */
  formatNews(news) {
    return this.newsFetcher.formatNews(news);
  }

  /**
   * 格式化输出竞品分析
   */
  formatViralAnalysis(analysis) {
    return this.competitorAnalyzer.formatAnalysis(analysis);
  }

  /**
   * 格式化输出推荐
   */
  formatRecommendations(recommendations) {
    return this.topicRecommender.formatRecommendations(recommendations);
  }
}

// 导出
module.exports = TrendHub;

// 命令行入口
if (require.main === module) {
  (async () => {
    const hub = new TrendHub();

    const command = process.argv[2] || 'report';
    const category = process.argv[3] || 'all';
    const limit = parseInt(process.argv[4]) || 10;

    switch (command) {
      case 'real':
        const realTopics = hub.searchRealHotTopics(category, limit);
        console.log(hub.realApiSearcher.formatHotTopics(realTopics));
        break;

      case 'hot':
        const topics = await hub.searchHotTopics(category, limit);
        console.log(hub.formatHotTopics(topics));
        break;

      case 'news':
        const news = await hub.fetchIndustryNews(category, limit);
        console.log(hub.formatNews(news));
        break;

      case 'viral':
        const analysis = hub.analyzeViralArticles('', limit);
        console.log(hub.formatViralAnalysis(analysis));
        break;

      case 'recommend':
        const recommendations = await hub.recommendTopics(category, limit);
        console.log(hub.formatRecommendations(recommendations));
        break;

      case 'report':
      default:
        const report = await hub.generateTrendReport({ category, limit });
        console.log(report);
        break;
    }
  })();
}
