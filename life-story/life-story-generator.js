#!/usr/bin/env node

/**
 * 人生故事工作台
 * 通过结构化访谈帮助用户挖掘和整理个人故事
 * 适用于个人IP打造的公众号文章创作
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// 访谈问题模板库
// ============================================================================

const questionTemplates = {
  // 童年与启蒙
  childhood: {
    title: "童年与启蒙",
    icon: "🌱",
    description: "探索成长起点和最初的烙印",
    questions: [
      {
        id: "c1",
        question: "你童年最深刻的记忆是什么？为什么这个记忆对你如此重要？",
        followUps: [
          "这个记忆如何影响了你后来的选择？",
          "如果用这个记忆来解释你现在的某个特质，会是什么？"
        ]
      },
      {
        id: "c2",
        question: "小时候的你，和同龄人最大的不同是什么？",
        followUps: [
          "当时你觉得这种不同是一种困扰吗？",
          "现在回头看，这种不同如何成为了你的优势？"
        ]
      },
      {
        id: "c3",
        question: "在你成长过程中，有没有某个人、某本书、某件事，彻底改变了你的看法？",
        followUps: [
          "在遇到这个人/这件事之前，你是什么样的？",
          "改变之后，你做的第一个决定是什么？"
        ]
      },
      {
        id: "c4",
        question: "你小时候有什么「不合常理」的梦想或爱好吗？",
        followUps: [
          "这个梦想背后，你真正渴望的是什么？",
          "现在看来，这个梦想以什么形式在你生活中延续？"
        ]
      }
    ]
  },

  // 青春与选择
  youth: {
    title: "青春与选择",
    icon: "🌊",
    description: "回顾成长路上的关键抉择",
    questions: [
      {
        id: "y1",
        question: "你人生中的第一个重大选择是什么？（比如专业、工作、感情）",
        followUps: [
          "做这个选择时，你内心最真实的冲突是什么？",
          "如果现在的你回到当时，会做同样的选择吗？"
        ]
      },
      {
        id: "y2",
        question: "青春期的你，经历过最大的「失败」或「挫折」是什么？",
        followUps: [
          "当时你是怎么熬过来的？",
          "这段经历如何塑造了你的韧性？"
        ]
      },
      {
        id: "y3",
        question: "有没有哪个时刻，你突然意识到「我必须自己承担人生的责任了」？",
        followUps: [
          "是什么事件触发了这个觉醒？",
          "之后你的行为发生了什么具体变化？"
        ]
      },
      {
        id: "y4",
        question: "你做过最「叛逆」的事是什么？",
        followUps: [
          "你为什么一定要做这件事？",
          "这件事如何让你重新认识了自己？"
        ]
      }
    ]
  },

  // 转折与突破
  turning: {
    title: "转折与突破",
    icon: "🔥",
    description: "发现改变命运的关键时刻",
    questions: [
      {
        id: "t1",
        question: "你人生中的最大转折点是什么？用一个词来形容，是什么？",
        followUps: [
          "在转折点之前，你过着怎样的生活？",
          "是什么力量推动你做出改变？",
          "转折之后，你最大的损失和收获分别是什么？"
        ]
      },
      {
        id: "t2",
        question: "你有没有过「放弃一切，重新开始」的经历？",
        followUps: [
          "当时你面临的最大恐惧是什么？",
          "是什么让你最终下定决心？",
          "重新开始的过程，比你想象的更容易还是更难？"
        ]
      },
      {
        id: "t3",
        question: "在你的人生中，有没有某个时刻，你突然「活明白了」一件事？",
        followUps: [
          "是什么让你突然顿悟？",
          "这个顿悟如何改变了你之后的人生轨迹？"
        ]
      },
      {
        id: "t4",
        question: "你遇到过最大的「不公平」是什么？你是如何应对的？",
        followUps: [
          "当时你内心的真实感受是什么？",
          "这段经历如何影响了你的价值观？"
        ]
      }
    ]
  },

  // 挣扎与矛盾
  struggle: {
    title: "挣扎与矛盾",
    icon: "⚡",
    description: "直面内心的冲突与困境",
    questions: [
      {
        id: "s1",
        question: "你内心深处最大的矛盾是什么？",
        followUps: [
          "这个矛盾如何体现在你的日常选择中？",
          "你如何看待和处理这个矛盾？"
        ]
      },
      {
        id: "s2",
        question: "你有没有过「在别人眼中我很好，但只有我知道自己多痛苦」的时刻？",
        followUps: [
          "是什么让你选择隐藏真实感受？",
          "你后来是如何走出这种状态的？"
        ]
      },
      {
        id: "s3",
        question: "你做过最「冒险」的决定是什么？",
        followUps: [
          "当时你赌上了什么？",
          "如果输了，后果你能承受吗？",
          "这个冒险如何改变了对自己的认知？"
        ]
      },
      {
        id: "s4",
        question: "你有什么「不为人知」的坚持吗？",
        followUps: [
          "这个坚持对别人来说可能「不值得」，但你为什么一定要做？",
          "这个坚持背后，是什么在支撑你？"
        ]
      }
    ]
  },

  // 意义与使命
  meaning: {
    title: "意义与使命",
    icon: "🌟",
    description: "探索生命的价值和方向",
    questions: [
      {
        id: "m1",
        question: "如果有天你离开了，你希望别人如何记住你？",
        followUps: [
          "为什么这对你如此重要？",
          "你现在的行为，正在朝着这个方向努力吗？"
        ]
      },
      {
        id: "m2",
        question: "你认为人生最大的意义是什么？",
        followUps: [
          "你的答案和十年前有什么不同？",
          "是什么经历让你形成了现在的答案？"
        ]
      },
      {
        id: "m3",
        question: "你做的事，是在解决你自己的问题，还是在解决别人的问题？",
        followUps: [
          "你的个人经历如何让你能够理解他人的痛苦？",
          "你希望你的存在，为他人带来什么？"
        ]
      },
      {
        id: "m4",
        question: "你有没有一个「还未完成」的使命或梦想？",
        followUps: [
          "这个使命是什么时候在你心中种下的？",
          "如果你今生完不成，你会觉得遗憾吗？"
        ]
      }
    ]
  },

  // 脆弱与真实
  vulnerable: {
    title: "脆弱与真实",
    icon: "💫",
    description: "展现最真实的一面",
    questions: [
      {
        id: "v1",
        question: "你最害怕别人知道你什么？",
        followUps: [
          "这个恐惧从何而来？",
          "如果被知道了，实际上会怎样？",
          "你什么时候开始和这个恐惧和解？"
        ]
      },
      {
        id: "v2",
        question: "你展示给世界的「人设」，和真实的你，最大的差距在哪里？",
        followUps: [
          "你为什么需要维持这个人设？",
          "有没有哪个时刻，你卸下了人设？那感觉如何？"
        ]
      },
      {
        id: "v3",
        question: "你什么时候哭过？（不是因为生理上的痛苦，而是情绪上的）",
        followUps: [
          "那是什么情境？",
          "哭泣之后，你有什么变化？"
        ]
      },
      {
        id: "v4",
        question: "你有什么「说出来会被笑话」的弱点吗？",
        followUps: [
          "这个弱点如何影响了你的生活？",
          "你现在如何看待这个弱点？"
        ]
      }
    ]
  }
};

// ============================================================================
// 故事风格定义
// ============================================================================

const storyStyles = {
  hero: {
    name: "英雄之旅",
    description: "适合创业者、有重大转折经历的人",
    structure: [
      { section: "序章", hint: "用一个场景开场，展现你现在的状态或某个关键场景" },
      { section: "启程", hint: "童年的烙印，最初的召唤" },
      { section: "试炼", hint: "成长中的挫折、迷茫、第一次重大选择" },
      { section: "至暗时刻", hint: "人生最低谷，最大的危机" },
      { section: "觉醒", hint: "转折点，顿悟时刻，重新出发" },
      { section: "归来", hint: "现在的状态，对他人的意义" }
    ],
    tone: "有力量感，节奏紧凑，突出蜕变",
    techniques: ["场景化开场", "危机-转机结构", "对比手法"]
  },

  intimate: {
    name: "私密对话",
    description: "适合知识工作者、咨询师、教育者",
    structure: [
      { section: "深夜来信", hint: "用第二人称开场，营造私密感" },
      { section: "说个秘密", hint: "分享一个不为人知的经历或感受" },
      { section: "我也曾", hint: "表达共鸣，说出你也有过的困惑" },
      { section: "后来我", hint: "你的转变和收获" },
      { section: "给你", hint: "给读者的建议或启发" }
    ],
    tone: "温柔、真诚、像朋友聊天",
    techniques: ["第二人称", "自我暴露", "情感共鸣"]
  },

  philosophical: {
    name: "哲思风格",
    description: "适合思考者、写作者、研究者",
    structure: [
      { section: "一个问题", hint: "以一个问题或悖论开场" },
      { section: "我的答案曾经是", hint: "过去的认知" },
      { section: "直到有一天", hint: "改变认知的经历" },
      { section: "现在我明白了", hint: "现在的理解" },
      { section: "也许你也", hint: "开放性的思考邀请" }
    ],
    tone: "理性、思辨、留白",
    techniques: ["问题驱动", "认知对比", "思辨性结尾"]
  }
};

// ============================================================================
// 工具函数
// ============================================================================

function getInterviewFilePath() {
  const dir = path.join(__dirname, '..', '.interview-data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return path.join(dir, 'interview-records.json');
}

function loadInterviewRecords() {
  const filePath = getInterviewFilePath();
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  return {};
}

function saveInterviewRecords(records) {
  fs.writeFileSync(getInterviewFilePath(), JSON.stringify(records, null, 2));
}

function saveAnswer(categoryId, questionId, answer) {
  const records = loadInterviewRecords();
  if (!records[categoryId]) {
    records[categoryId] = {};
  }
  records[categoryId][questionId] = {
    answer,
    timestamp: new Date().toISOString()
  };
  saveInterviewRecords(records);
}

// ============================================================================
// 输出格式化
// ============================================================================

function printHeader(text) {
  console.log('\n' + '═'.repeat(60));
  console.log(`  ${text}`);
  console.log('═'.repeat(60));
}

function printSection(text) {
  console.log('\n' + '─'.repeat(60));
  console.log(`${text}`);
  console.log('─'.repeat(60));
}

function printQuestion(question) {
  console.log('\n❓ ' + question);
}

function printFollowUp(question) {
  console.log('\n🔍 追问: ' + question);
}

function printPrompt(text) {
  console.log('\n💬 ' + text);
  console.log('> 等待你的回答...\n');
}

// ============================================================================
// 核心功能
// ============================================================================

function showCategories() {
  printHeader('人生故事工作台 - 访谈主题');
  console.log('\n选择一个主题开始深度访谈：\n');

  Object.entries(questionTemplates).forEach(([key, category]) => {
    console.log(`  ${category.icon} ${category.title}`);
    console.log(`     /story-${key}`);
    console.log(`     ${category.description}`);
    console.log();
  });
}

function showStyles() {
  printHeader('故事风格选择');
  console.log('\n根据你的故事特点选择合适的风格：\n');

  Object.entries(storyStyles).forEach(([key, style]) => {
    console.log(`  《${style.name}》 (--style ${key})`);
    console.log(`     ${style.description}`);
    console.log(`     语调: ${style.tone}`);
    console.log();
  });
}

function generateInterviewPrompt(categoryId) {
  const category = questionTemplates[categoryId];
  if (!category) {
    console.log(`未找到主题: ${categoryId}`);
    return null;
  }

  let prompt = `# ${category.icon} ${category.title} - 深度访谈\n\n`;
  prompt += `${category.description}\n\n`;
  prompt += `---\n\n`;

  category.questions.forEach((q, index) => {
    prompt += `## 问题 ${index + 1}\n\n`;
    prompt += `${q.question}\n\n`;

    if (q.followUps && q.followUps.length > 0) {
      prompt += `**可能的追问方向：**\n`;
      q.followUps.forEach((fu, i) => {
        prompt += `${i + 1}. ${fu}\n`;
      });
      prompt += `\n`;
    }

    prompt += `**请在下面记录回答：**\n\n`;
    prompt += `(等待回答...)\n\n`;
    prompt += `---\n\n`;
  });

  return prompt;
}

function generateCompilePrompt(style = 'hero') {
  const records = loadInterviewRecords();
  const styleConfig = storyStyles[style] || storyStyles.hero;

  // 统计已收集的内容
  let contentSummary = '';
  let totalAnswers = 0;

  Object.entries(records).forEach(([catId, questions]) => {
    const category = questionTemplates[catId];
    if (category) {
      const answerCount = Object.keys(questions).length;
      totalAnswers += answerCount;
      contentSummary += `\n### ${category.icon} ${category.title} (${answerCount}个回答)\n`;
    }
  });

  if (totalAnswers === 0) {
    return `# ⚠️ 尚未收集访谈内容\n\n请先使用 /story-interview 或 /story-[主题] 开始访谈。\n\n可用的主题：\n${Object.keys(questionTemplates).map(k => `- /story-${k}`).join('\n')}\n`;
  }

  let prompt = `# 📝 人生故事 - 生成指南\n\n`;
  prompt += `## 目标字数: 6000-8000字\n\n`;
  prompt += `## 风格: ${styleConfig.name}\n\n`;
  prompt += `**语调**: ${styleConfig.tone}\n\n`;
  prompt += `**写作技巧**: ${styleConfig.techniques.join('、')}\n\n`;

  prompt += `## 文章结构\n\n`;
  styleConfig.structure.forEach((section, index) => {
    prompt += `${index + 1}. **${section.section}**: ${section.hint}\n`;
  });

  prompt += `\n## 已收集内容\n\n${contentSummary}\n`;
  prompt += `---\n\n`;

  prompt += `## 写作指引\n\n`;
  prompt += `请基于以下访谈记录，按照上述结构和风格，撰写一篇6000-8000字的人生故事。\n\n`;
  prompt += `### 重要原则：\n\n`;
  prompt += `1. **真实性优先**: 使用访谈中的具体细节、对话、场景\n`;
  prompt += `2. **情感连接**: 让读者能够产生共鸣和代入感\n`;
  prompt += `3. **主题明确**: 每个部分都要服务于核心主题\n`;
  prompt += `4. **避免套路**: 不要使用陈词滥调和虚假感动\n`;
  prompt += `5. **展示而非讲述**: 用场景和细节来展现，而非直接陈述\n\n`;

  prompt += `### 访谈记录详情\n\n`;

  Object.entries(records).forEach(([catId, questions]) => {
    const category = questionTemplates[catId];
    if (category) {
      prompt += `#### ${category.icon} ${category.title}\n\n`;

      Object.entries(questions).forEach(([qId, record]) => {
        const questionObj = category.questions.find(q => q.id === qId);
        if (questionObj) {
          prompt += `**问题**: ${questionObj.question}\n\n`;
          prompt += `**回答**:\n${record.answer}\n\n`;
        }
      });

      prompt += `---\n\n`;
    }
  });

  return prompt;
}

function saveToFile(content, filename) {
  const dir = path.join(__dirname, '..', 'life-stories');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const filepath = path.join(dir, `${filename}_${timestamp}.md`);
  fs.writeFileSync(filepath, content, 'utf-8');
  console.log(`\n✅ 已保存到: ${filepath}`);
  return filepath;
}

// ============================================================================
// 命令行处理
// ============================================================================

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    mode: null,
    category: null,
    style: 'hero',
    save: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--mode':
        result.mode = args[++i];
        break;
      case '--category':
        result.category = args[++i];
        break;
      case '--style':
        result.style = args[++i];
        break;
      case '--save':
        result.save = true;
        break;
      case '--help':
        result.help = true;
        break;
    }
  }

  return result;
}

function showHelp() {
  printHeader('人生故事工作台');
  console.log(`
通过深度访谈，挖掘和整理个人故事，打造真实的个人IP。

使用方式：
  /story                    进入工作台主页
  /story-interview          开始深度访谈模式
  /story-[主题]            访谈特定主题
  /story-compile           生成故事
  /story-[风格]            生成指定风格故事
  /story-save              生成并保存故事

访谈主题：
  /story-childhood         童年与启蒙
  /story-youth             青春与选择
  /story-turning           转折与突破
  /story-struggle          挣扎与矛盾
  /story-meaning           意义与使命
  /story-vulnerable        脆弱与真实

故事风格：
  --style hero             英雄之旅（创业者、重大转折）
  --style intimate         私密对话（知识工作者、教育者）
  --style philosophical    哲思风格（思考者、研究者）

示例：
  /story-childhood         开始童年主题访谈
  /story-compile           生成英雄之旅风格故事
  /story-save --style intimate  生成私密对话风格并保存
`);
}

function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    return;
  }

  // 显示主题列表
  if (!options.mode && !options.category) {
    showCategories();
    console.log('\n' + '─'.repeat(60));
    showStyles();
    console.log('\n💡 提示：访谈收集的内容会自动保存，可随时生成故事\n');
    return;
  }

  // 访谈特定主题
  if (options.category) {
    const prompt = generateInterviewPrompt(options.category);
    if (prompt) {
      console.log(prompt);
      console.log('\n💡 回答后，内容会自动保存到本地\n');
    }
    return;
  }

  // 编译生成故事
  if (options.mode === 'compile') {
    const prompt = generateCompilePrompt(options.style);
    console.log(prompt);

    if (options.save) {
      const filename = `life_story_${options.style}`;
      saveToFile(prompt, filename);
    }
    return;
  }

  // 默认显示帮助
  showHelp();
}

main();
