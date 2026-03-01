#!/usr/bin/env node

/**
 * 青少年学习教练公众号内容生成器
 * 专注于家长焦虑、学习方法、习惯培养、考试辅导等内容
 */

const fs = require('fs');
const path = require('path');

// ==================== 配置 ====================

const CONFIG = {
  articlesDir: path.join(__dirname, '../articles'),
  timestamp: new Date().toISOString().split('T')[0].replace(/-/g, ''),
};

// ==================== 热门主题库 ====================

const HOT_TOPICS = {
  // 学习痛点类
  "不爱学习": {
    category: "学习痛点",
    hotness: 5,
    description: "孩子对学习缺乏兴趣和动力",
    painPoints: ["看到书本就头疼", "写作业磨蹭", "上课走神", "成绩下滑"]
  },
  "沉迷手机": {
    category: "学习痛点",
    hotness: 5,
    description: "孩子过度使用手机影响学习",
    painPoints: ["手机不离手", "玩游戏停不下来", "刷短视频成瘾", "躲在房间里玩手机"]
  },
  "学习效率低": {
    category: "学习痛点",
    hotness: 4,
    description: "花很多时间学习但效果不佳",
    painPoints: ["学得很晚但成绩不提高", "记不住知识点", "做题慢", "总是来不及复习"]
  },
  "拖延症": {
    category: "学习痛点",
    hotness: 4,
    description: "做事拖拉，缺乏时间管理能力",
    painPoints: ["作业总拖到最后一刻", "复习计划总是完不成", "起床困难", "做事三分钟热度"]
  },
  "注意力不集中": {
    category: "学习痛点",
    hotness: 4,
    description: "难以长时间专注学习",
    painPoints: ["上课容易走神", "做作业时分心", "无法长时间专注", "容易被外界干扰"]
  },

  // 家长焦虑类
  "成绩焦虑": {
    category: "家长焦虑",
    hotness: 5,
    description: "家长过度关注孩子成绩",
    painPoints: ["看到分数就紧张", "总拿别人家孩子比较", "分数下降就焦虑", "担心孩子考不上好学校"]
  },
  "亲子冲突": {
    category: "家长焦虑",
    hotness: 4,
    description: "因学习问题引发的亲子矛盾",
    painPoints: ["一谈学习就吵架", "孩子不听话", "管得太多孩子反感", "不知道怎么沟通"]
  },
  "补课焦虑": {
    category: "家长焦虑",
    hotness: 4,
    description: "盲目补课带来的焦虑和压力",
    painPoints: ["别人都在补课", "不补课怕落后", "补课效果不明显", "补课费用高压力大"]
  },

  // 方法指导类
  "自主学习": {
    category: "方法指导",
    hotness: 5,
    description: "培养孩子自主学习的能力",
    benefits: ["不用催也能自觉学习", "学会制定学习计划", "主动复习预习", "培养终身学习能力"]
  },
  "时间管理": {
    category: "方法指导",
    hotness: 4,
    description: "教孩子有效管理时间",
    benefits: ["作业写得快", "学习娱乐两不误", "提高学习效率", "培养自律习惯"]
  },
  "记忆方法": {
    category: "方法指导",
    hotness: 4,
    description: "科学高效的记忆方法",
    benefits: ["记住知识点不再难", "背诵效率翻倍", "复习不再枯燥", "考试时想得起来"]
  },
  "笔记方法": {
    category: "方法指导",
    hotness: 3,
    description: "高效记笔记的方法",
    benefits: ["课堂重点不遗漏", "复习时一目了然", "知识点有条理", "提高学习效率"]
  },

  // 习惯培养类
  "学习习惯": {
    category: "习惯培养",
    hotness: 5,
    description: "建立良好的学习习惯",
    benefits: ["养成固定学习时间", "作业主动完成", "预习复习成习惯", "成绩稳步提升"]
  },
  "阅读习惯": {
    category: "习惯培养",
    hotness: 4,
    description: "培养孩子的阅读兴趣和习惯",
    benefits: ["知识面更广", "理解能力提升", "写作水平提高", "培养终身学习习惯"]
  },
  "作息习惯": {
    category: "习惯培养",
    hotness: 3,
    description: "建立健康的作息规律",
    benefits: ["精神状态好", "上课注意力集中", "学习效率高", "身体更健康"]
  },

  // 考试辅导类
  "考试焦虑": {
    category: "考试辅导",
    hotness: 4,
    description: "缓解孩子的考试紧张情绪",
    painPoints: ["考前失眠", "考试时大脑空白", "担心考不好", "发挥失常"]
  },
  "考前冲刺": {
    category: "考试辅导",
    hotness: 4,
    description: "高效的考前复习方法",
    benefits: ["抓住重点复习", "短期快速提分", "考前心态调整", "考试发挥稳定"]
  },
  "应试技巧": {
    category: "考试辅导",
    hotness: 3,
    description: "实用的考试答题技巧",
    benefits: ["答题速度更快", "准确率提升", "不会做的也能得分", "考试时间分配合理"]
  },

  // 案例故事类
  "逆袭故事": {
    category: "案例故事",
    hotness: 5,
    description: "从学渣到学霸的真实案例",
    keyElements: ["起点低", "找到方法", "持续努力", "最终成功"]
  },
  "习惯改变": {
    category: "案例故事",
    hotness: 4,
    description: "通过改变习惯实现进步",
    keyElements: ["发现问题", "建立新习惯", "坚持执行", "收获成长"]
  }
};

