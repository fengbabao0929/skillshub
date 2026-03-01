/**
 * 话题推荐模块
 * 基于热点、政策、竞品分析推荐写作主题
 */

const HotTopicSearcher = require('./hot-topic-searcher.cjs');
const IndustryNewsFetcher = require('./industry-news-fetcher.cjs');
const CompetitorAnalyzer = require('./competitor-analyzer.cjs');

class TopicRecommender {
  constructor() {
    this.hotTopicSearcher = new HotTopicSearcher();
    this.newsFetcher = new IndustryNewsFetcher();
    this.competitorAnalyzer = new CompetitorAnalyzer();

    // 话题评分权重
    this.weights = {
      hotness: 0.3,      // 热度权重
      freshness: 0.25,   // 新鲜度权重
      relevance: 0.25,   // 相关性权重
      feasibility: 0.2   // 可行性权重
    };
  }

  /**
   * 推荐写作话题
   * @param {Object} options - 推荐选项
   * @param {string} options.category - 分类（tax/finance/accounting/all）
   * @param {number} options.limit - 推荐数量
   * @param {Array<string>} options.excludeKeywords - 排除关键词
   * @returns {Array} 推荐话题列表
   */
  async recommendTopics(options = {}) {
    const { category = 'all', limit = 15, excludeKeywords = [] } = options;

    // 获取数据源
    const [hotTopics, news, viralAnalysis] = await Promise.all([
      this.hotTopicSearcher.searchHotTopics({ category, limit: 20 }),
      this.newsFetcher.fetchNews({ category, limit: 20 }),
      Promise.resolve(this.competitorAnalyzer.analyzeViralArticles({ limit: 10 }))
    ]);

    // 生成话题候选
    const candidates = this.generateCandidates(hotTopics, news, viralAnalysis);

    // 过滤和评分
    const scored = this.scoreAndFilter(candidates, excludeKeywords);

    // 排序并返回
    return scored.slice(0, limit);
  }

  /**
   * 生成话题候选
   */
  generateCandidates(hotTopics, news, viralAnalysis) {
    const candidates = [];

    // 从热点话题生成候选
    hotTopics.forEach((topic, i) => {
      candidates.push({
        id: `hot_${i}`,
        type: 'hot',
        title: topic.title,
        summary: topic.summary,
        reason: topic.reason,
        category: topic.category,
        tags: topic.tags,
        suggestedTitle: topic.suggestedTitle,
        source: '热门话题',
        publishTime: new Date().toISOString(),
        hotness: topic.hotness,
        freshness: this.calculateFreshness(new Date()),
        relevance: this.calculateRelevance(topic.tags, topic.category),
        feasibility: this.calculateFeasibility(topic.title)
      });
    });

    // 从行业资讯生成候选
    news.forEach((item, i) => {
      candidates.push({
        id: `news_${i}`,
        type: 'news',
        title: item.title,
        summary: item.summary,
        reason: `${item.source}最新发布`,
        category: item.category,
        tags: item.tags,
        suggestedTitle: `${item.title}深度解读`,
        source: item.source,
        publishTime: item.publishTime,
        importance: item.importance,
        hotness: item.importance === 'high' ? 800000 : 500000,
        freshness: this.calculateFreshness(new Date(item.publishTime)),
        relevance: this.calculateRelevance(item.tags, item.category),
        feasibility: this.calculateFeasibility(item.title)
      });
    });

    // 从竞品分析生成衍生话题
    const patterns = viralAnalysis.patterns;
    patterns.topKeywords.slice(0, 5).forEach((keyword, i) => {
      candidates.push({
        id: `derived_${i}`,
        type: 'derived',
        title: `${keyword.keyword}系列文章`,
        summary: `基于竞品爆款文章，${keyword.keyword}是热门话题，可以创作系列内容`,
        reason: `竞品爆款中出现${keyword.count}次`,
        category: 'all',
        tags: [keyword.keyword],
        suggestedTitle: `关于${keyword.keyword}，这几点你必须知道`,
        source: '竞品分析',
        publishTime: new Date().toISOString(),
        hotness: 600000,
        freshness: 0.7,
        relevance: 0.8,
        feasibility: 0.9
      });
    });

    return candidates;
  }

  /**
   * 计算新鲜度（0-1）
   */
  calculateFreshness(date) {
    const now = new Date();
    const diffDays = (now - date) / (1000 * 60 * 60 * 24);
    // 3天内1.0，7天内0.8，30天内0.5，超过30天0.2
    if (diffDays <= 3) return 1.0;
    if (diffDays <= 7) return 0.8;
    if (diffDays <= 30) return 0.5;
    return 0.2;
  }

