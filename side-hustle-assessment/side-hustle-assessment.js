#!/usr/bin/env node

/**
 * 副业适合度测评工具
 *
 * 通过结构化测评，帮助用户判断自己是否适合做副业，
 * 以及适合什么类型的副业，并生成个性化报告和行动建议。
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// 副业类型库
// ============================================================================

const SIDE_HUSTLE_TYPES = {
  skill_based: {
    name: "技能型副业",
    description: "利用专业技能提供服务",
    examples: [
      { name: "UI/UX设计", entry: "低", potential: "中高", time: "灵活" },
      { name: "编程/开发", entry: "中", potential: "高", time: "项目制" },
      { name: "文案写作", entry: "低", potential: "中", time: "灵活" },
      { name: "视频剪辑", entry: "低", potential: "中", time: "灵活" },
      { name: "翻译/本地化", entry: "低", potential: "中", time: "灵活" },
      { name: "咨询服务", entry: "低", potential: "高", time: "灵活" }
    ],
    requiredTraits: ["专业技能", "自律性", "时间管理"]
  },

  resource_based: {
    name: "资源型副业",
    description: "利用现有资源变现",
    examples: [
      { name: "电商/代购", entry: "低", potential: "中高", time: "每天2-4小时" },
      { name: "房屋出租", entry: "低", potential: "中", time: "一次性投入" },
      { name: "二手交易", entry: "低", potential: "低", time: "灵活" },
      { name: "资源中介", entry: "低", potential: "高", time: "灵活" },
      { name: "联盟营销", entry: "低", potential: "中", time: "前期投入大" }
    ],
    requiredTraits: ["资源储备", "商业敏感度", "沟通能力"]
  },

  content_based: {
    name: "内容型副业",
    description: "通过内容创作获取收益",
    examples: [
      { name: "自媒体博主", entry: "低", potential: "中高", time: "持续投入" },
      { name: "短视频创作", entry: "低", potential: "高", time: "高频更新" },
      { name: "播客/音频", entry: "低", potential: "中", time: "每周固定" },
      { name: "知识付费", entry: "中", potential: "高", time: "前期大" },
      { name: "直播", entry: "低", potential: "高", time: "固定时段" }
    ],
    requiredTraits: ["创意能力", "持续输出", "网感"]
  },

  time_based: {
    name: "时间型副业",
    description: "用时间换取收入",
    examples: [
      { name: "网约车/代驾", entry: "低", potential: "低", time: "灵活" },
      { name: "外卖配送", entry: "低", potential: "低", time: "灵活" },
      { name: "线上客服", entry: "低", potential: "低", time: "固定时段" },
      { name: "数据标注", entry: "低", potential: "低", time: "灵活" }
    ],
    requiredTraits: ["时间充裕", "执行力", "耐心"]
  },

  interest_based: {
    name: "兴趣型副业",
    description: "将兴趣爱好转化为收入",
    examples: [
      { name: "摄影/摄像", entry: "中", potential: "中", time: "周末为主" },
      { name: "手工/手作", entry: "低", potential: "中", time: "灵活" },
      { name: "烘焙/私厨", entry: "低", potential: "中", time: "周末" },
      { name: "宠物服务", entry: "低", potential: "中", time: "灵活" },
      { name: "健身/瑜伽教练", entry: "中", potential: "中", time: "早晚" }
    ],
    requiredTraits: ["兴趣热情", "专业技能", "服务意识"]
  },

  investment_based: {
    name: "投资型副业",
    description: "通过投资获取被动收入",
    examples: [
      { name: "股票/基金投资", entry: "中", potential: "中高", time: "研究为主" },
      { name: "理财产品", entry: "低", potential: "低", time: "一次性投入" },
      { name: "加密货币", entry: "中", potential: "高", time: "持续关注" },
      { name: "房产投资", entry: "高", potential: "中", time: "前期大" }
    ],
    requiredTraits: ["资金储备", "风险承受", "理财知识"]
  }
};

// ============================================================================
// 快速测评问题库（30问 - 基于创业心理学研究扩充）
// ============================================================================

const QUICK_ASSESSMENT_QUESTIONS = [
  // ==================== 资源基础维度 (6题) ====================
  {
    id: "q1",
    dimension: "resources",
    text: "你每周能投入多少时间到副业中？",
    options: [
      { value: 0, score: 0, text: "几乎没有空闲时间" },
      { value: 1, score: 3, text: "每周3-5小时" },
      { value: 2, score: 5, text: "每周5-10小时" },
      { value: 3, score: 7, text: "每周10-15小时" },
      { value: 4, score: 10, text: "每周15小时以上" }
    ]
  },
  {
    id: "q2",
    dimension: "resources",
    text: "你有哪些可以变现的技能？（多选）",
    type: "multi",
    options: [
      { value: "design", text: "设计相关（平面、UI/UX等）" },
      { value: "tech", text: "技术相关（编程、数据分析等）" },
      { value: "writing", text: "内容相关（写作、翻译等）" },
      { value: "media", text: "媒体相关（视频、音频、摄影等）" },
      { value: "teaching", text: "教学相关（培训、咨询等）" },
      { value: "sales", text: "销售相关（推广、营销等）" },
      { value: "service", text: "服务相关（客服、行政等）" },
      { value: "manual", text: "手工技能（烘焙、手作等）" },
      { value: "none", text: "暂时没有明显技能" }
    ]
  },
  {
    id: "q3",
    dimension: "resources",
    text: "你是否有可投入副业的启动资金？",
    options: [
      { value: 0, score: 2, text: "没有启动资金" },
      { value: 1, score: 5, text: "有少量资金（1000-5000元）" },
      { value: 2, score: 8, text: "有一定资金（5000-2万元）" },
      { value: 3, score: 10, text: "资金充足（2万元以上）" }
    ]
  },
  {
    id: "q4",
    dimension: "resources",
    text: "你的工作状态是否允许你开展副业？",
    options: [
      { value: 0, score: 2, text: "工作非常忙，经常加班到很晚" },
      { value: 1, score: 4, text: "工作较忙，但周末有时间" },
      { value: 2, score: 7, text: "工作正常，下班后有时间" },
      { value: 3, score: 10, text: "工作轻松，时间灵活" }
    ]
  },
  {
    id: "q5",
    dimension: "resources",
    text: "你是否有可利用的人脉资源？",
    options: [
      { value: 0, score: 2, text: "基本没有" },
      { value: 1, score: 5, text: "有少量人脉" },
      { value: 2, score: 8, text: "人脉较广" },
      { value: 3, score: 10, text: "人脉资源丰富" }
    ]
  },
  {
    id: "q6",
    dimension: "resources",
    text: "你的家庭状况是否支持你做副业？",
    options: [
      { value: 0, score: 2, text: "家庭负担重，很难抽出时间" },
      { value: 1, score: 5, text: "有一定家庭责任，需要平衡" },
      { value: 2, score: 8, text: "家人支持，可以投入时间" },
      { value: 3, score: 10, text: "家人非常支持，能分担家务" }
    ]
  },

  // ==================== 心理素质维度 (8题) ====================
  {
    id: "q7",
    dimension: "mindset",
    text: "如果副业前3个月没有收入，你能坚持吗？",
    options: [
      { value: 0, score: 0, text: "不能，需要尽快见到回报" },
      { value: 1, score: 4, text: "可以坚持1个月" },
      { value: 2, score: 7, text: "可以坚持3个月" },
      { value: 3, score: 10, text: "可以坚持6个月以上" }
    ]
  },
  {
    id: "q8",
    dimension: "mindset",
    text: "你的自我管理能力如何？",
    options: [
      { value: 0, score: 3, text: "较差，需要外部监督" },
      { value: 1, score: 6, text: "一般，有时会拖延" },
      { value: 2, score: 8, text: "较好，基本能按计划执行" },
      { value: 3, score: 10, text: "很强，高度自律" }
    ]
  },
  {
    id: "q9",
    dimension: "mindset",
    text: "你对失败的承受能力如何？",
    options: [
      { value: 0, score: 2, text: "很难接受失败" },
      { value: 1, score: 5, text: "可以接受小的失败" },
      { value: 2, score: 8, text: "把失败当作学习机会" },
      { value: 3, score: 10, text: "敢于试错，快速迭代" }
    ]
  },
  {
    id: "q10",
    dimension: "mindset",
    text: "你是否喜欢接受挑战？",
    options: [
      { value: 0, score: 2, text: "不喜欢，更喜欢稳定" },
      { value: 1, score: 5, text: "可以接受适度挑战" },
      { value: 2, score: 8, text: "享受挑战" },
      { value: 3, score: 10, text: "主动寻求挑战" }
    ]
  },
  {
    id: "q11",
    dimension: "mindset",
    text: "你是否有明确的长期目标？",
    options: [
      { value: 0, score: 2, text: "没有明确目标" },
      { value: 1, score: 5, text: "有模糊想法" },
      { value: 2, score: 8, text: "有清晰目标" },
      { value: 3, score: 10, text: "有详细的长期规划" }
    ]
  },
  {
    id: "q12",
    dimension: "mindset",
    text: "你是否愿意持续学习新技能？",
    options: [
      { value: 0, score: 2, text: "不太愿意" },
      { value: 1, score: 5, text: "有需要会学" },
      { value: 2, score: 8, text: "喜欢学习新东西" },
      { value: 3, score: 10, text: "主动学习，持续提升" }
    ]
  },
  {
    id: "q13",
    dimension: "mindset",
    text: "你在压力下的表现如何？",
    options: [
      { value: 0, score: 2, text: "容易焦虑，效率下降" },
      { value: 1, score: 5, text: "有一定压力，但能应对" },
      { value: 2, score: 8, text: "压力下表现更好" },
      { value: 3, score: 10, text: "在压力下发挥出色" }
    ]
  },
  {
    id: "q14",
    dimension: "mindset",
    text: '你是否有"我能做到"的信念？（自我效能感）',
    options: [
      { value: 0, score: 2, text: "经常怀疑自己的能力" },
      { value: 1, score: 5, text: "有时会怀疑" },
      { value: 2, score: 8, text: "基本相信自己能做好" },
      { value: 3, score: 10, text: "坚信自己能克服困难" }
    ]
  },

  // ==================== 动机维度 (5题) ====================
  {
    id: "q15",
    dimension: "motivation",
    text: "你做副业的主要动机是什么？",
    options: [
      { value: 0, score: 5, text: "增加收入，改善生活" },
      { value: 1, score: 7, text: "发展兴趣，实现自我价值" },
      { value: 2, score: 9, text: "为未来转型做准备" },
      { value: 3, score: 10, text: "以上都是，目标明确" }
    ]
  },
  {
    id: "q16",
    dimension: "motivation",
    text: "你愿意牺牲多少休闲时间来做副业？",
    options: [
      { value: 0, score: 3, text: "尽量不影响现有生活" },
      { value: 1, score: 6, text: "可以牺牲部分周末时间" },
      { value: 2, score: 8, text: "可以牺牲大部分周末" },
      { value: 3, score: 10, text: "愿意大幅减少娱乐时间" }
    ]
  },
  {
    id: "q17",
    dimension: "motivation",
    text: "你对副业收入的期望是？",
    options: [
      { value: 0, score: 3, text: "不在乎多少，主要是体验" },
      { value: 1, score: 6, text: "补充收入（月入500-2000元）" },
      { value: 2, score: 8, text: "重要收入（月入2000-5000元）" },
      { value: 3, score: 10, text: "期望较高（月入5000元以上）" }
    ]
  },
  {
    id: "q18",
    dimension: "motivation",
    text: "你做副业的紧迫程度如何？",
    options: [
      { value: 0, score: 4, text: "不着急，慢慢来" },
      { value: 1, score: 7, text: "希望半年内见到成效" },
      { value: 2, score: 9, text: "希望3个月内见到成效" },
      { value: 3, score: 10, text: "比较紧迫，需要尽快" }
    ]
  },
  {
    id: "q19",
    dimension: "motivation",
    text: "你是否有强烈的成就欲望？",
    options: [
      { value: 0, score: 2, text: "满足于现状" },
      { value: 1, score: 5, text: "有一定成就追求" },
      { value: 2, score: 8, text: "追求卓越" },
      { value: 3, score: 10, text: "非常渴望成就" }
    ]
  },

  // ==================== 匹配度维度 (5题) ====================
  {
    id: "q20",
    dimension: "fit",
    text: "你是否有明确的副业方向？",
    options: [
      { value: 0, score: 2, text: "完全没有想法" },
      { value: 1, score: 5, text: "有模糊想法，不确定" },
      { value: 2, score: 8, text: "有1-2个方向，需要验证" },
      { value: 3, score: 10, text: "有明确方向，已有计划" }
    ]
  },
  {
    id: "q21",
    dimension: "fit",
    text: "你的副业想法是否与主业相关？",
    options: [
      { value: 0, score: 3, text: "完全不相关" },
      { value: 1, score: 6, text: "有一定关联" },
      { value: 2, score: 8, text: "高度相关" },
      { value: 3, score: 10, text: "可以相互促进" }
    ]
  },
  {
    id: "q22",
    dimension: "fit",
    text: "你的副业想法是否符合你的兴趣？",
    options: [
      { value: 0, score: 3, text: "不太感兴趣" },
      { value: 1, score: 6, text: "一般感兴趣" },
      { value: 2, score: 8, text: "比较感兴趣" },
      { value: 3, score: 10, text: "非常感兴趣" }
    ]
  },
  {
    id: "q23",
    dimension: "fit",
    text: "你对目标市场了解多少？",
    options: [
      { value: 0, score: 2, text: "基本不了解" },
      { value: 1, score: 5, text: "有一些了解" },
      { value: 2, score: 8, text: "做过初步研究" },
      { value: 3, score: 10, text: "深入调研过市场" }
    ]
  },
  {
    id: "q24",
    dimension: "fit",
    text: "你是否有独特的竞争优势？",
    options: [
      { value: 0, score: 2, text: "没有特别优势" },
      { value: 1, score: 5, text: "有一些优势" },
      { value: 2, score: 8, text: "有明显优势" },
      { value: 3, score: 10, text: "有独特竞争优势" }
    ]
  },

  // ==================== 执行力维度 (6题) ====================
  {
    id: "q25",
    dimension: "execution",
    text: "如果现在开始，你这周能做的第一件事是什么？",
    options: [
      { value: 0, score: 2, text: "还不清楚，需要先研究" },
      { value: 1, score: 5, text: "注册相关平台账号" },
      { value: 2, score: 8, text: "完成第一个小作品/产品" },
      { value: 3, score: 10, text: "已经有客户/订单" }
    ]
  },
  {
    id: "q26",
    dimension: "execution",
    text: "你是否善于制定计划并执行？",
    options: [
      { value: 0, score: 2, text: "不太擅长" },
      { value: 1, score: 5, text: "一般" },
      { value: 2, score: 8, text: "比较擅长" },
      { value: 3, score: 10, text: "非常擅长" }
    ]
  },
  {
    id: "q27",
    dimension: "execution",
    text: "你过去是否有完成长期项目的经验？",
    options: [
      { value: 0, score: 2, text: "没有" },
      { value: 1, score: 5, text: "有1-2个" },
      { value: 2, score: 8, text: "有多个" },
      { value: 3, score: 10, text: "有很多成功案例" }
    ]
  },
  {
    id: "q28",
    dimension: "execution",
    text: "你是否善于解决问题？",
    options: [
      { value: 0, score: 2, text: "容易卡住" },
      { value: 1, score: 5, text: "能解决一些问题" },
      { value: 2, score: 8, text: "善于解决问题" },
      { value: 3, score: 10, text: "非常擅长解决问题" }
    ]
  },
  {
    id: "q29",
    dimension: "execution",
    text: "你是否有快速试错的经验？",
    options: [
      { value: 0, score: 2, text: "没有经验" },
      { value: 1, score: 5, text: "有一些经验" },
      { value: 2, score: 8, text: "经验丰富" },
      { value: 3, score: 10, text: "非常擅长快速试错" }
    ]
  },
  {
    id: "q30",
    dimension: "execution",
    text: "你是否有持续的执行力？",
    options: [
      { value: 0, score: 2, text: "容易三分钟热度" },
      { value: 1, score: 5, text: "能坚持一段时间" },
      { value: 2, score: 8, text: "基本能持续执行" },
      { value: 3, score: 10, text: "非常能坚持" }
    ]
  }
];

// ============================================================================
// 完整测评问题库（6大维度 x 8题 = 48题）
// 基于创业心理学、Big Five人格特质、EntreComp框架设计
// ============================================================================

const FULL_ASSESSMENT_QUESTIONS = {
  // ==================== 维度1：资源基础 (8题) ====================
  resources: {
    name: "资源基础",
    description: "评估你做副业可用的资源条件",
    weight: 0.2,
    questions: [
      {
        id: "r1",
        text: "你目前的工作状态是？",
        options: [
          { value: 0, score: 2, text: "工作非常忙，经常加班" },
          { value: 1, score: 5, text: "工作正常，有时忙" },
          { value: 2, score: 8, text: "工作较轻松，有规律" },
          { value: 3, score: 10, text: "工作非常灵活" }
        ]
      },
      {
        id: "r2",
        text: "你每天下班后有多少可用时间？",
        options: [
          { value: 0, score: 0, text: "几乎没有" },
          { value: 1, score: 4, text: "0.5-1小时" },
          { value: 2, score: 7, text: "1-2小时" },
          { value: 3, score: 10, text: "2小时以上" }
        ]
      },
      {
        id: "r3",
        text: "你周末能投入多少时间？",
        options: [
          { value: 0, score: 2, text: "几乎没时间" },
          { value: 1, score: 5, text: "半天" },
          { value: 2, score: 8, text: "一天" },
          { value: 3, score: 10, text: "两天都可以" }
        ]
      },
      {
        id: "r4",
        text: "你的专业技能水平如何？",
        options: [
          { value: 0, score: 3, text: "入门水平" },
          { value: 1, score: 6, text: "有一定基础" },
          { value: 2, score: 8, text: "较为熟练" },
          { value: 3, score: 10, text: "专家水平" }
        ]
      },
      {
        id: "r5",
        text: "你是否有行业人脉资源可以利用？",
        options: [
          { value: 0, score: 2, text: "基本没有" },
          { value: 1, score: 5, text: "有一些，但不多" },
          { value: 2, score: 8, text: "比较丰富" },
          { value: 3, score: 10, text: "非常丰富" }
        ]
      },
      {
        id: "r6",
        text: "你的家庭状况是否支持你做副业？",
        options: [
          { value: 0, score: 2, text: "家庭负担重，很难抽出时间" },
          { value: 1, score: 5, text: "有一定家庭责任，需要平衡" },
          { value: 2, score: 8, text: "家人支持，可以投入时间" },
          { value: 3, score: 10, text: "家人非常支持，能分担家务" }
        ]
      },
      {
        id: "r7",
        text: "你是否有可投入的启动资金？",
        options: [
          { value: 0, score: 2, text: "没有启动资金" },
          { value: 1, score: 5, text: "有少量资金（1000-5000元）" },
          { value: 2, score: 8, text: "有一定资金（5000-2万元）" },
          { value: 3, score: 10, text: "资金充足（2万元以上）" }
        ]
      },
      {
        id: "r8",
        text: "你是否有可用的工具/设备/场地？",
        options: [
          { value: 0, score: 2, text: "基本没有" },
          { value: 1, score: 5, text: "有一些基础设备" },
          { value: 2, score: 8, text: "设备较齐全" },
          { value: 3, score: 10, text: "设备齐全，场地充足" }
        ]
      }
    ]
  },

  // ==================== 维度2：创业人格 (8题 - 基于Big Five) ====================
  personality: {
    name: "创业人格",
    description: "评估你的创业人格特质（基于Big Five研究）",
    weight: 0.2,
    questions: [
      {
        id: "p1",
        text: "你喜欢尝试新事物吗？（开放性 Openness）",
        options: [
          { value: 0, score: 2, text: "不喜欢，习惯传统方式" },
          { value: 1, score: 5, text: "有时会尝试" },
          { value: 2, score: 8, text: "喜欢新鲜事物" },
          { value: 3, score: 10, text: "非常喜欢探索新事物" }
        ]
      },
      {
        id: "p2",
        text: "你做事是否有计划性？（尽责性 Conscientiousness）",
        options: [
          { value: 0, score: 2, text: "比较随性" },
          { value: 1, score: 5, text: "有时会计划" },
          { value: 2, score: 8, text: "通常会做计划" },
          { value: 3, score: 10, text: "非常注重计划" }
        ]
      },
      {
        id: "p3",
        text: "你是否外向、善于社交？（外向性 Extraversion）",
        options: [
          { value: 0, score: 3, text: "比较内向" },
          { value: 1, score: 6, text: "中性" },
          { value: 2, score: 8, text: "比较外向" },
          { value: 3, score: 10, text: "非常外向，善于社交" }
        ]
      },
      {
        id: "p4",
        text: "你情绪是否稳定？（神经质 Neuroticism反向）",
        options: [
          { value: 0, score: 2, text: "容易情绪波动" },
          { value: 1, score: 5, text: "有时会焦虑" },
          { value: 2, score: 8, text: "情绪比较稳定" },
          { value: 3, score: 10, text: "非常稳定" }
        ]
      },
      {
        id: "p5",
        text: "你是否乐于助人？（宜人性 Agreeableness）",
        options: [
          { value: 0, score: 2, text: "不太关心他人" },
          { value: 1, score: 5, text: "有时会帮助" },
          { value: 2, score: 8, text: "比较乐于助人" },
          { value: 3, score: 10, text: "非常乐于助人" }
        ]
      },
      {
        id: "p6",
        text: "你是否有创新思维？",
        options: [
          { value: 0, score: 2, text: "创新思维较弱" },
          { value: 1, score: 5, text: "有一定创新思维" },
          { value: 2, score: 8, text: "创新思维较强" },
          { value: 3, score: 10, text: "非常有创意" }
        ]
      },
      {
        id: "p7",
        text: "你是否有冒险精神？",
        options: [
          { value: 0, score: 2, text: "不喜欢冒险" },
          { value: 1, score: 5, text: "可以接受小风险" },
          { value: 2, score: 8, text: "愿意承担适度风险" },
          { value: 3, score: 10, text: "敢于冒险" }
        ]
      },
      {
        id: "p8",
        text: "你是否有领导力？",
        options: [
          { value: 0, score: 2, text: "缺乏领导力" },
          { value: 1, score: 5, text: "有一定领导力" },
          { value: 2, score: 8, text: "领导力较强" },
          { value: 3, score: 10, text: "非常有领导力" }
        ]
      }
    ]
  },

  // ==================== 维度3：心理素质 (8题) ====================
  mindset: {
    name: "心理素质",
    description: "评估你的心理素质和抗压能力",
    weight: 0.2,
    questions: [
      {
        id: "m1",
        text: "你对失败的承受能力如何？",
        options: [
          { value: 0, score: 2, text: "很难接受失败" },
          { value: 1, score: 5, text: "可以接受小的失败" },
          { value: 2, score: 8, text: "把失败当作学习机会" },
          { value: 3, score: 10, text: "敢于试错，快速迭代" }
        ]
      },
      {
        id: "m2",
        text: "你的自律性如何？",
        options: [
          { value: 0, score: 2, text: "需要外部监督" },
          { value: 1, score: 5, text: "有监督可以坚持" },
          { value: 2, score: 8, text: "基本能自我管理" },
          { value: 3, score: 10, text: "高度自律，无需监督" }
        ]
      },
      {
        id: "m3",
        text: "你是否愿意持续学习新技能？",
        options: [
          { value: 0, score: 2, text: "不太愿意" },
          { value: 1, score: 5, text: "有需要会学" },
          { value: 2, score: 8, text: "喜欢学习新东西" },
          { value: 3, score: 10, text: "主动学习，持续提升" }
        ]
      },
      {
        id: "m4",
        text: "你能承受主业+副业的双重压力吗？",
        options: [
          { value: 0, score: 2, text: "可能比较困难" },
          { value: 1, score: 5, text: "可以尝试" },
          { value: 2, score: 8, text: "应该可以" },
          { value: 3, score: 10, text: "完全没问题" }
        ]
      },
      {
        id: "m5",
        text: '你是否有"我能做到"的信念？（自我效能感）',
        options: [
          { value: 0, score: 2, text: "经常怀疑自己的能力" },
          { value: 1, score: 5, text: "有时会怀疑" },
          { value: 2, score: 8, text: "基本相信自己能做好" },
          { value: 3, score: 10, text: "坚信自己能克服困难" }
        ]
      },
      {
        id: "m6",
        text: "你在压力下的表现如何？",
        options: [
          { value: 0, score: 2, text: "容易焦虑，效率下降" },
          { value: 1, score: 5, text: "有一定压力，但能应对" },
          { value: 2, score: 8, text: "压力下表现更好" },
          { value: 3, score: 10, text: "在压力下发挥出色" }
        ]
      },
      {
        id: "m7",
        text: "你是否有明确的长期目标？",
        options: [
          { value: 0, score: 2, text: "没有明确目标" },
          { value: 1, score: 5, text: "有模糊想法" },
          { value: 2, score: 8, text: "有清晰目标" },
          { value: 3, score: 10, text: "有详细的长期规划" }
        ]
      },
      {
        id: "m8",
        text: "你是否有坚韧不拔的毅力？（Grit坚毅品质）",
        options: [
          { value: 0, score: 2, text: "容易放弃" },
          { value: 1, score: 5, text: "有时会坚持" },
          { value: 2, score: 8, text: "比较有毅力" },
          { value: 3, score: 10, text: "非常坚韧" }
        ]
      }
    ]
  },

  // ==================== 维度4：动机与愿景 (8题) ====================
  motivation: {
    name: "动机与愿景",
    description: "评估你做副业的动机和决心",
    weight: 0.15,
    questions: [
      {
        id: "mot1",
        text: "你做副业的最主要目标是什么？",
        options: [
          { value: 0, score: 5, text: "增加收入（月收入增加500-2000元）" },
          { value: 1, score: 7, text: "发展兴趣，实现自我价值" },
          { value: 2, score: 9, text: "为未来转型做准备" },
          { value: 3, score: 10, text: "多重目标，综合发展" }
        ]
      },
      {
        id: "mot2",
        text: "你对副业收入的期望是？",
        options: [
          { value: 0, score: 3, text: "不在乎多少，主要是体验" },
          { value: 1, score: 6, text: "补充收入（月入500-2000元）" },
          { value: 2, score: 8, text: "重要收入（月入2000-5000元）" },
          { value: 3, score: 10, text: "期望较高（月入5000元以上）" }
        ]
      },
      {
        id: "mot3",
        text: "你做副业的紧迫程度如何？",
        options: [
          { value: 0, score: 4, text: "不着急，慢慢来" },
          { value: 1, score: 7, text: "希望半年内见到成效" },
          { value: 2, score: 9, text: "希望3个月内见到成效" },
          { value: 3, score: 10, text: "比较紧迫，需要尽快" }
        ]
      },
      {
        id: "mot4",
        text: "你愿意牺牲多少休闲时间来做副业？",
        options: [
          { value: 0, score: 3, text: "尽量不影响现有生活" },
          { value: 1, score: 6, text: "可以牺牲部分周末时间" },
          { value: 2, score: 8, text: "可以牺牲大部分周末" },
          { value: 3, score: 10, text: "愿意大幅减少娱乐时间" }
        ]
      },
      {
        id: "mot5",
        text: "你是否有强烈的成就欲望？",
        options: [
          { value: 0, score: 2, text: "满足于现状" },
          { value: 1, score: 5, text: "有一定成就追求" },
          { value: 2, score: 8, text: "追求卓越" },
          { value: 3, score: 10, text: "非常渴望成就" }
        ]
      },
      {
        id: "mot6",
        text: "你是否有改变现状的强烈愿望？",
        options: [
          { value: 0, score: 2, text: "对现状比较满意" },
          { value: 1, score: 5, text: "希望有所改变" },
          { value: 2, score: 8, text: "强烈希望改变" },
          { value: 3, score: 10, text: "迫切需要改变" }
        ]
      },
      {
        id: "mot7",
        text: "你是否有明确的人生愿景？",
        options: [
          { value: 0, score: 2, text: "没有明确愿景" },
          { value: 1, score: 5, text: "有模糊想法" },
          { value: 2, score: 8, text: "有清晰愿景" },
          { value: 3, score: 10, text: "有非常清晰的人生蓝图" }
        ]
      },
      {
        id: "mot8",
        text: "副业对你的人生意义有多大？",
        options: [
          { value: 0, score: 2, text: "只是额外收入" },
          { value: 1, score: 5, text: "有一定意义" },
          { value: 2, score: 8, text: "意义重大" },
          { value: 3, score: 10, text: "是实现人生价值的关键" }
        ]
      }
    ]
  },

  // ==================== 维度5：副业匹配度 (8题) ====================
  fit: {
    name: "副业匹配度",
    description: "评估你与副业的匹配程度",
    weight: 0.15,
    questions: [
      {
        id: "f1",
        text: "你的副业想法是否符合你的兴趣？",
        options: [
          { value: 0, score: 3, text: "不太感兴趣" },
          { value: 1, score: 6, text: "一般感兴趣" },
          { value: 2, score: 8, text: "比较感兴趣" },
          { value: 3, score: 10, text: "非常感兴趣" }
        ]
      },
      {
        id: "f2",
        text: "你的副业方向是否有市场需求？",
        options: [
          { value: 0, score: 3, text: "不确定，需要研究" },
          { value: 1, score: 6, text: "有一定需求" },
          { value: 2, score: 8, text: "需求较大" },
          { value: 3, score: 10, text: "需求旺盛，潜力大" }
        ]
      },
      {
        id: "f3",
        text: "你的主业技能能否用于副业？",
        options: [
          { value: 0, score: 3, text: "完全不能" },
          { value: 1, score: 6, text: "部分可以" },
          { value: 2, score: 8, text: "大部分可以" },
          { value: 3, score: 10, text: "完全可以直接复用" }
        ]
      },
      {
        id: "f4",
        text: "你对目标市场了解多少？",
        options: [
          { value: 0, score: 2, text: "基本不了解" },
          { value: 1, score: 5, text: "有一些了解" },
          { value: 2, score: 8, text: "做过初步研究" },
          { value: 3, score: 10, text: "深入调研过市场" }
        ]
      },
      {
        id: "f5",
        text: "你是否有独特的竞争优势？",
        options: [
          { value: 0, score: 2, text: "没有特别优势" },
          { value: 1, score: 5, text: "有一些优势" },
          { value: 2, score: 8, text: "有明显优势" },
          { value: 3, score: 10, text: "有独特竞争优势" }
        ]
      },
      {
        id: "f6",
        text: "你的副业想法是否与主业相关？",
        options: [
          { value: 0, score: 3, text: "完全不相关" },
          { value: 1, score: 6, text: "有一定关联" },
          { value: 2, score: 8, text: "高度相关" },
          { value: 3, score: 10, text: "可以相互促进" }
        ]
      },
      {
        id: "f7",
        text: "你是否了解目标用户群体？",
        options: [
          { value: 0, score: 2, text: "不太了解" },
          { value: 1, score: 5, text: "有一些了解" },
          { value: 2, score: 8, text: "比较了解" },
          { value: 3, score: 10, text: "非常了解" }
        ]
      },
      {
        id: "f8",
        text: "你的副业想法是否符合趋势？",
        options: [
          { value: 0, score: 2, text: "不确定" },
          { value: 1, score: 5, text: "可能符合" },
          { value: 2, score: 8, text: "基本符合趋势" },
          { value: 3, score: 10, text: "非常符合未来趋势" }
        ]
      }
    ]
  },

  // ==================== 维度6：执行力 (8题) ====================
  execution: {
    name: "执行力",
    description: "评估你的执行力和准备程度",
    weight: 0.1,
    questions: [
      {
        id: "e1",
        text: "你是否已有明确的副业方向？",
        options: [
          { value: 0, score: 2, text: "完全没有想法" },
          { value: 1, score: 5, text: "有几个想法，不确定" },
          { value: 2, score: 8, text: "有明确方向，需要验证" },
          { value: 3, score: 10, text: "方向明确，已有计划" }
        ]
      },
      {
        id: "e2",
        text: "你是否知道如何快速试错？",
        options: [
          { value: 0, score: 2, text: "不太清楚" },
          { value: 1, score: 5, text: "有大致想法" },
          { value: 2, score: 8, text: "有具体计划" },
          { value: 3, score: 10, text: "已经开始执行" }
        ]
      },
      {
        id: "e3",
        text: "你是否制定了3个月计划？",
        options: [
          { value: 0, score: 2, text: "还没有" },
          { value: 1, score: 5, text: "有模糊想法" },
          { value: 2, score: 8, text: "有简单计划" },
          { value: 3, score: 10, text: "有详细可执行计划" }
        ]
      },
      {
        id: "e4",
        text: "你过去是否有完成长期项目的经验？",
        options: [
          { value: 0, score: 2, text: "没有" },
          { value: 1, score: 5, text: "有1-2个" },
          { value: 2, score: 8, text: "有多个" },
          { value: 3, score: 10, text: "有很多成功案例" }
        ]
      },
      {
        id: "e5",
        text: "你是否善于解决问题？",
        options: [
          { value: 0, score: 2, text: "容易卡住" },
          { value: 1, score: 5, text: "能解决一些问题" },
          { value: 2, score: 8, text: "善于解决问题" },
          { value: 3, score: 10, text: "非常擅长解决问题" }
        ]
      },
      {
        id: "e6",
        text: "你是否有快速试错的经验？",
        options: [
          { value: 0, score: 2, text: "没有经验" },
          { value: 1, score: 5, text: "有一些经验" },
          { value: 2, score: 8, text: "经验丰富" },
          { value: 3, score: 10, text: "非常擅长快速试错" }
        ]
      },
      {
        id: "e7",
        text: "你是否有持续的执行力？",
        options: [
          { value: 0, score: 2, text: "容易三分钟热度" },
          { value: 1, score: 5, text: "能坚持一段时间" },
          { value: 2, score: 8, text: "基本能持续执行" },
          { value: 3, score: 10, text: "非常能坚持" }
        ]
      },
      {
        id: "e8",
        text: "你是否善于制定计划并执行？",
        options: [
          { value: 0, score: 2, text: "不太擅长" },
          { value: 1, score: 5, text: "一般" },
          { value: 2, score: 8, text: "比较擅长" },
          { value: 3, score: 10, text: "非常擅长" }
        ]
      }
    ]
  }
};

// ============================================================================
// 评分与分析系统
// ============================================================================

class AssessmentScorer {
  // 计算快速测评总分
  calculateQuickScore(answers) {
    let totalScore = 0;
    let maxScore = 0;

    QUICK_ASSESSMENT_QUESTIONS.forEach(q => {
      const answer = answers[q.id];
      if (answer !== undefined && q.options[answer]) {
        totalScore += q.options[answer].score;
        maxScore += 10; // 每题最高10分
      }
    });

    return {
      score: totalScore,
      maxScore: maxScore,
      percentage: Math.round((totalScore / maxScore) * 100)
    };
  }

  // 计算完整测评各维度得分
  calculateFullScores(answers) {
    const dimensions = {};

    Object.entries(FULL_ASSESSMENT_QUESTIONS).forEach(([dimId, dimData]) => {
      let dimScore = 0;
      let dimMax = 0;

      dimData.questions.forEach(q => {
        const answer = answers[q.id];
        if (answer !== undefined && q.options[answer]) {
          dimScore += q.options[answer].score;
          dimMax += 10;
        }
      });

      dimensions[dimId] = {
        name: dimData.name,
        score: dimScore,
        maxScore: dimMax,
        percentage: Math.round((dimScore / dimMax) * 100)
      };
    });

    return dimensions;
  }

  // 根据评分推荐副业类型
  recommendHustleTypes(assessment) {
    const recommendations = [];

    // 技能型副业：技能储备高、时间适中
    if (assessment.skills && assessment.skills.length > 0) {
      recommendations.push({
        type: 'skill_based',
        reason: '你有可变现的专业技能，适合技能型副业'
      });
    }

    // 资源型副业：有一定资金、人脉
    if (assessment.hasResources) {
      recommendations.push({
        type: 'resource_based',
        reason: '你有资金或人脉资源，可考虑资源型副业'
      });
    }

    // 内容型副业：创意强、愿意持续投入
    if (assessment.creative && assessment.persistent) {
      recommendations.push({
        type: 'content_based',
        reason: '你有创意且愿意持续输出，适合内容型副业'
      });
    }

    // 时间型副业：时间充裕但缺技能
    if (assessment.timeRich && !assessment.hasSkills) {
      recommendations.push({
        type: 'time_based',
        reason: '你时间充裕，可以从时间型副业开始积累'
      });
    }

    // 兴趣型副业：有明确兴趣
    if (assessment.hasInterest) {
      recommendations.push({
        type: 'interest_based',
        reason: '你有明确的兴趣方向，可以发展兴趣型副业'
      });
    }

    // 投资型副业：资金充足、风险承受力强
    if (assessment.hasFunds && assessment.riskTolerant) {
      recommendations.push({
        type: 'investment_based',
        reason: '你有资金且风险承受力强，可考虑投资型副业'
      });
    }

    // 如果没有特别匹配的，推荐技能型作为起点
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'skill_based',
        reason: '建议从发展技能开始，为副业做准备'
      });
    }

    return recommendations.slice(0, 3); // 返回前3个推荐
  }

  // 生成适合度等级
  getSuitabilityLevel(percentage) {
    if (percentage >= 80) return { level: '非常适合', color: '🟢', advice: '你非常适合做副业，建议立即行动！' };
    if (percentage >= 60) return { level: '比较适合', color: '🟡', advice: '你比较适合做副业，可以先从小规模开始尝试。' };
    if (percentage >= 40) return { level: '一般适合', color: '🟠', advice: '你有一定基础，但需要补足一些短板再开始。' };
    return { level: '暂不适合', color: '🔴', advice: '建议先提升自身能力或调整生活状态，再考虑副业。' };
  }
}

// ============================================================================
// 报告生成器
// ============================================================================

class ReportGenerator {
  generateQuickReport(assessment) {
    const scorer = new AssessmentScorer();
    const result = scorer.calculateQuickScore(assessment.answers);
    const level = scorer.getSuitabilityLevel(result.percentage);

    let report = `
# 副业适合度快速测评报告

## 📊 综合评分

**适合度等级：${level.color} ${level.level}**

**得分：${result.score}/${result.maxScore} 分 (${result.percentage}%)**

${level.advice}

---

## 💡 核心洞察

### 你的优势
${this._generateStrengths(assessment)}

### 需要注意的风险
${this._generateRisks(assessment)}

---

## 🎯 推荐副业类型

${this._generateRecommendations(assessment)}

---

## ✅ 本周行动清单

${this._generateActionPlan(assessment)}

---

*本报告基于快速测评生成，如需更详细的分析，请使用完整测评：/side-hustle-full*
`;

    return report;
  }

  generateFullReport(assessment) {
    const scorer = new AssessmentScorer();
    const dimensions = scorer.calculateFullScores(assessment.answers);

    // 计算总分（各维度平均）
    const totalPercentage = Math.round(
      Object.values(dimensions).reduce((sum, d) => sum + d.percentage, 0) / Object.keys(dimensions).length
    );
    const level = scorer.getSuitabilityLevel(totalPercentage);

    let report = `
# 副业适合度完整测评报告

## 📊 综合评分

**适合度等级：${level.color} ${level.level}**

**综合得分：${totalPercentage}/100**

${level.advice}

---

## 📈 各维度分析

${this._generateDimensionAnalysis(dimensions)}

---

## 💡 深度洞察

### 你的核心优势
${this._generateStrengths(assessment)}

### 需要警惕的风险
${this._generateRisks(assessment)}

### 发展建议
${this._generateDevelopmentAdvice(dimensions)}

---

## 🎯 个性化副业推荐

${this._generateDetailedRecommendations(assessment)}

---

## 📋 行动计划

### 第一个月目标
${this._generateFirstMonthPlan(assessment)}

### 3-6个月规划
${this._generateMediumTermPlan(assessment)}

### MVP建议
${this._generateMVPSuggestion(assessment)}

---

*报告生成时间：${new Date().toLocaleString('zh-CN')}*
`;

    return report;
  }

  _generateStrengths(assessment) {
    const strengths = [];

    if (assessment.timeAvailable > 5) {
      strengths.push('- ✅ **时间充裕**：你每周有较多时间可投入副业');
    }
    if (assessment.skills && assessment.skills.length > 0) {
      strengths.push(`- ✅ **技能储备**：你有${assessment.skills.length}项可变现技能`);
    }
    if (assessment.hasFunds) {
      strengths.push('- ✅ **资金支持**：你有启动资金，选择范围更广');
    }
    if (assessment.selfDiscipline > 6) {
      strengths.push('- ✅ **自律性强**：你有良好的自我管理能力');
    }
    if (assessment.riskTolerance > 6) {
      strengths.push('- ✅ **抗风险能力**：你能承受创业的波动和不确定性');
    }
    if (assessment.clearGoal) {
      strengths.push('- ✅ **目标明确**：你有清晰的副业目标和计划');
    }

    return strengths.length > 0 ? strengths.join('\n') : '- 需要在测评中进一步了解你的优势';
  }

  _generateRisks(assessment) {
    const risks = [];

    if (assessment.timeAvailable < 3) {
      risks.push('- ⚠️ **时间紧张**：你的可用时间较少，需要高效利用');
    }
    if (!assessment.skills || assessment.skills.length === 0) {
      risks.push('- ⚠️ **技能缺乏**：你可能需要先发展一些可变现的技能');
    }
    if (assessment.selfDiscipline < 5) {
      risks.push('- ⚠️ **自律挑战**：副业需要很强的自我管理能力');
    }
    if (assessment.riskTolerance < 5) {
      risks.push('- ⚠️ **风险敏感**：你需要选择风险较低的副业类型');
    }
    if (!assessment.clearGoal) {
      risks.push('- ⚠️ **方向模糊**：你可能需要先明确副业方向');
    }

    return risks.length > 0 ? risks.join('\n') : '- 暂无明显风险';
  }

  _generateRecommendations(assessment) {
    // 基于测评结果的推荐逻辑
    const recommendations = [];

    if (assessment.skills && assessment.skills.includes('tech')) {
      recommendations.push({
        type: '技能型 - 技术开发',
        reason: '你有技术背景，可以做外包开发、技术咨询等',
        examples: ['网站开发', '小程序开发', '技术咨询', '代码审查']
      });
    }

    if (assessment.skills && assessment.skills.includes('writing')) {
      recommendations.push({
        type: '内容型 - 写作创作',
        reason: '你有写作能力，适合内容变现',
        examples: ['自媒体写作', '文案代写', '知识付费', '翻译']
      });
    }

    if (assessment.timeAvailable > 10 && !assessment.skills) {
      recommendations.push({
        type: '时间型 - 兼职服务',
        reason: '你时间充裕但技能待提升，可以从时间型开始',
        examples: ['线上客服', '数据标注', '配送服务']
      });
    }

    // 默认推荐
    if (recommendations.length === 0) {
      recommendations.push({
        type: '建议先探索',
        reason: '你可以先尝试不同的副业类型，找到最适合自己的',
        examples: ['从兴趣出发', '从技能延伸', '从资源利用']
      });
    }

    return recommendations.map((rec, i) => `
### ${i + 1}. ${rec.type}

**推荐理由：** ${rec.reason}

**可选方向：**
${rec.examples.map(ex => `- ${ex}`).join('\n')}
`).join('\n');
  }

  _generateActionPlan(assessment) {
    return `
1. **确定方向**：在本周内确定1-2个想尝试的副业方向
2. **市场调研**：花2-3小时研究目标市场的需求情况
3. **技能盘点**：列出你所有的技能和经验，思考如何变现
4. **小步试错**：选择一个最小可行方案，这周就开始尝试
5. **记录复盘**：每天花10分钟记录进展和思考
`;
  }

  _generateDimensionAnalysis(dimensions) {
    let analysis = '';

    Object.entries(dimensions).forEach(([id, dim]) => {
      const bar = this._generateBar(dim.percentage);
      analysis += `
### ${dim.name} (${dim.percentage}/100)

${bar}

**得分：${dim.score}/${dim.maxScore}**

${this._getDimensionAdvice(id, dim.percentage)}
`;
    });

    return analysis;
  }

  _generateBar(percentage) {
    const filled = Math.round(percentage / 5);
    const empty = 20 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  _getDimensionAdvice(dimensionId, percentage) {
    const advices = {
      resources: percentage < 60 ?
        '💡 建议：先盘点现有资源，考虑从低门槛的副业开始，逐步积累资源。' :
        '💡 建议：你的资源条件不错，可以尝试需要一定投入的副业类型。',
      mindset: percentage < 60 ?
        '💡 建议：副业需要较强的心理素质，建议先从小规模开始锻炼抗压能力。' :
        '💡 建议：你的心理准备充分，有良好的创业心态。',
      motivation: percentage < 60 ?
        '💡 建议：明确你的副业目标，这会帮助你在困难时坚持下去。' :
        '💡 建议：你有清晰的动机，这是坚持下去的重要动力。',
      fit: percentage < 60 ?
        '💡 建议：需要更仔细地评估副业方向与你的匹配度。' :
        '💡 建议：你的匹配度较高，成功的可能性更大。',
      execution: percentage < 60 ?
        '💡 建议：建议制定具体的执行计划，从最小的行动开始。' :
        '💡 建议：你的执行准备充分，可以快速启动。'
    };
    return advices[dimensionId] || '';
  }

  _generateDevelopmentAdvice(dimensions) {
    // 找出最弱的维度
    const weakest = Object.entries(dimensions)
      .sort(([, a], [, b]) => a.percentage - b.percentage)[0];

    return `
基于你的测评结果，建议优先发展 **${weakest[1].name}** 维度。

这是你最薄弱的环节（得分：${weakest[1].percentage}/100），提升这个维度会显著提高你做副业的成功率。

具体建议：
${this._getDimensionAdvice(weakest[0], weakest[1].percentage)}
`;
  }

  _generateDetailedRecommendations(assessment) {
    // 更详细的推荐逻辑，结合完整测评的各维度
    return this._generateRecommendations(assessment);
  }

  _generateFirstMonthPlan(assessment) {
    return `
### 第1周：准备与探索
- 确定1-2个副业方向
- 完成市场调研（目标用户、竞品分析）
- 列出所需技能和资源清单
- 制定详细的周计划

### 第2周：小步试错
- 开始第一个MVP（最小可行产品）
- 寻找第一个潜在客户/用户
- 记录每天的行动和反思
- 加入相关社群，获取信息

### 第3周：迭代优化
- 根据反馈优化产品/服务
- 尝试不同的获客方式
- 建立日常工作流程
- 开始建立个人品牌

### 第4周：评估与决策
- 评估第一个月的成果
- 分析哪些方法有效、哪些无效
- 决定是否继续这个方向
- 制定下个月计划
`;
  }

  _generateMediumTermPlan(assessment) {
    return `
### 3个月目标
- 完成MVP验证，确定方向
- 获得10个付费客户/用户
- 建立稳定的获客渠道
- 月收入达到1000-3000元

### 6个月目标
- 业务进入稳定增长期
- 建立个人品牌影响力
- 月收入达到3000-8000元
- 开始考虑规模化或优化效率

### 调整机制
- 每月复盘一次
- 根据数据调整方向
- 保持学习和迭代
- 平衡主业与副业
`;
  }

  _generateMVPSuggestion(assessment) {
    return `
**最小可行产品（MVP）建议：**

副业的成功关键在于快速试错。不要追求完美，先用最小的成本验证你的想法。

### MVP原则
1. **最小功能**：只保留最核心的功能
2. **最快上线**：1-2周内推出
3. **最低成本**：尽量零成本启动
4. **快速迭代**：根据用户反馈快速调整

### 示例
- 如果是**技能型**：先做1-2个样品，在朋友圈/社交媒体展示
- 如果是**内容型**：先写5篇高质量文章，看反馈
- 如果是**电商型**：先选1-2个产品，小批量测试

### 关键指标
第一周关注：完成度、用户反馈
第一个月关注：用户数、转化率
第三个月关注：收入、满意度
`;
  }
}

// ============================================================================
// 数据存储
// ============================================================================

class AssessmentStorage {
  constructor() {
    this.storageDir = path.join(__dirname, '..', 'assessments');
    this.ensureStorageDir();
  }

  ensureStorageDir() {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  saveAssessment(assessment) {
    const filename = `assessment_${assessment.id}_${Date.now()}.json`;
    const filepath = path.join(this.storageDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(assessment, null, 2));
    return filepath;
  }

  loadAssessment(id) {
    // 实现加载逻辑
  }
}

// ============================================================================
// 命令行界面
// ============================================================================

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    mode: args[0] || 'help',
    options: args.slice(1)
  };
}

function showHelp() {
  console.log(`
副业适合度测评工具

快速了解你是否适合做副业，以及适合什么类型的副业。

命令：
  /side-hustle          启动副业适合度测评（交互式）
  /side-hustle-quick    快速测评（10个核心问题）
  /side-hustle-full     完整测评（5大维度深度分析）
  /side-hustle-types    查看副业类型库

测评流程：
  1. 回答测评问题
  2. 系统分析你的回答
  3. 生成个性化报告
  4. 给出具体行动建议

开始测评：/side-hustle
`);
}

function showHustleTypes() {
  console.log(`
# 副业类型库

${Object.entries(SIDE_HUSTLE_TYPES).map(([id, type]) => `
## ${type.name}

${type.description}

**典型示例：**
${type.examples.map(ex => `- **${ex.name}**：准入门槛${ex.entry} | 收入潜力${ex.potential} | 时间投入${ex.time}`).join('\n')}

**所需特质：** ${type.requiredTraits.join('、')}
`).join('\n---\n')}

---

*选择副业类型时，请综合考虑你的技能、时间、兴趣和资源。*
`);
}

function showQuickAssessment() {
  console.log(`
# 副业适合度快速测评（30题版）

本测评包含30个核心问题，涵盖6大维度，帮助你全面了解自己是否适合做副业。

## 测评维度

- **资源基础**（6题）：时间、技能、资金、人脉等资源条件
- **心理素质**（8题）：抗压能力、自律性、自我效能感等
- **动机强度**（5题）：目标、意愿、成就欲望等
- **匹配度**（5题）：兴趣、市场、竞争优势等
- **执行力**（6题）：计划能力、解决问题能力、持续执行力等

## 测评说明

请诚实回答以下问题，系统将根据你的回答生成个性化报告。

---

*问题数量较多，建议分批完成。如需更详细的分析，请使用完整测评：/side-hustle-full*
`);
}

function showFullAssessment() {
  console.log(`
# 副业适合度完整测评（48题版）

本测评从6大维度深入分析你的副业适合度，基于创业心理学、Big Five人格特质理论设计。

## 测评维度

### 1. 资源基础（8题，权重20%）
评估时间、技能、资金、人脉、设备等资源条件

### 2. 创业人格（8题，权重20%）
基于Big Five人格理论：开放性、尽责性、外向性、情绪稳定性、宜人性

### 3. 心理素质（8题，权重20%）
抗压能力、自律性、自我效能感、坚毅品质等

### 4. 动机与愿景（8题，权重15%）
目标明确度、成就欲望、人生愿景等

### 5. 副业匹配度（8题，权重15%）
兴趣匹配、市场需求、竞争优势、趋势符合度等

### 6. 执行力（8题，权重10%）
计划能力、解决问题能力、持续执行力等

---

## 开始测评

完整测评需要约15-20分钟，请确保你有充足的时间。

每个维度的问题会帮助你全面了解自己在该方面的情况。

*如果时间有限，可以先使用快速测评：/side-hustle-quick*
`);
}

function main() {
  const options = parseArgs();

  switch (options.mode) {
    case 'types':
      showHustleTypes();
      break;

    case 'quick':
      showQuickAssessment();
      break;

    case 'full':
      showFullAssessment();
      break;

    case 'help':
    default:
      showHelp();
  }
}

main();