// ==================== 爆款标题库 ====================

const TITLE_TEMPLATES = {
  // 焦虑类标题
  anxiety: [
    "为什么孩子{痛点}？90%家长都做错了",
    "如果孩子{痛点}，请立刻停止做这件事",
    "{痛点}的真相，大多数家长都想错了",
    "别再{错误行为}了！正在毁掉你的孩子",
    "90%家长都踩的{痛点}坑，你在里面吗？"
  ],

  // 方法类标题
  method: [
    "{数字}个方法，让孩子{正向改变}",
    "聪明的父母都这样做，{效果}",
    "从{问题}到{结果}，只需要{数字}步",
    "学会这{数字}招，孩子{正向改变}",
    "{数字}分钟，教你搞定{痛点}"
  ],

  // 警示类标题
  warning: [
    "这3句话千万别对孩子说，后果很严重",
    "还在{错误行为}？快停下，孩子很受伤",
    "90%的家长都在犯的错误，你中招了吗？",
    "警惕！这些行为正在毁掉孩子的{能力}",
    "如果你这么做，孩子可能{负面后果}"
  ],

  // 励志类标题
  inspiration: [
    "从学渣到学霸，这个孩子只做了{数字}件事",
    "放弃补课后，孩子反而{正向改变}",
    "一个决定，让孩子从{问题}到{结果}",
    "这位妈妈的做法，值得所有家长学习",
    "原来{正向改变}这么简单"
  ],

  // 对比类标题
  contrast: [
    "月薪3千和月薪3万的父母，养出的孩子差别这么大",
    "为什么别人的孩子{正向改变}，你的孩子{痛点}？",
    "聪明的家长做{正确行为}，糊涂的家长{错误行为}",
    "同样是{痛点}，为什么结果差别这么大？"
  ]
};

// ==================== 文章类型模板 ====================

const ARTICLE_TYPES = {
  "痛点分析": {
    structure: [
      "01 一个真实的场景",
      "02 痛点背后的真相",
      "03 为什么会这样",
      "04 我们该怎么办",
      "05 写在最后"
    ],
    tone: "共情、深入、启发性",
    keyElements: ["真实案例", "痛点共鸣", "深层原因", "解决方向"]
  },

  "方法指导": {
    structure: [
      "01 问题的根源",
      "02 方法为什么有效",
      "03 具体步骤（数字列举）",
      "04 注意事项",
      "05 成功案例"
    ],
    tone: "实用、清晰、可操作",
    keyElements: ["问题明确", "原理说明", "步骤清晰", "效果验证"]
  },

  "案例故事": {
    structure: [
      "01 故事的开端（困境）",
      "02 转折点（发现方法）",
      "03 改变的过程",
      "04 最终的成果",
      "05 我们的启发"
    ],
    tone: "故事性、感染力、启发性",
    keyElements: ["真实可感", "情感共鸣", "方法植入", "结果展示"]
  },

  "家长焦虑": {
    structure: [
      "01 你是不是也有这些焦虑",
      "02 焦虑从哪里来",
      "03 焦虑带来的后果",
      "04 如何缓解焦虑",
      "05 给家长的建议"
    ],
    tone: "理解、安慰、建设性",
    keyElements: ["焦虑共鸣", "原因分析", "后果揭示", "缓解方法"]
  },

  "习惯培养": {
    structure: [
      "01 为什么要培养这个习惯",
      "02 好习惯的价值",
      "03 如何建立习惯",
      "04 坚持的技巧",
      "05 常见问题解答"
    ],
    tone: "鼓励、具体、可持续",
    keyElements: ["价值阐述", "具体方法", "激励机制", "问题解决"]
  },

  "考试辅导": {
    structure: [
      "01 考前常见的困扰",
      "02 备考的核心原则",
      "03 高效复习方法",
      "04 考试技巧",
      "05 心态调整"
    ],
    tone: "实用、鼓励、减压",
    keyElements: ["问题识别", "复习策略", "应试技巧", "心态建设"]
  }
};

