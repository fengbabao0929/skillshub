#!/usr/bin/env node

/**
 * 成交型叙事生成器
 *
 * 用途：根据不同目的、读者类型、行业场景，生成定制化的成交型故事
 *
 * 使用方法：
 *   node conversion-story-generator.js generate --purpose TYPE --audience TYPE --industry TYPE
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// 成交型叙事5步法核心框架
// ============================================================================

const CONVERSION_FRAMEWORK = `
# 成交型叙事5步法

## 第一步：痛点共鸣（制造反差）
- 先展示光鲜/常态
- 然后突然抛出危机
- 让用户觉得"原来你跟我一样也有烦恼"

## 第二步：细节描写（激发情绪）
- 用画面感把焦虑演出来
- 调用视觉、听觉等感官
- 激发杏仁核（情绪脑）反应

## 第三步：权威转折（打破认知）
- 告诉读者：痛苦不是因为不够努力，而是方向/认知错了
- 抛出"反认知"理念
- 这是最关键的一步

## 第四步：产品救赎（提供出口）
- 引出你的身份或产品
- 证明这套方法可行
- 给焦虑的用户希望

## 第五步：紧迫行动（关闭理性）
- 下钩子：限时/限额/资料包
- 制造紧迫感
- 不让用户进入理性思考
`;

// ============================================================================
// 文章目的类型
// ============================================================================

const PURPOSE_TYPES = {
  sales: {
    name: "直接销售",
    description: "推广具体课程/产品，直接促成购买",
    ctaType: "强成交",
      "限时优惠，立即抢购",
      "前X名报名，赠送XX",
      "扫码/点击链接，立刻开始"
    ]
  },
  lead: {
    name: "获取线索",
    description: "获取潜在客户信息，建立私域流量",
    ctaType: "留资引流",
    ctaExamples: [
      "免费领取XX资料包",
      "添加微信，进交流群",
      "私信我，获取一对一诊断"
    ]
  },
  branding: {
    name: "个人品牌",
    description: "建立专业形象，扩大影响力",
    ctaType: "关注连接",
    ctaExamples: [
      "关注我，持续分享干货",
      "点赞转发，让更多人看到",
      "评论区留言，告诉我你的困惑"
    ]
  },
  trust: {
    name: "建立信任",
    description: "通过故事建立信任感，为后续转化铺路",
    ctaType: "轻度互动",
    ctaExamples: [
      "如果你有类似经历，点个赞",
      "转发给需要的朋友",
      "在评论区告诉我你的想法"
    ]
  },
  launch: {
    name: "新品发售",
    description: "新产品/课程上线，制造热度",
    ctaType: "发售预热",
    ctaExamples: [
      "首发特惠，仅限前50名",
      "预约报名，锁定早鸟价",
      "限时开放，满员即止"
    ]
  }
};

// ============================================================================
// 读者类型（人群画像）
// ============================================================================

const AUDIENCE_TYPES = {
  career_anxious: {
    name: "职场焦虑人群",
    painPoints: [
      "深夜加班，看不到希望",
      "同龄人都在往前走，自己却停下了",
      "担心35岁后的职业危机",
      "工作很努力，却感觉哪里不对"
    ],
    desires: [
      "找到新的职业方向",
      "摆脱加班内卷",
      "获得稳定的高收入",
      "实现工作生活平衡"
    ],
    emotionalTriggers: ["安全感缺失", "年龄焦虑", "迷茫无助", "不甘平庸"],
    tone: "理解、共情、有力量"
  },

  entrepreneur: {
    name: "创业者/小微企业主",
    painPoints: [
      "看不懂财务报表",
      "不知道生意到底赚不赚钱",
      "现金流紧张，睡不着觉",
      "财务团队说的完全听不懂"
    ],
    desires: [
      "真正看懂自己的生意",
      "做出明智的商业决策",
      "现金流充裕",
      "把财务变成工具而非负担"
    ],
    emotionalTriggers: ["掌控感缺失", "决策焦虑", "孤独感", "压力巨大"],
    tone: "专业、精炼、可行动"
  },

  parent: {
    name: "焦虑家长",
    painPoints: [
      "孩子厌学/叛逆",
      "深夜吼娃后自责",
      "不知道怎么教育才对",
      "看到孩子问题就焦虑"
    ],
    desires: [
      "修复亲子关系",
      "找到正确的教育方法",
      "孩子快乐成长",
      "成为更好的父母"
    ],
    emotionalTriggers: ["愧疚感", "无力感", "焦虑", "害怕遗憾"],
    tone: "理解家长、真诚、有温度"
  },

  professional_transition: {
    name: "转型期专业人士",
    painPoints: [
      "在原行业遇到瓶颈",
      "想转型却不知道从哪开始",
      "担心转型后收入下降",
      "年龄大了不敢冒险"
    ],
    desires: [
      "成功转型到新领域",
      "保持或提升收入水平",
      "找到新的职业激情",
      "证明自己还能创造价值"
    ],
    emotionalTriggers: ["自我怀疑", "恐惧失败", "时间紧迫", "价值焦虑"],
    tone: "鼓励、务实、有共鸣"
  },

  young_professional: {
    name: "年轻职场人",
    painPoints: [
      "入行不久，很迷茫",
      "不知道自己适合什么",
      "看到别人的成功很焦虑",
      "想快速成长却找不到方向"
    ],
    desires: [
      "快速找到职业方向",
      "获得前辈的指导",
      "少走弯路",
      "实现职场跃迁"
    ],
    emotionalTriggers: ["迷茫", "焦虑", "渴望成长", "害怕落后"],
    tone: "真诚、启发、有温度"
  }
};

// ============================================================================
// 行业场景
// ============================================================================

const INDUSTRY_SCENES = {
  finance: {
    name: "财务/会计",
    crisisScenes: [
      "深夜加班审底稿，孩子哭喊着不让走",
      "看着复杂的报表，老板却听不懂我在说什么",
      "同事都在转型，自己还在做重复性工作",
      "35岁了，还在担心被AI替代"
    ],
    oldBelief: "只要专业够强，工作就稳定",
    newBelief: "真正的铁饭碗是随时能重构生活的能力",
    salvation: "把财务能力转化为商业洞察力"
  },
  education: {
    name: "教育/培训",
    crisisScenes: [
      "深夜吼完孩子，看着她关上的房门，心如刀绞",
      "家长群里别人晒成绩，自己只能沉默",
      "孩子说'我讨厌学习'，不知道该怎么回应",
      "试过各种方法，孩子的问题越来越严重"
    ],
    oldBelief: "逼得越紧，孩子学得越好",
    newBelief: "孩子的动力来自内在，而非外在压力",
    salvation: "用正确的方法唤醒孩子的内在动力"
  },
  tech: {
    name: "互联网/技术",
    crisisScenes: [
      "996成了常态，身体开始报警",
      "35岁的门槛越来越近",
      "新技术层出不穷，永远学不完",
      "看着比自己年轻的领导，心里发慌"
    ],
    oldBelief: "技术好就有一切",
    newBelief: "技术是工具，商业价值才是目标",
    salvation: "从技术专家转型为商业问题解决者"
  },
  sales: {
    name: "销售/业务",
    crisisScenes: [
      "月底业绩不达标，开会时不敢抬头",
      "客户越来越难谈，成单率越来越低",
      "朋友圈刷屏被屏蔽，不知道该怎么推广",
      "同事业绩翻倍，自己却在原地"
    ],
    oldBelief: "只要够勤奋，业绩自然来",
    newBelief: "销售的核心是价值传递，而非硬推销",
    salvation: "学会讲故事，让销售变得自然"
  },
  general: {
    name: "通用/其他",
    crisisScenes: [
      "工作很多年，却不知道自己到底想要什么",
      "看到同龄人成功，自己还在原地",
      "想改变却不知道从哪里开始",
      "感觉人生被困住了，找不到出口"
    ],
    oldBelief: "只要按部就班，一切都会好起来",
    newBelief: "人生需要主动设计，而非被动等待",
    salvation: "找到自己的核心优势，重新定位人生"
  }
};

// ============================================================================
// 反认知理念库
// ============================================================================

const ANTI_COGNITIVE_CONCEPTS = {
  career: [
    "真正的稳定不是有一份稳定的工作，而是有随时找到工作的能力",
    "35岁不是危机的开始，而是价值重新定义的起点",
    "职业转型的本质不是换赛道，而是价值重构",
    "你的安全感不应该来自公司，而应该来自你的能力"
  ],
  business: [
    "财务报表不是给税务局看的，而是给你自己做决策的",
    "数字不会说谎，但数字需要翻译",
    "你的财务团队可以帮你做账，但只有你能做决策",
    "看懂财务不是为了当会计，而是为了看懂生意"
  ],
  education: [
    "逼出来的不是成绩，而是距离",
    "孩子的问题不是问题，而是成长的信号",
    "教育不是为了让孩子成为你想要的样子，而是帮他成为他自己",
    "亲子关系好了，教育才真正开始"
  ],
  life: [
    "人生最大的风险不是冒险，而是按部就班",
    "你所谓的稳定，可能是温水煮青蛙",
    "焦虑不是因为做得不够好，而是因为做得不够对",
    "人生不必等到准备好才开始，先开始再完善"
  ]
};

// ============================================================================
// 模板生成器
// ============================================================================

class ConversionStoryGenerator {
  constructor(purpose, audience, industry) {
    this.purpose = PURPOSE_TYPES[purpose] || PURPOSE_TYPES.sales;
    this.audience = AUDIENCE_TYPES[audience] || AUDIENCE_TYPES.career_anxious;
    this.industry = INDUSTRY_SCENES[industry] || INDUSTRY_SCENES.general;
  }

  generatePrompt() {
    let prompt = `# 成交型叙事写作指南\n\n`;
    prompt += `--- 配置信息 ---\n\n`;
    prompt += `**文章目的**: ${this.purpose.name} - ${this.purpose.description}\n`;
    prompt += `**目标读者**: ${this.audience.name}\n`;
    prompt += `**行业场景**: ${this.industry.name}\n\n`;
    prompt += `--- 写作框架 ---\n\n`;

    prompt += CONVERSION_FRAMEWORK;

    prompt += `\n--- 读者画像分析 ---\n\n`;

    prompt += `## 目标读者的痛点\n\n`;
    this.audience.painPoints.forEach((point, i) => {
      prompt += `${i + 1}. ${point}\n`;
    });

    prompt += `\n## 目标读者的渴望\n\n`;
    this.audience.desires.forEach((desire, i) => {
      prompt += `${i + 1}. ${desire}\n`;
    });

    prompt += `\n## 情绪触发点\n\n`;
    this.audience.emotionalTriggers.forEach(trigger => {
      prompt += `- **${trigger}**: 如何在故事中激发这种情绪\n`;
    });

    prompt += `\n## 建议语调\n\n`;
    prompt += `${this.audience.tone}\n\n`;

    prompt += `--- 行业场景素材 ---\n\n`;

    prompt += `## 危机场景参考\n\n`;
    this.industry.crisisScenes.forEach((scene, i) => {
      prompt += `${i + 1}. ${scene}\n`;
    });

    prompt += `\n## 认知反转设计\n\n`;
    prompt += `- **旧认知**（读者的错误观念）: ${this.industry.oldBelief}\n`;
    prompt += `- **新认知**（你要传递的理念）: ${this.industry.newBelief}\n`;
    prompt += `- **救赎方式**: ${this.industry.salvation}\n\n`;

    prompt += `--- 行动呼吁设计 ---\n\n`;

    prompt += `## CTA类型\n\n`;
    prompt += `${this.purpose.ctaType}\n\n`;

    prompt += `## CTA参考句式\n\n`;
    this.purpose.ctaExamples.forEach((cta, i) => {
      prompt += `${i + 1}. ${cta}\n`;
    });

    prompt += `\n--- 填空式模板 ---\n\n`;

    prompt += this.generateFillInTheBlankTemplate();

    prompt += `\n--- 写作注意事项 ---\n\n`;

    prompt += this.generateWritingTips();

    return prompt;
  }

  generateFillInTheBlankTemplate() {
    let template = `## 5步法填空模板\n\n`;

    template += `### 第一步：痛点共鸣（制造反差）\n\n`;
    template += `曾经，我是（你的身份/状态），以为（旧认知）。\n\n`;
    template += `那时候（描述光鲜/常态的状态）。\n\n`;
    template += `直到那天（具体危机事件）发生，那一刻我才意识到（认知被打破）。\n\n`;

    template += `### 第二步：细节描写（激发情绪）\n\n`;
    template += `那段时间，我每天（描述痛苦的日常）。\n\n`;
    template += `尤其是（最扎心的具体场景），让我觉得（情绪感受）。\n\n`;
    template += `（调用感官：看到什么、听到什么、身体有什么反应）\n\n`;

    template += `### 第三步：权威转折（打破认知）\n\n`;
    template += `我开始反思，难道就要这样（继续痛苦的状态）吗？\n\n`;
    template += `后来我明白了，其实（旧认知）是假象，真正的出路藏在（新认知）里。\n\n`;
    template += `（关键句：${this.industry.newBelief}）\n\n`;

    if (this.purpose.name !== "建立信任") {
      template += `### 第三步半：爽点/High点（可选）\n\n`;
      template += `现在的我，不仅（改变后的状态），还（具体成就/证明）。\n\n`;
    }

    template += `### 第四步：产品救赎（提供出口）\n\n`;
    template += `这一切源于我掌握了（${this.industry.salvation}）。\n\n`;
    template += `无论你是想（读者渴望1），还是渴望（读者渴望2），这套方法都是为你打造的。\n\n`;

    template += `### 第五步：紧迫行动（关闭理性）\n\n`;
    template += `如果你也像当年的我一样（圈定用户特征），不要犹豫。\n\n`;
    template += `（你的产品/课程）能帮你（具体价值）。\n\n`;
    template += `${this.purpose.ctaExamples[0]}\n\n`;

    return template;
  }

  generateWritingTips() {
    let tips = `## 核心原则\n\n`;
    tips += `1. **不是感怀散文，而是成交文案** — 每一段都要为最终的转化服务\n`;
    tips += `2. **只截取"危机前后"那一段最痛的经历** — 不要写流水账，不要从出生写到现在\n`;
    tips += `3. **激发杏仁核情绪反应** — 用画面感让读者产生生理反应\n`;
    tips += `4. **真诚是必杀技** — 用真实的"无力感"和"羞愧感"打动读者\n`;
    tips += `5. **口语化写作** — 像跟闺蜜/老同学聊天，不要文绉绉\n\n`;

    tips += `## 禁止事项\n\n`;
    tips += `- ❌ 写成流水账（从出生到现在）\n`;
    tips += `- ❌ 全是干货讲道理（在第三步开始讲理论）\n`;
    tips += `- ❌ 书面化语言（要用口语，用"我"而不是"笔者"）\n`;
    tips += `- ❌ 没有真实感情（感情必须是真的，否则读者能感觉到）\n`;
    tips += `- ❌ 没有具体场景（必须用画面感，不能只说"我很焦虑"）\n\n`;

    tips += `## 字数分配建议\n\n`;
    tips += `- 痛点共鸣: 15-20%\n`;
    tips += `- 细节描写: 25-30%\n`;
    tips += `- 权威转折: 20-25%\n`;
    tips += `- 产品救赎: 15-20%\n`;
    tips += `- 紧迫行动: 10%\n\n`;

    tips += `## 检查清单\n\n`;
    tips += `- [ ] 有具体的危机场景（时间、地点、感官细节）\n`;
    tips += `- [ ] 有情绪的身体反应（心跳、呼吸、手抖等）\n`;
    tips += `- [ ] 有明确的认知反转（旧认知 vs 新认知）\n`;
    tips += `- [ ] 有具体的产品/服务作为救赎方案\n`;
    tips += `- [ ] 有明确的行动呼吁（CTA）\n`;
    tips += `- [ ] 全文口语化，像聊天一样\n`;
    tips += `- [ ] 感情真实，不虚构痛苦\n`;

    return tips;
  }
}

// ============================================================================
// 命令行接口
// ============================================================================

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    action: args[0] || 'help',
    purpose: args.find((a, i) => a === '--purpose' && args[i + 1]) ?
      args[args.indexOf('--purpose') + 1] : 'sales',
    audience: args.find((a, i) => a === '--audience' && args[i + 1]) ?
      args[args.indexOf('--audience') + 1] : 'career_anxious',
    industry: args.find((a, i) => a === '--industry' && args[i + 1]) ?
      args[args.indexOf('--industry') + 1] : 'general'
  };
}

function showHelp() {
  console.log(`
成交型叙事生成器

根据文章目的、读者类型、行业场景，生成定制化的成交型故事写作指南

用法:
  node conversion-story-generator.js generate [options]

选项:
  --purpose TYPE      文章目的 (默认: sales)
  --audience TYPE     目标读者 (默认: career_anxious)
  --industry TYPE     行业场景 (默认: general)

文章目的 (purpose):
  sales               直接销售 - 推广课程/产品，促成购买
  lead                获取线索 - 获取潜在客户，建立私域
  branding            个人品牌 - 建立专业形象，扩大影响力
  trust               建立信任 - 建立信任感，为转化铺路
  launch              新品发售 - 新产品上线，制造热度

目标读者 (audience):
  career_anxious      职场焦虑人群 - 深夜加班、职业危机
  entrepreneur        创业者/小微企业主 - 看不懂财务、决策焦虑
  parent              焦虑家长 - 孩子厌学、教育困惑
  professional_transition 转型期专业人士 - 想转型不知从哪开始
  young_professional  年轻职场人 - 迷茫、想快速成长

行业场景 (industry):
  finance             财务/会计
  education           教育/培训
  tech                互联网/技术
  sales               销售/业务
  general             通用/其他

示例:
  # 财务人的直接销售文案
  node conversion-story-generator.js generate --purpose sales --audience entrepreneur --industry finance

  # 教育类获客文案
  node conversion-story-generator.js generate --purpose lead --audience parent --industry education

  # 职场转型个人品牌文章
  node conversion-story-generator.js generate --purpose branding --audience professional_transition --industry finance
`);
}

function listOptions() {
  console.log(`
=== 可用选项 ===

## 文章目的 (--purpose)
`);
  Object.entries(PURPOSE_TYPES).forEach(([key, val]) => {
    console.log(`  ${key.padEnd(25)} ${val.name} - ${val.description}`);
  });

  console.log(`

## 目标读者 (--audience)
`);
  Object.entries(AUDIENCE_TYPES).forEach(([key, val]) => {
    console.log(`  ${key.padEnd(25)} ${val.name}`);
  });

  console.log(`

## 行业场景 (--industry)
`);
  Object.entries(INDUSTRY_SCENES).forEach(([key, val]) => {
    console.log(`  ${key.padEnd(25)} ${val.name}`);
  });
}

function main() {
  const options = parseArgs();

  switch (options.action) {
    case 'generate':
      const generator = new ConversionStoryGenerator(
        options.purpose,
        options.audience,
        options.industry
      );
      console.log(generator.generatePrompt());
      break;

    case 'list':
      listOptions();
      break;

    case 'help':
    default:
      showHelp();
  }
}

main();
