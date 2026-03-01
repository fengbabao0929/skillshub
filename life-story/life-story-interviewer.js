#!/usr/bin/env node

/**
 * 人生故事工作台 - 深度访谈引擎
 *
 * 核心理念：从任何人生阶段切入，根据被访谈者最想表达的内容展开
 * 原则：故事不必从童年开始，从最能触动人心的地方开始
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// 核心访谈方法论
// ============================================================================

const INTERVIEW_METHODOLOGY = `
# 深度访谈方法论：场景化素材挖掘

作为一位拥有 20 年经验的非虚构作家和资深采访记者，你的目标是通过深度访谈，
挖掘用户人生故事中隐藏的细节，为撰写一篇 6000-8000 字的公众号深度长文收集素材。

## 核心原则：收集可写成场景的素材

访谈不是聊天记录，而是为写作收集素材。每一个问题都应该指向可以写成场景的细节。

**一个好的场景素材的特征**：
- 可以用2-3句话描述出一个具体画面
- 包含至少三种感官细节
- 有明确的动作（而不是状态描述）
- 能体现情绪的身体反应

## 场景化素材挖掘五步法（必须依次执行）

### 第一步：定格瞬间（场景锚定）
**目标**：不要让用户说"那段时间很艰难"，而是定格在一个具体的瞬间

**追问技巧**：
- "能说说那段时间里，最具体的一个时刻吗？比如某一天、某一个场景？"
- "有没有哪个瞬间，你至今还记得特别清楚？"
- "如果能回到那个时候，你最想回到哪一天？"

**示例对话**：
- 用户："那时候很穷，很艰难"
- 你追问："能不能说一个具体的场景？比如某一天发生了什么？"
- 用户："比如有一次，我站在便利店门前，攥着最后一个硬币，不知道该买面包还是坐公交车"

### 第二步：五感扫描（Sensory Scan）
**目标**：确保收集到至少三种感官细节

**追问清单**：
- **视觉**："那天光线怎么样？天是什么颜色？周围有什么具体的东西？"
- **听觉**："周围有什么声音？有人说话吗？有音乐或噪音吗？"
- **触觉**："你能感受到温度吗？冷还是热？手里拿着什么？身体有什么感觉？"
- **嗅觉**："空气里有什么味道？"
- **本体感觉**："你的心跳、呼吸怎么样？手脚在发抖吗？"

**检查标准**：每个场景必须收集到至少3个感官细节

### 第三步：动作拆解（Action Breakdown）
**目标**：把概括性的描述拆解成具体动作

**追问技巧**：
- "你当时具体在做什么？能描述一下那个动作吗？"
- "你说了什么？怎么说的？语气怎么样？"
- "你的手、脚、眼睛当时在做什么？"

**示例**：
- ❌ "我当时很纠结"
- ✅ "我的手放在门把手上，握紧，松开，又握紧。最后还是没有推开门"

### 第四步：身体情绪（Physical Emotion）
**目标**：挖掘情绪在身体上的具体反应

**追问技巧**：
- "你当时身体有什么反应？心跳、呼吸、体温？"
- "手在抖吗？嗓子发紧吗？胃里有什么感觉？"
- "你能睡着吗？吃饭是什么感觉？"

**示例**：
- ❌ "当时很害怕"
- ✅ "我能感觉到心脏在撞击胸口，手心里全是汗，喉咙像被什么东西堵住了"

### 第五步：未尽之言（Unsaid Words）
**目标**：捕捉对话中的潜台词和沉默

**追问技巧**：
- "你们说了什么？怎么说的？有没有停顿或犹豫？"
- "有没有什么话想说说不出，或者不想说？"
- "当时的沉默是什么样的？"

**示例**：
- "他说：'好吧，那你就...'他没有说完，但我明白他的意思"
- "我想说什么，但话到嘴边又咽了回去"

## 关键场景类型（必须收集）

### 1. 转折场景
- 人物做出重大决定的时刻
- 改变命运的一次选择
- 一个具体的事件让人突然醒悟

**追问**："这个转变具体发生在哪个时刻？能描述一下那个场景吗？"

### 2. 最低谷场景
- 人生中最艰难的时刻
- 想要放弃的那个瞬间
- 看不到希望的时候

**追问**："最艰难的时候，能不能描述一个具体的场景？比如某一天？"

### 3. 高光时刻
- 最骄傲的成就
- 最满足的瞬间
- "这就是我想要的样子"的时刻

**追问**："最骄傲的那一次，具体是什么样的场景？能描述一下那个时刻吗？"

### 4. 脆弱时刻
- 展现真实自我的时候
- 承认自己软弱的时候
- 眼泪掉下来的时刻

**追问**："你能说说那个最真实的时刻吗？哪怕听起来不那么'好'"

## 严格执行规则

### 1. 进度控制与用户确认
每完成一个场景的素材收集后，主动询问用户：
  - 关于这个场景我们聊得差不多了。你是想：
    - A) 继续补充这个场景的更多细节
    - B) 往前推进，聊下一个阶段/场景
    - C) 跳到你最想聊的高光时刻

**判断标准**：当一个场景已经收集到 3-5 个感官细节 + 2-3 个动作细节时，即可推进

### 2. 高光时刻必问（关键）
在访谈的中后段，必须主动询问：
  - 聊到现在，我想了解一下你的高光时刻：
    - 你最骄傲的一次成就是什么？（请描述具体场景）
    - 有没有哪个时刻，你觉得"这就是我想要的样子"？
    - 你现在最满意的个人状态是什么？（具体场景）

高光时刻的素材权重应该占整个故事的 30-40%

### 3. 场景完整性检查
每个场景收集完后，自我检查：
- [ ] 有具体的时间/地点
- [ ] 有至少3种感官细节
- [ ] 有具体的动作（而非状态）
- [ ] 有身体反应描述
- [ ] 有对话或未尽之言

### 4. 细节回溯
主动带入之前用户提到过的细节进行关联提问：
- "你刚才提到的XX，和这个场景有什么关联吗？"
- "这个场景，和你小时候的XX经历，有什么呼应吗？"

### 5. 灵活延伸
根据访谈自然流向，必要时跳到其他人生阶段，不必严格按时间线。

## 禁止事项

❌ 接受概括性描述而不追问具体场景
❌ 满足于单一感官细节（必须至少三种）
❌ 让用户说教或总结，而不是描述场景
❌ 忽视身体反应和未尽之言
`;

// ============================================================================
// 切入点引导问题
// ============================================================================

const ENTRY_POINT_QUESTIONS = {
  open: {
    title: "开放式引导",
    questions: [
      "你的人生中，有没有哪个时刻让你觉得'我的人生从此不一样了'？",
      "如果把你的人生拍成电影，你最想拍哪一场戏？",
      "你人生中最想重新来过的时刻是什么？",
      "有没有哪件事，你从来没对别人说过，但今天想聊聊？",
      "你人生中的'至暗时刻'是什么？",
      "你人生中的'高光时刻'是什么？",
      "如果用一个画面来概括你的人生，那是什么画面？"
    ]
  },

  specific: {
    title: "特定事件引导",
    questions: [
      "你做过的最冒险的决定是什么？",
      "你失去的最珍贵的东西是什么？",
      "你最接近死亡的一次经历是什么？",
      "你最大的遗憾是什么？",
      "你最骄傲的一次坚持是什么？",
      "你最对不起的人是谁？",
      "你最感激的人是谁？为什么？"
    ]
  },

  metaphor: {
    title: "隐喻式引导",
    questions: [
      "如果把你的人生比作一条路，现在走到哪里了？",
      "如果把你的人生比作一本书，现在读到第几章？",
      "如果把你的人生比作一场旅行，现在是在出发、途中，还是到达？",
      "如果用一个季节来形容你的人生，现在是哪个季节？",
      "如果用一种天气来形容你的人生，现在是什么天气？"
    ]
  }
};

// ============================================================================
// 灵活的访谈主题库
// ============================================================================

const INTERVIEW_THEMES = {
  // 时间阶段类
  childhood: {
    name: "童年与启蒙",
    keywords: ["童年", "小时候", "那时", "小时候的", "孩子", "那时我"],
    entryQuestions: [
      "你童年最深刻的记忆是什么？",
      "小时候的你，和同龄人最大的不同是什么？",
      "在你成长过程中，有没有某个人、某本书、某件事，彻底改变了你的看法？"
    ]
  },

  youth: {
    name: "青春与选择",
    keywords: ["青春期", "那时候", "年轻", "那年", "学校", "大学", "十八"],
    entryQuestions: [
      "你人生中的第一个重大选择是什么？",
      "青春期的你，经历过最大的'失败'或'挫折'是什么？",
      "你做过最'叛逆'的事是什么？"
    ]
  },

  turning: {
    name: "转折与突破",
    keywords: ["转折", "改变", "决定", "放弃", "重新", "开始", "那时我想"],
    entryQuestions: [
      "你人生中的最大转折点是什么？",
      "你有没有过'放弃一切，重新开始'的经历？",
      "在你的人生中，有没有某个时刻，你突然'活明白了'一件事？"
    ]
  },

  struggle: {
    name: "挣扎与矛盾",
    keywords: ["痛苦", "矛盾", "纠结", "挣扎", "难过", "焦虑", "迷茫"],
    entryQuestions: [
      "你内心深处最大的矛盾是什么？",
      "你有没有过'在别人眼中我很好，但只有我知道自己多痛苦'的时刻？",
      "你做过最'冒险'的决定是什么？"
    ]
  },

  meaning: {
    name: "意义与使命",
    keywords: ["意义", "使命", "价值", "为什么", "活着", "人生"],
    entryQuestions: [
      "如果有天你离开了，你希望别人如何记住你？",
      "你认为人生最大的意义是什么？",
      "你做的事，是在解决你自己的问题，还是在解决别人的问题？"
    ]
  },

  vulnerable: {
    name: "脆弱与真实",
    keywords: ["害怕", "恐惧", "弱点", "不为人知", "秘密", "人设"],
    entryQuestions: [
      "你最害怕别人知道你什么？",
      "你展示给世界的'人设'，和真实的你，最大的差距在哪里？",
      "你什么时候哭过？"
    ]
  }
};

// ============================================================================
// 智能切入点识别
// ============================================================================

class EntryPointDetector {
  // 从用户的初始回答中检测可能的切入点
  detect(userInput) {
    const signals = {
      emotionWords: [],
      timeMarkers: [],
      specificEvents: [],
      themes: []
    };

    // 检测情绪词
    const emotionPatterns = [
      { pattern: /痛苦|难过|伤心|难受|崩溃|绝望/gi, type: 'pain' },
      { pattern: /开心|快乐|兴奋|激动|骄傲/gi, type: 'joy' },
      { pattern: /害怕|恐惧|担心|焦虑|不安/gi, type: 'fear' },
      { pattern: /后悔|遗憾|抱歉|愧疚/gi, type: 'regret' },
      { pattern: /愤怒|生气|恨|不满/gi, type: 'anger' }
    ];

    emotionPatterns.forEach(({ pattern, type }) => {
      const matches = userInput.match(pattern);
      if (matches) {
        signals.emotionWords.push({ type, words: matches });
      }
    });

    // 检测时间标记
    const timePatterns = [
      { pattern: /(\d{4})年?/g, type: 'year' },
      { pattern: /(那时候|那年|当时|那时|那时我)/gi, type: 'past' },
      { pattern: /小时候|童年|青春期/gi, type: 'life_stage' },
      { pattern: /最近|现在|目前|今天/gi, type: 'present' }
    ];

    timePatterns.forEach(({ pattern, type }) => {
      const matches = userInput.match(pattern);
      if (matches) {
        signals.timeMarkers.push({ type, words: matches });
      }
    });

    // 检测主题
    Object.entries(INTERVIEW_THEMES).forEach(([themeId, theme]) => {
      const foundKeywords = theme.keywords.filter(keyword =>
        userInput.toLowerCase().includes(keyword)
      );
      if (foundKeywords.length > 0) {
        signals.themes.push({
          id: themeId,
          name: theme.name,
          keywords: foundKeywords
        });
      }
    });

    return signals;
  }

  // 生成切入点建议
  suggestEntryPoint(userInput) {
    const signals = this.detect(userInput);
    const suggestions = [];

    // 如果检测到强烈情绪，建议从情绪入手
    if (signals.emotionWords.length > 0) {
      suggestions.push({
        type: 'emotion',
        reason: '检测到强烈情绪表达',
        approach: '深入挖掘这个情绪背后的具体场景'
      });
    }

    // 如果检测到时间标记，建议从那个时间点展开
    if (signals.timeMarkers.length > 0) {
      suggestions.push({
        type: 'time',
        reason: '检测到明确的时间标记',
        approach: '从那个时间点的具体场景开始'
      });
    }

    // 如果检测到主题，建议沿该主题深入
    if (signals.themes.length > 0) {
      suggestions.push({
        type: 'theme',
        reason: `检测到主题：${signals.themes.map(t => t.name).join('、')}`,
        approach: '围绕这个主题展开深度访谈'
      });
    }

    // 如果没有明确信号，建议开放式引导
    if (suggestions.length === 0) {
      suggestions.push({
        type: 'open',
        reason: '暂未检测到明确切入点',
        approach: '使用开放式问题，让被访谈者选择最想聊的内容'
      });
    }

    return suggestions;
  }
}

// ============================================================================
// 输出生成器
// ============================================================================

function generateEntryPrompt() {
  let prompt = `# 人生故事工作台 - 灵活切入模式

## 核心理念

人生故事不必从童年开始。从被访谈者最想表达的时刻切入，让故事自然展开。

## 第一步：选择切入点引导方式

### 1. 开放式引导
让被访谈者自由选择从哪里开始：

`;

  ENTRY_POINT_QUESTIONS.open.questions.forEach((q, i) => {
    prompt += `${i + 1}. ${q}\n`;
  });

  prompt += `
### 2. 特定事件引导
从具体事件切入：

`;

  ENTRY_POINT_QUESTIONS.specific.questions.forEach((q, i) => {
    prompt += `${i + 1}. ${q}\n`;
  });

  prompt += `
### 3. 隐喻式引导
用隐喻帮助被访谈者定位自己：

`;

  ENTRY_POINT_QUESTIONS.metaphor.questions.forEach((q, i) => {
    prompt += `${i + 1}. ${q}\n`;
  });

  prompt += `
## 第二步：深入挖掘

一旦找到切入点，立即启动"细节三部曲"：
1. 事实核查 - 时间、地点、具体动作
2. 感官捕捉 - 五感细节
3. 情绪颗粒度 - 具体身心反应

## 第三步：自然延伸

根据访谈流向，灵活延伸到其他人生阶段：
- "这个经历，和你童年有什么关联吗？"
- "这件事对你后来的选择有什么影响？"
- "现在的你，回看那个时刻，有什么不同的感受？"

## 记住

- 不要急于按时间线推进
- 让故事按照情感逻辑展开
- 每个场景都要挖掘到足够的细节
- 主动关联之前提到的细节
`;

  return prompt;
}

function generateThemePrompt(themeId) {
  const theme = INTERVIEW_THEMES[themeId];
  if (!theme) {
    return "未找到该主题。可用主题：" + Object.keys(INTERVIEW_THEMES).join(', ');
  }

  let prompt = `# ${theme.name} - 深度访谈

## 切入问题

从以下问题中选择最合适的切入点：

`;

  theme.entryQuestions.forEach((q, i) => {
    prompt += `${i + 1}. ${q}\n`;
  });

  prompt += `
## 访谈指引

选择切入点后，立即进入"细节三部曲"：
1. 事实核查 - 锚定具体的时间和空间
2. 感官捕捉 - 还原场景的感官细节
3. 情绪颗粒度 - 挖掘具体的身心反应

## 自然延伸

访谈过程中，根据回答自然延伸到其他相关阶段或主题。
`;

  return prompt;
}

// ============================================================================
// 命令行界面
// ============================================================================

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    mode: args.includes('--methodology') ? 'methodology' :
          args.includes('--entry') ? 'entry' :
          args.includes('--theme') && args[args.indexOf('--theme') + 1] ? 'theme' :
          args[0] || 'help',
    theme: args.find((a, i) => a === '--theme' && args[i + 1]) ?
      args[args.indexOf('--theme') + 1] : null
  };
}

function showHelp() {
  console.log(`
人生故事工作台 - 深度访谈引擎

灵活切入模式：从任何人生阶段开始

命令：
  /story-entry          显示切入点引导
  /story-childhood      访谈：童年与启蒙
  /story-youth          访谈：青春与选择
  /story-turning        访谈：转折与突破
  /story-struggle       访谈：挣扎与矛盾
  /story-meaning        访谈：意义与使命
  /story-vulnerable     访谈：脆弱与真实
  /story-method         查看完整方法论

理念：
  - 不必从童年开始
  - 从最能触动人心的地方开始
  - 让故事按照情感逻辑展开
  - 灵活延伸到其他阶段
`);
}

function main() {
  const options = parseArgs();

  switch (options.mode) {
    case 'methodology':
      console.log(INTERVIEW_METHODOLOGY);
      break;

    case 'entry':
      console.log(generateEntryPrompt());
      break;

    case 'theme':
      if (options.theme) {
        console.log(generateThemePrompt(options.theme));
      } else {
        console.log("请指定主题，如：--theme childhood");
        console.log("\n可用主题：");
        Object.entries(INTERVIEW_THEMES).forEach(([id, theme]) => {
          console.log(`  - ${id}: ${theme.name}`);
        });
      }
      break;

    case 'help':
    default:
      showHelp();
  }
}

main();