// ==================== 工具函数 ====================

function generateTitles(topic, type = "方法指导") {
  const topicInfo = HOT_TOPICS[topic] || { description: topic };
  const titles = [];

  // 根据主题类型选择合适的标题模板
  if (topicInfo.category === "学习痛点" || topicInfo.category === "家长焦虑") {
    titles.push(...TITLE_TEMPLATES.anxiety.map(t => t
      .replace("{痛点}", topic)
      .replace("{错误行为}", topicInfo.painPoints?.[0] || "错误做法")
    ));
    titles.push(...TITLE_TEMPLATES.warning.map(t => t
      .replace("{错误行为}", topicInfo.painPoints?.[0] || "错误行为")
      .replace("{能力}", "学习能力")
      .replace("{负面后果}", "越来越不爱学习")
    ));
  } else {
    titles.push(...TITLE_TEMPLATES.method.map(t => t
      .replace("{数字}", ["3", "5", "7"][Math.floor(Math.random() * 3)])
      .replace("{正向改变}", topicInfo.benefits?.[0] || "有明显进步")
      .replace("{效果}", topicInfo.benefits?.[0] || "看到了效果")
      .replace("{问题}", topic)
      .replace("{结果}", topicInfo.benefits?.[0] || "理想状态")
    ));
    titles.push(...TITLE_TEMPLATES.inspiration.map(t => t
      .replace("{数字}", ["3", "5", "7"][Math.floor(Math.random() * 3)])
      .replace("{正向改变}", topicInfo.benefits?.[0] || "有了进步")
      .replace("{问题}", topic)
      .replace("{结果}", topicInfo.benefits?.[0] || "目标")
    ));
  }

  return [...new Set(titles)].slice(0, 8); // 去重并返回前8个
}

function generateOutline(topic, type = "方法指导") {
  const typeInfo = ARTICLE_TYPES[type] || ARTICLE_TYPES["方法指导"];
  const topicInfo = HOT_TOPICS[topic] || { description: topic };

  return {
    topic,
    type,
    structure: typeInfo.structure,
    tone: typeInfo.tone,
    keyElements: typeInfo.keyElements,
    topicInfo: {
      description: topicInfo.description,
      category: topicInfo.category || type
    }
  };
}

// ==================== 主函数 ====================

async function main() {
  const args = process.argv.slice(2);

  // 解析命令行参数
  const params = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--topic' && args[i + 1]) {
      params.topic = args[i + 1];
      i++;
    } else if (args[i] === '--type' && args[i + 1]) {
      params.type = args[i + 1];
      i++;
    } else if (args[i] === '--format' && args[i + 1]) {
      params.format = args[i + 1];
      i++;
    } else if (args[i] === '--save') {
      params.save = true;
    } else if (args[i] === '--list-topics') {
      params.listTopics = true;
    }
  }

  // 列出所有主题
  if (params.listTopics) {
    printAllTopics();
    return;
  }

  // 需要主题参数
  if (!params.topic) {
    console.error('错误: 请指定主题 --topic <主题名称>');
    console.error('使用 --list-topics 查看所有可用主题');
    process.exit(1);
  }

  // 生成标题
  if (params.format === 'titles') {
    const titles = generateTitles(params.topic, params.type);
    console.log('\n【爆款标题选项】\n');
    titles.forEach((title, i) => {
      console.log(`${i + 1}. ${title}`);
    });
    console.log('');
    return;
  }

  // 生成大纲
  if (params.format === 'outline') {
    const outline = generateOutline(params.topic, params.type);
    console.log('\n【文章大纲】\n');
    console.log(`# ${params.topic}：${params.type}\n`);
    console.log('**文章结构：**\n');
    outline.structure.forEach((section, i) => {
      console.log(`${i + 1}. ${section}`);
    });
    console.log('\n**文章基调：**' + outline.tone);
    console.log('\n**核心要素：**' + outline.keyElements.join('、'));
    console.log('');
    return;
  }

  // 默认：生成完整文章
  await generateArticle(params.topic, params.type, params.save);
}

