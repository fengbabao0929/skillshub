/**
 * 行业资讯获取模块
 * 获取最新财务、税务、政策资讯
 */

class IndustryNewsFetcher {
  constructor() {
    // 资讯来源配置
    this.sources = {
      tax: [
        { name: '国家税务总局', url: 'https://www.chinatax.gov.cn', type: 'policy' },
        { name: '财政部', url: 'https://www.mof.gov.cn', type: 'policy' }
      ],
      finance: [
        { name: '人民银行', url: 'https://www.pbc.gov.cn', type: 'policy' },
        { name: '证监会', url: 'https://www.csrc.gov.cn', type: 'policy' }
      ],
      accounting: [
        { name: '财政部会计司', url: 'https://kjs.mof.gov.cn', type: 'policy' },
        { name: '中注协', url: 'https://www.cicpa.org.cn', type: 'industry' }
      ]
    };
  }

  /**
   * 获取行业资讯
   * @param {Object} options - 获取选项
   * @param {string} options.category - 分类（tax/finance/accounting/all）
   * @param {number} options.limit - 返回数量
   * @param {number} options.days - 获取最近几天的资讯
   * @returns {Array} 资讯列表
   */
  async fetchNews(options = {}) {
    const { category = 'all', limit = 20, days = 7 } = options;

    // 使用内置的模拟资讯数据
    const news = this.getMockNews(category, days);

    return news.slice(0, limit);
  }

  /**
   * 获取模拟资讯数据
   */
  getMockNews(category, days) {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    const baseNews = [
      // 税务资讯
      {
        title: `关于${year}年个人所得税综合所得汇算清缴事项的公告`,
        source: '国家税务总局',
        publishTime: this.getDateString(0),
        category: 'tax',
        type: 'policy',
        importance: 'high',
        summary: '国家税务总局发布${year}年个人所得税综合所得汇算清缴公告，明确汇算清缴时间、范围、方式等内容。',
        tags: ['个税', '汇算清缴', '政策'],
        url: 'https://www.chinatax.gov.cn/'
      },
      {
        title: '关于进一步提高科技型中小企业研发费用税前扣除比例的公告',
        source: '财政部、税务总局',
        publishTime: this.getDateString(1),
        category: 'tax',
        type: 'policy',
        importance: 'high',
        summary: '科技型中小企业开展研发活动中实际发生的研发费用，未形成无形资产计入当期损益的，在按规定据实扣除的基础上，自${year}年1月1日起，再按照实际发生额的100%在税前加计扣除。',
        tags: ['研发费用', '加计扣除', '中小企业'],
        url: 'https://www.chinatax.gov.cn/'
      },
      {
        title: '关于明确增值税小规模纳税人减免增值税等政策的公告',
        source: '财政部、税务总局',
        publishTime: this.getDateString(2),
        category: 'tax',
        type: 'policy',
        importance: 'medium',
        summary: '自${year}年1月1日至${year}年12月31日，对月销售额10万元以下（含本数）的增值税小规模纳税人，免征增值税。',
        tags: ['增值税', '小规模纳税人', '减免'],
        url: 'https://www.chinatax.gov.cn/'
      },
      {
        title: '国家税务总局关于优化纳税服务简并居民企业报告境外投资和所得信息有关报表的公告',
        source: '国家税务总局',
        publishTime: this.getDateString(3),
        category: 'tax',
        type: 'service',
        importance: 'medium',
        summary: '为进一步优化纳税服务，减轻纳税人申报负担，国家税务总局决定简并居民企业报告境外投资和所得信息有关报表。',
        tags: ['境外投资', '信息报告', '简并'],
        url: 'https://www.chinatax.gov.cn/'
      },

      // 财务资讯
      {
        title: '中国人民银行决定下调金融机构存款准备金率',
        source: '人民银行',
        publishTime: this.getDateString(0),
        category: 'finance',
        type: 'policy',
        importance: 'high',
        summary: '为巩固经济回升向好基础，保持流动性合理充裕，中国人民银行决定于近期下调金融机构存款准备金率0.25个百分点。',
        tags: ['央行', '降准', '货币政策'],
        url: 'https://www.pbc.gov.cn/'
      },
      {
        title: '证监会发布《上市公司现金分红指引》',
        source: '证监会',
        publishTime: this.getDateString(1),
        category: 'finance',
        type: 'policy',
        importance: 'high',
        summary: '证监会发布上市公司现金分红指引，鼓励上市公司合理分红，保护投资者合法权益。',
        tags: ['上市公司', '现金分红', '投资者保护'],
        url: 'https://www.csrc.gov.cn/'
      },
      {
        title: '央行发布${year}年金融稳定报告',
        source: '人民银行',
        publishTime: this.getDateString(4),
        category: 'finance',
        type: 'report',
        importance: 'medium',
        summary: '中国人民银行发布${year}年金融稳定报告，全面评估我国金融体系稳健性，提出维护金融稳定的政策建议。',
        tags: ['金融稳定', '央行报告', '风险评估'],
        url: 'https://www.pbc.gov.cn/'
      },

      // 会计资讯
      {
        title: '财政部关于征求《企业会计准则解释第18号（征求意见稿）》意见的函',
        source: '财政部会计司',
        publishTime: this.getDateString(1),
        category: 'accounting',
        type: 'policy',
        importance: 'medium',
        summary: '财政部会计司就《企业会计准则解释第18号（征求意见稿）》公开征求意见，主要涉及收入确认、租赁等领域。',
        tags: ['企业会计准则', '解释', '征求意见'],
        url: 'https://kjs.mof.gov.cn/'
      },
      {
        title: '中注协发布${year}年注册会计师行业发展规划',
        source: '中注协',
        publishTime: this.getDateString(3),
        category: 'accounting',
        type: 'plan',
        importance: 'medium',
        summary: '中国注册会计师协会发布${year}年行业发展规划，提出深化行业改革、提升服务质量、加强监管等目标。',
        tags: ['注协', '行业规划', '发展'],
        url: 'https://www.cicpa.org.cn/'
      },
      {
        title: '财政部关于做好${year}年企业会计准则通用分类标准实施工作的通知',
        source: '财政部会计司',
        publishTime: this.getDateString(5),
        category: 'accounting',
        type: 'service',
        importance: 'medium',
        summary: '财政部就${year}年企业会计准则通用分类标准实施工作做出部署，要求相关企业做好XBRL财务报告编制工作。',
        tags: ['会计准则', '分类标准', 'XBRL'],
        url: 'https://kjs.mof.gov.cn/'
      },

      // 综合资讯
      {
        title: '三部门发布关于进一步优化个人所得税有关政策的公告',
        source: '财政部、税务总局、人社部',
        publishTime: this.getDateString(2),
        category: 'tax',
        type: 'policy',
        importance: 'high',
        summary: '为进一步减轻纳税人负担，三部门联合发布公告，优化个人所得税专项附加扣除、汇算清缴等政策。',
        tags: ['个税', '政策优化', '专项扣除'],
        url: 'https://www.chinatax.gov.cn/'
      },
      {
        title: '国资委关于推进中央企业高质量发展工作的指导意见',
        source: '国资委',
        publishTime: this.getDateString(4),
        category: 'finance',
        type: 'policy',
        importance: 'high',
        summary: '国资委发布指导意见，要求中央企业推进高质量发展，提升核心竞争力，加强风险防控。',
        tags: ['央企', '高质量发展', '指导意见'],
        url: 'https://www.sasac.gov.cn/'
      }
    ];

    // 根据分类过滤
    if (category === 'all') {
      return baseNews;
    }

    return baseNews.filter(news => news.category === category);
  }