  /**
   * 计算相关性（0-1）
   */
  calculateRelevance(tags, category) {
    // 财务相关度高的标签
    const highRelevanceTags = ['税务', '财务', '会计', '审计', '内控', '个税', '企业'];
    const hasHighRelevance = tags.some(tag => highRelevanceTags.some(hr => tag.includes(hr)));
    return hasHighRelevance ? 0.9 : 0.7;
  }

  /**
   * 计算可行性（0-1）
   */
  calculateFeasibility(title) {
    // 标题长度适中、有具体指向性的可行性高
    const length = title.length;
    if (length >= 15 && length <= 30) return 0.9;
    if (length >= 10 && length <= 35) return 0.8;
    return 0.6;
  }

  /**
   * 评分和过滤
   */
  scoreAndFilter(candidates, excludeKeywords) {
    return candidates
      .filter(c => {
        // 过滤掉包含排除关键词的
        return !excludeKeywords.some(kw =>
          c.title.includes(kw) || c.tags.some(t => t.includes(kw))
        );
      })
      .map(c => ({
        ...c,
        score: this.calculateScore(c)
      }))
      .sort((a, b) => b.score - a.score);
  }

  /**
   * 计算综合评分
   */
  calculateScore(candidate) {
    const { hotness, freshness, relevance, feasibility } = candidate;
    const { weights } = this;

    // 归一化热度（假设最高1000000）
    const normalizedHotness = Math.min(hotness / 1000000, 1);

    return (
      normalizedHotness * weights.hotness +
      freshness * weights.freshness +
      relevance * weights.relevance +
      feasibility * weights.feasibility
    );
  }

  /**
   * 格式化输出推荐结果
   */
  formatRecommendations(recommendations) {
    let output = '\n💡 写作话题推荐\n';
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

    recommendations.forEach((topic, i) => {
      const typeIcon = this.getTypeIcon(topic.type);
      const scorePercent = Math.round(topic.score * 100);
      output += `${i + 1}. ${typeIcon} ${topic.title}\n`;
      output += `   推荐指数: ${scorePercent}% | 来源: ${topic.source}\n`;
      output += `   推荐标题: ${topic.suggestedTitle}\n`;
      output += `   理由: ${topic.reason}\n`;
      output += `   标签: ${topic.tags.join('、')}\n\n`;
    });

    return output;
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
   * 生成详细的话题创作指南
   */
  generateTopicGuide(topic) {
    return {
      topic: topic.title,
      suggestedTitles: [
        topic.suggestedTitle,
        `为什么${topic.title}这么重要？`,
        `${topic.title}：财务人需要知道什么？`
      ],
      targetAudience: '财务人',
      corePoints: [
        '什么是' + topic.title,
        topic.title + '的重要性',
        '如何应对/实施',
        '注意事项和风险点'
      ],
      structure: '黄金3秒开头 + 三段式内容 + 结尾转化',
      suggestedLength: '2500-3000字',
      recommendedTags: topic.tags,
      callToAction: `关注我，每天分享${topic.category === 'tax' ? '税务' : '财务'}干货。回复【${topic.tags[0]}】领取实战资料。`
    };
  }
}

// 导出
module.exports = TopicRecommender;

// 命令行入口
if (require.main === module) {
  (async () => {
    const recommender = new TopicRecommender();

    const category = process.argv[2] || 'all';
    const limit = parseInt(process.argv[3]) || 10;

    const recommendations = await recommender.recommendTopics({ category, limit });

    console.log(recommender.formatRecommendations(recommendations));

    // 输出第一个话题的详细指南
    if (recommendations.length > 0) {
      const guide = recommender.generateTopicGuide(recommendations[0]);
      console.log('\n📋 推荐话题详细创作指南\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log(`话题: ${guide.topic}\n`);
      console.log(`推荐标题:`);
      guide.suggestedTitles.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));
      console.log(`\n目标读者: ${guide.targetAudience}`);
      console.log(`\n核心要点:`);
      guide.corePoints.forEach(p => console.log(`  - ${p}`));
      console.log(`\n文章结构: ${guide.structure}`);
      console.log(`建议字数: ${guide.suggestedLength}`);
      console.log(`推荐标签: ${guide.recommendedTags.join('、')}`);
      console.log(`\n行动号召: ${guide.callToAction}\n`);
    }
  })();
}