function printAllTopics() {
  console.log('\n╔════════════════════════════════════╗');
  console.log('║     青少年学习教练公众号内容生成器      ║');
  console.log('╚════════════════════════════════════╝\n');

  const categories = {};
  Object.entries(HOT_TOPICS).forEach(([topic, info]) => {
    if (!categories[info.category]) {
      categories[info.category] = [];
    }
    categories[info.category].push({ topic, ...info });
  });

  Object.entries(categories).forEach(([category, topics]) => {
    const stars = '⭐'.repeat(Math.max(...topics.map(t => t.hotness)));
    console.log(`【${category}】${stars}\n`);

    topics.sort((a, b) => b.hotness - a.hotness).forEach(({ topic, description, hotness }) => {
      const rating = '⭐'.repeat(hotness);
      console.log(`  • ${topic} ${rating}`);
      console.log(`    ${description}`);
    });
    console.log('');
  });

  const totalTopics = Object.keys(HOT_TOPICS).length;
  console.log(`────────────────────────────────────`);
  console.log(`共 ${totalTopics} 个热门主题`);
  console.log(`────────────────────────────────────\n`);
}

async function generateArticle(topic, type = "方法指导", save = false) {
  const outline = generateOutline(topic, type);
  const titles = generateTitles(topic, type);
  const timestamp = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });

  console.log('\n╔════════════════════════════════════╗');
  console.log('║     青少年学习教练公众号内容生成器      ║');
  console.log('╚════════════════════════════════════╝\n');

  console.log(`💡 主题：${topic}`);
  console.log(`💡 类型：${type}`);
  console.log(`💡 日期：${timestamp}\n`);

  console.log('────────────────────────────────────\n');
  console.log('【推荐标题】\n');
  titles.forEach((title, i) => {
    console.log(`${i + 1}. ${title}`);
  });

  console.log('\n────────────────────────────────────\n');
  console.log('【文章大纲】\n');
  outline.structure.forEach((section, i) => {
    console.log(`${i + 1}. ${section}`);
  });

  console.log('\n────────────────────────────────────\n');
  console.log('【公众号排版建议】\n');
  console.log('✅ 标题：使用数字+痛点，如「5个方法」「3个误区」');
  console.log('✅ 导语：1-2句话戳中家长焦虑，引发共鸣');
  console.log('✅ 正文：小标题分割，每段不超过3行');
  console.log('✅ 重点：使用引用框或加粗标注关键信息');
  console.log('✅ 金句：每部分提炼1-2句金句，便于传播');
  console.log('✅ 结尾：给出具体行动建议，引导关注');
  console.log('✅ 风格：亲切易懂，避免专业术语，多用案例');

  if (save) {
    const filename = `公众号_${CONFIG.timestamp}_${topic}.md`;
    const filepath = path.join(CONFIG.articlesDir, filename);

    // 确保目录存在
    if (!fs.existsSync(CONFIG.articlesDir)) {
      fs.mkdirSync(CONFIG.articlesDir, { recursive: true });
    }

    const content = `╔════════════════════════════════════╗
║     青少年学习教练公众号内容生成器      ║
╚════════════════════════════════════╝

💡 主题：${topic}
💡 类型：${type}
💡 日期：${timestamp}

────────────────────────────────────

【推荐标题】

────────────────────────────────────

${titles.map((t, i) => `${i + 1}. ${t}`).join('\n')}

────────────────────────────────────

【文章大纲】

────────────────────────────────────

# ${topic}：${type}

${outline.structure.map((s, i) => `${i + 1}. ${s}`).join('\n')}

────────────────────────────────────

【写作要点】

────────────────────────────────────

- 文章基调：${outline.tone}
- 核心要素：${outline.keyElements.join('、')}
- 目标读者：关注孩子学习的家长
- 字数建议：1500-2500字

────────────────────────────────────

【公众号排版建议】

────────────────────────────────────

✅ 标题：使用数字+痛点，如「5个方法」「3个误区」
✅ 导语：1-2句话戳中家长焦虑，引发共鸣
✅ 正文：小标题分割，每段不超过3行
✅ 重点：使用引用框或加粗标注关键信息
✅ 金句：每部分提炼1-2句金句，便于传播
✅ 结尾：给出具体行动建议，引导关注
✅ 风格：亲切易懂，避免专业术语，多用案例

────────────────────────────────────
`;

    fs.writeFileSync(filepath, content, 'utf-8');
    console.log('\n────────────────────────────────────');
    console.log(`✓ 已保存到: ${filepath}`);
    console.log('────────────────────────────────────\n');
  }
}

// 运行主函数
main().catch(console.error);
