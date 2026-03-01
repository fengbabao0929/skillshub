/**
 * 热门话题搜索模块
 * 搜索财经领域热点话题
 */

const https = require('https');
const http = require('http');

class HotTopicSearcher {
  constructor() {
    this.sources = [
      {
        name: '百度热点',
        type: 'search',
        baseUrl: 'www.baidu.com',
        path: '/s',
        encoding: 'utf-8'
      },
      {
        name: '知乎热榜',
        type: 'api',
        baseUrl: 'www.zhihu.com',
        path: '/api/v3/feed/topsearch/hot-searches/words',
        encoding: 'utf-8'
      },
      {
        name: '微博热搜',
        type: 'api',
        baseUrl: 's.weibo.com',
        path: '/ajax/top/hot',
        encoding: 'utf-8'
      }
    ];

    // 财经相关关键词
    this.financeKeywords = [
      '财经', '财务', '税务', '会计', '审计', '内控',
      '现金流', '预算', '成本', '融资', '投资', '理财',
      '个税', '企业所得税', '增值税', '社保', '公积金',
      '财报', '上市', 'IPO', '股市', '基金', '债券',
      '央行', '降息', '加息', '汇率', '通胀', '经济数据'
    ];
  }

  /**
   * 搜索财经热点话题
   * @param {Object} options - 搜索选项
   * @param {string} options.category - 分类（finance/tax/accounting等）
   * @param {number} options.limit - 返回数量
   * @returns {Array} 热门话题列表
   */
  async searchHotTopics(options = {}) {
    const { category = 'finance', limit = 20 } = options;

    // 使用内置的财经热点数据（模拟搜索结果）
    const topics = this.getFinanceHotTopics(category);

    // 按热度排序并限制数量
    return topics.slice(0, limit);
  }

  /**
   * 获取财经热点话题（内置数据）
   */
  getFinanceHotTopics(category) {
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    const baseTopics = [
      {
        title: `年${year}个税专项附加扣除确认开始`,
        hotness: 950000,
        category: 'tax',
        tags: ['个税', '专项扣除', '税务'],
        trend: 'rising',
        reason: '年底专项附加扣除确认期',
        suggestedTitle: '年${year}个税专项附加扣除开始确认！这5个变化财务人必知',
        summary: '纳税人需要在12月底前确认${year}年专项附加扣除信息，涉及子女教育、继续教育、住房贷款利息等多个项目。'
      },
      {
        title: '小规模纳税人增值税减免政策延续',
        hotness: 880000,
        category: 'tax',
        tags: ['增值税', '小规模纳税人', '减免'],
        trend: 'stable',
        reason: '小微企业税收优惠政策持续',
        suggestedTitle: '小规模纳税人注意！增值税减免政策延续到${year}年',
        summary: '财政部明确，月销售额10万元以下增值税小规模纳税人免征增值税政策延续执行。'
      },
      {
        title: '金税四期全面推广，企业税务合规升级',
        hotness: 850000,
        category: 'tax',
        tags: ['金税四期', '税务合规', '智慧税务'],
        trend: 'rising',
        reason: '金税四期在全国范围推广',
        suggestedTitle: '金税四期来了！企业财务必须知道的5大变化',
        summary: '金税四期智慧税务系统在全国推广，实现"以数治税"，企业税务合规要求全面提升。'
      },
      {
        title: '社保入税后，企业合规成本上升',
        hotness: 720000,
        category: 'hr_finance',
        tags: ['社保', '合规', '人力成本'],
        trend: 'stable',
        reason: '社保征收体制改革持续推进',
        suggestedTitle: '社保入税后，企业合规成本增加了多少？',
        summary: '社保由税务部门统一征收后，企业社保合规性要求提高，人力成本结构发生变化。'
      },
      {
        title: '中小企业数字化转型加速',
        hotness: 680000,
        category: 'management',
        tags: ['数字化转型', '中小企业', '财务系统'],
        trend: 'rising',
        reason: '政策扶持+市场需求双重驱动',
        suggestedTitle: '中小企业财务数字化转型：从这5个方面入手',
        summary: '在政策扶持和市场需求双重推动下，中小企业财务数字化转型进入快车道。'
      },
      {
        title: '现金流管理成企业生存关键',
        hotness: 650000,
        category: 'finance',
        tags: ['现金流', '资金管理', '企业生存'],
        trend: 'rising',
        reason: '经济环境下行，现金流重要性凸显',
        suggestedTitle: '经济下行期，为什么现金流管理比利润更重要？',
        summary: '在当前经济环境下，良好的现金流管理成为企业生存和发展的关键因素。'
      },
      {
        title: 'ESG报告成为上市公司标配',
        hotness: 580000,
        category: 'reporting',
        tags: ['ESG', '上市公司', '信息披露'],
        trend: 'rising',
        reason: '监管要求+投资者关注',
        suggestedTitle: '上市公司必读：ESG报告该怎么写？',
        summary: '随着监管要求提高和投资者关注度上升，ESG报告已成为上市公司信息披露的重要组成部分。'
      },
      {
        title: '财务共享中心模式普及',
        hotness: 520000,
        category: 'management',
        tags: ['财务共享', '中心化', '降本增效'],
        trend: 'stable',
        reason: '大型企业集团化发展需求',
        suggestedTitle: '财务共享中心：是降本增效还是管理陷阱？',
        summary: '越来越多大型企业集团建立财务共享中心，实现财务业务标准化和集约化管理。'
      },
      {
        title: '管理会计应用深入推进',
        hotness: 480000,
        category: 'accounting',
        tags: ['管理会计', '财务转型', '价值创造'],
        trend: 'stable',
        reason: '财政部推动管理会计体系建设',
        suggestedTitle: '财务人员转型：从记账到管理会计的5个方向',
        summary: '财政部持续推进管理会计体系建设，推动财务会计向管理会计转型。'
      },
      {
        title: '电子发票全面普及',
        hotness: 450000,
        category: 'tax',
        tags: ['电子发票', '数电票', '发票改革'],
        trend: 'rising',
        reason: '全电发票试点范围扩大',
        suggestedTitle: '全电发票来了！财务人需要掌握的5个新变化',
        summary: '全面数字化的电子发票（数电票）试点范围不断扩大，传统发票管理方式发生重大变革。'
      }
    ];

    // 根据分类过滤
    if (category === 'all') {
      return baseTopics;
    }

    return baseTopics.filter(topic => {
      if (category === 'tax') return topic.category === 'tax';
      if (category === 'finance') return topic.category === 'finance' || topic.category === 'accounting';
      return true;
    });
  }