  /**
   * 获取日期字符串（几天前）
   */
  getDateString(daysAgo) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  }

  /**
   * 格式化输出资讯
   */
  formatNews(news) {
    let output = '\n📰 行业资讯\n';
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

    news.forEach((item, i) => {
      const importanceIcon = this.getImportanceIcon(item.importance);
      output += `${i + 1}. ${importanceIcon} ${item.title}\n`;
      output += `   来源: ${item.source} | 时间: ${item.publishTime}\n`;
      output += `   分类: ${this.getCategoryName(item.category)} | 类型: ${this.getTypeName(item.type)}\n`;
      output += `   摘要: ${item.summary}\n`;
      output += `   标签: ${item.tags.join('、')}\n\n`;
    });

    return output;
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
   * 获取分类名称
   */
  getCategoryName(category) {
    const names = {
      'tax': '税务',
      'finance': '财务',
      'accounting': '会计'
    };
    return names[category] || category;
  }

  /**
   * 获取类型名称
   */
  getTypeName(type) {
    const names = {
      'policy': '政策',
      'service': '服务',
      'report': '报告',
      'plan': '规划',
      'industry': '行业'
    };
    return names[type] || type;
  }

  /**
   * 从资讯生成文章建议
   */
  generateArticleSuggestions(newsItem) {
    return {
      topic: newsItem.title,
      suggestedTitles: [
        `${newsItem.title}深度解读`,
        `${newsItem.source}最新政策：财务人必知`,
        `${newsItem.tags[0]}新规来了，这5个变化要注意`
      ],
      summary: newsItem.summary,
      source: newsItem.source,
      publishTime: newsItem.publishTime,
      tags: newsItem.tags,
      targetAudience: '财务人',
      keyPoints: [
        '政策背景',
        '核心内容',
        '对企业的影响',
        '应对措施'
      ]
    };
  }
}

// 导出
module.exports = IndustryNewsFetcher;

// 命令行入口
if (require.main === module) {
  (async () => {
    const fetcher = new IndustryNewsFetcher();

    const category = process.argv[2] || 'all';
    const limit = parseInt(process.argv[3]) || 15;

    const news = await fetcher.fetchNews({ category, limit });

    console.log(fetcher.formatNews(news));
  })();
}