  /**
   * 格式化输出热门话题
   */
  formatHotTopics(topics) {
    let output = '\n📈 财经热点话题\n';
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

    topics.forEach((topic, i) => {
      const trendIcon = topic.trend === 'rising' ? '📈' : '➡️';
      const hotness = this.formatHotness(topic.hotness);
      output += `${i + 1}. ${trendIcon} ${topic.title}\n`;
      output += `   热度: ${hotness} | 分类: ${this.getCategoryName(topic.category)}\n`;
      output += `   标签: ${topic.tags.join('、')}\n`;
      output += `   推荐标题: ${topic.suggestedTitle}\n\n`;
    });

    return output;
  }

  /**
   * 格式化热度数值
   */
  formatHotness(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 10000) return (num / 10000).toFixed(1) + 'W';
    return num.toString();
  }

  /**
   * 获取分类名称
   */
  getCategoryName(category) {
    const names = {
      'tax': '税务',
      'finance': '财务',
      'accounting': '会计',
      'management': '管理',
      'hr_finance': '人力财务',
      'reporting': '报告披露'
    };
    return names[category] || category;
  }

  /**
   * 根据话题生成文章建议
   */
  generateArticleSuggestions(topic) {
    return {
      topic: topic.title,
      suggestedTitles: [
        topic.suggestedTitle,
        `为什么${topic.title}这么火？`,
        `${topic.title}：财务人需要知道什么？`
      ],
      keyPoints: [
        `什么是${topic.title}`,
        `${topic.title}的影响`,
        `财务人员应对策略`
      ],
      targetAudience: '财务人',
      tags: topic.tags
    };
  }
}

// 导出
module.exports = HotTopicSearcher;

// 命令行入口
if (require.main === module) {
  (async () => {
    const searcher = new HotTopicSearcher();

    const category = process.argv[2] || 'finance';
    const limit = parseInt(process.argv[3]) || 10;

    const topics = await searcher.searchHotTopics({ category, limit });

    console.log(searcher.formatHotTopics(topics));
  })();
}
