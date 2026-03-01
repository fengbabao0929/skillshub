#!/usr/bin/env node

/**
 * 人生故事工作台 - 写作引擎
 *
 * 核心任务：将访谈素材转化为 6000-8000 字的深度故事
 *
 * 写作理念：
 * 1. 不是简单拼接访谈记录，而是重新叙事
 * 2. 每个场景都从记忆库中提取细节（事实+感官+情绪）
 * 3. 使用文学技巧让故事有电影质感
 * 4. 保持真实性，但要有叙事张力
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// 写作方法论
// ============================================================================

const WRITING_METHODOLOGY = `
# 人生故事写作方法论

## 你的角色

你是一位拥有 20 年经验的非虚构作家，擅长将访谈素材转化为动人的深度故事。
你的作品常发表在《人物》《三联》《谷雨》等媒体。

## 核心原则

### 1. 真实性优先
- 所有细节必须来自访谈记录
- 不能编造对话或场景
- 可以调整叙事顺序，但不能虚构内容

### 2. 展示而非讲述
- 不要说"他很痛苦"，要描述"凌晨三点坐在马路牙子上"
- 不要说"那时候很艰难"，要还原那个艰难的具体场景
- 用细节让读者自己感受，而不是直接告诉读者

### 3. 情感弧线
- 故事要有情感起伏，不是平铺直叙
- 每个场景都服务于整体的情感主线
- 让读者在结尾处有一种"啊，原来如此"的顿悟

### 4. 电影质感
- 开场要有画面感
- 场景切换要有节奏
- 重要时刻要慢镜头处理

## 场景化写作的黄金法则

### 1. 定格瞬间法则
不要概括性叙述，而是定格一个具体的瞬间。
- ❌ "那年冬天我很穷"
- ✅ "那年冬天，我在便利店门前站了十分钟，手里攥着最后一个硬币，犹豫是买面包还是坐公交车"

### 2. 五感沉浸法则
每个场景至少要调动三种感官，让读者身临其境。
- 视觉：光线、颜色、形状
- 听觉：声音、沉默、回声
- 触觉：温度、质感、疼痛
- 嗅觉：气味、味道
- 本体感觉：疲惫、心跳、呼吸

### 3. 微观细节法则
从宏大叙事落到微观细节：
- 不是"整个城市都变了"
- 而是"楼下那家开了二十年的面馆，招牌上的漆掉了一半"

### 4. 动作即情感法则
通过具体动作暗示内心状态，而非直接描写情绪：
- ❌ "他内心很矛盾"
- ✅ "他的手在门把手上停住了，握紧，松开，又握紧，最终还是缩了回来"

### 5. 对话留白法则
真实对话的精髓在于未尽之言：
- 记录说话时的语气、停顿
- 注意没说出口的内容
- 捕捉对话中的潜台词

## 走心写作的三个层次

### 第一层：生理共鸣
描述身体的真实反应，让读者感同身受：
- 胸口的发紧
- 手心的汗水
- 深夜的失眠
- 突然的心跳

### 第二层：情感共振
表达人人都有但未必说出的感受：
- 对被爱的渴望
- 对孤独的恐惧
- 对意义的追寻
- 对失去的不甘

### 第三层：生命共鸣
从个人经历上升到普世价值：
- 这一切意味着什么？
- 别人能从中学到什么？
- 这个故事如何照见读者自己的人生？

## 禁止事项

❌ 使用陈词滥调（"岁月如歌""人生如梦"）
❌ 滥用排比和感叹号
❌ 过度煽情或说教
❌ 编造不存在的细节
❌ 使用"笔者""本人"等第三方视角
❌ 用形容词堆砌代替细节描写
❌ 概括性叙事跳过具体场景

## 字数分配

6000-8000 字的故事建议分配：
- 开场（500-800字）：用场景抓住读者
- 主体（4000-5500字）：3-5个关键场景
- 结尾（800-1200字）：回扣主题，给读者启发
`;

// ============================================================================
// 场景化写作模板库
// ============================================================================

const SCENE_TEMPLATES = {
  // 场景化开场模板
  openings: {
    inMediaRes: {
      name: "从事件中途开始",
      formula: "时间 + 地点 + 具体动作 + 感官细节",
      examples: [
        "凌晨三点的深圳火车站，我蹲在马路牙子上，手里那根烟燃尽了烫到手指才发现。",
        "电梯门打开的那一瞬间，我看见了那个我以为永远不会再见的人。",
        "那天下了很大的雪，我在医院走廊里来回走了二十七趟。"
      ],
      technique: "不要解释背景，直接把读者扔进场景里，让他们自己拼凑发生了什么"
    },
    sensory: {
      name: "从感官细节切入",
      formula: "一个强烈的感官细节 + 它触发的记忆",
      examples: [
        "那年夏天空气里总有一股潮湿的味道，像是要下雨，又像是永远不会下了。每次闻到这个味道，我就想起那个夏天。",
        "直到现在，听到筷子碰到瓷碗的声音，我的心还会跳漏一拍。",
        "那种被所有人注视的感觉，像是有无数根针扎在后背上。"
      ],
      technique: "选择一个能唤起强烈记忆的感官细节，用它打开整个场景"
    },
    contrast: {
      name: "对比式开场",
      formula: "现在的状态 × 某个转折时刻",
      examples: [
        "现在我的公司估值过亿，但经常还是会想起2015年那个冬天，口袋里只有200块钱。",
        "我现在能坦然地谈论这件事了。但五年前，光是想起这件事，我就会呕吐。",
        "人们都说我是乐观主义者。但他们没见过2018年的那个晚上。"
      ],
      technique: "用现在的状态和过去的某个时刻形成强烈对比，制造悬念"
    }
  },

  // 场景展开技巧
  development: {
    cinematicZoom: {
      name: "电影式推近镜头",
      layers: [
        "远景：交代环境（天气、地点、氛围）",
        "中景：人物入场（谁在那里，在做什么）",
        "近景：具体动作（手的动作、眼神的变化）",
        "特写：微观细节（一颗扣子、一道伤痕、一个表情）"
      ],
      example: "那是2015年冬天的北京。（远景）我在地铁口站了很久，看着人来人往。（中景）手插在口袋里，握紧那张皱巴巴的纸条。（近景）纸条上写着一个月薪两千的工作机会，我的手在发抖。（特写）"
    },
    frozenMoment: {
      name: "冻结瞬间法",
      technique: "选择一个关键时刻，像放慢镜头一样拆解每一个微小动作",
      structure: [
        "定格：时间仿佛停止",
        "拆解：把一个动作拆成三到四个细节",
        "延宕：描述内心的感受和思考",
        "释放：动作完成，场景继续"
      ],
      example: "我的手放在门把手上。金属很凉。我握紧，松开，又握紧。门后是我生活了七年的公司，门后是我从未去过的新生活。我能听到自己的心跳，一声，两声。三秒钟后，我转动把手，推开了门。"
    },
    sensoryImmersion: {
      name: "五感沉浸法",
      required: "每个场景至少调用三种感官",
      checklist: [
        "视觉：光线、颜色、形状、动态",
        "听觉：说话声、环境音、沉默",
        "触觉：温度、质感、疼痛、震动",
        "嗅觉：气味、味道",
        "本体感：心跳、呼吸、疲惫、紧张"
      ],
      example: "出租屋很小，只有十平米。窗外的霓虹灯透过窗帘，在墙上投下一块红色的光斑。隔壁的电视声、楼下的汽车喇叭、楼上邻居的脚步声，都混在一起。房间里有一股霉味，混合着我三天没洗的衣服的味道。我躺在床上，能感觉到心脏撞击胸腔的声音。"
    }
  },

  // 情感渲染技巧
  emotionalDepth: {
    physicalResonance: {
      name: "生理共鸣",
      principle: "情绪总会在身体上留下痕迹",
      techniques: [
        "描述心跳、呼吸、体温的变化",
        "注意手、脚、眼睛的细微动作",
        "记录身体的不适感：疼痛、麻木、颤抖"
      ],
      examples: [
        "听到那个消息，我的胃像是被人打了一拳。",
        "我想说话，但喉咙像是被什么东西堵住了。",
        "那天晚上，我的手抖到拿不住杯子。"
      ]
    },
    unsaidWords: {
      name: "未尽之言",
      principle: "最动人的部分往往是没说出口的",
      techniques: [
        "记录对话中的停顿和犹豫",
        "注意说话人的语气和表情",
        "捕捉那些欲言又止的瞬间"
      ],
      examples: [
        "他说：「好吧，那你就……」他没有说完，但我明白他的意思。",
        "我想说点什么，但最后只是点了点头。",
        "「其实我……」算了，没什么。"
      ]
    },
    metaphorResonance: {
      name: "隐喻共鸣",
      principle: "用具体意象承载抽象感受",
      techniques: [
        "寻找一个能代表情绪的物体",
        "用自然景象映射内心状态",
        "用动作隐喻心理变化"
      ],
      examples: [
        "愤怒在我心里像一盆烧了三天三夜的火。",
        "我就像一只被扔进陌生森林的鸟，不知道该往哪里飞。",
        "那句话是一颗种子，在我心里发了芽。"
      ]
    }
  },

  // 节奏控制
  pacing: {
    slowMotion: {
      name: "慢镜头",
      when: "关键时刻、情感高潮、重大决定前",
      how: [
        "拆解一个简单动作为多个步骤",
        "放大感官细节",
        "延长主观时间感受",
        "插入内心独白"
      ],
      example: "我拿起手机。屏幕亮了。又暗了。我再次解锁。手指在键盘上悬停。删掉。重打。又删掉。最后，我按下了发送键。"
    },
    montage: {
      name: "蒙太奇快剪",
      when: "时间跨度大、状态变化、重复场景",
      how: [
        "用相似的元素串联不同场景",
        "快速切换场景片段",
        "留下意象空白让读者填补"
      ],
      example: "第一个月，我每天失眠到凌晨。第三个月，我开始习惯一个人吃饭。半年后，我能在街上遇到他，点头说你好。一年过去了，我差点忘了他的样子。"
    },
    pause: {
      name: "留白",
      when: "情感沉淀、转折前奏、重要时刻之后",
      how: [
        "用极短的段落",
        "留出空白行",
        "让读者有呼吸和思考的空间"
      ],
      example: "电梯到了。\n\n我没进去。"
    }
  }
};

// ============================================================================
// 场景重建器
// ============================================================================

class SceneReconstructor {
  constructor(memoryData) {
    this.memory = memoryData;
  }

  // 从记忆中提取场景所需的全部细节
  reconstructScene(sceneId) {
    const scene = {
      facts: this.extractFacts(sceneId),
      sensory: this.extractSensory(sceneId),
      emotions: this.extractEmotions(sceneId),
      dialogue: this.extractDialogue(sceneId),
      context: this.extractContext(sceneId)
    };

    return scene;
  }

  extractFacts(sceneId) {
    // 从记忆库提取事实细节
    const facts = this.memory.facts?.[sceneId] || [];
    return facts.map(f => f.content);
  }

  extractSensory(sceneId) {
    // 提取感官细节，按五感分类
    const sensory = this.memory.sensory?.[sceneId] || [];
    return {
      visual: sensory.filter(s => s.senseType === 'visual').map(s => s.content),
      auditory: sensory.filter(s => s.senseType === 'auditory').map(s => s.content),
      olfactory: sensory.filter(s => s.senseType === 'olfactory').map(s => s.content),
      tactile: sensory.filter(s => s.senseType === 'tactile').map(s => s.content),
      gustatory: sensory.filter(s => s.senseType === 'gustatory').map(s => s.content)
    };
  }

  extractEmotions(sceneId) {
    // 提取情绪细节
    return this.memory.emotions?.[sceneId] || [];
  }

  extractDialogue(sceneId) {
    // 提取对话（如果有记录）
    return this.memory.dialogue?.[sceneId] || [];
  }

  extractContext(sceneId) {
    // 提取上下文信息（时间、地点、人物）
    return {
      time: this.memory.timeline?.find(t => t.questionId === sceneId),
      people: this.extractPeople(sceneId),
      weather: this.memory.weather?.[sceneId]
    };
  }

  extractPeople(sceneId) {
    // 提取场景中出现的人物
    const people = [];
    Object.entries(this.memory.relationships || {}).forEach(([name, data]) => {
      const relevantMention = data.mentions.find(m => m.questionId === sceneId);
      if (relevantMention) {
        people.push({ name, context: relevantMention.context });
      }
    });
    return people;
  }

  // 生成场景写作提示（增强版：场景化 + 走心）
  generateScenePrompt(sceneId, styleHint = '') {
    const scene = this.reconstructScene(sceneId);

    let prompt = `## 场景素材\n\n`;

    // 事实框架
    if (scene.facts.length > 0) {
      prompt += `**事实框架**:\n`;
      scene.facts.forEach(f => prompt += `- ${f}\n`);
      prompt += `\n`;
    }

    // 感官细节
    const hasSensory = Object.values(scene.sensory).some(arr => arr.length > 0);
    if (hasSensory) {
      prompt += `**感官细节**:\n`;
      if (scene.sensory.visual.length > 0) prompt += `- 视觉: ${scene.sensory.visual.join('; ')}\n`;
      if (scene.sensory.auditory.length > 0) prompt += `- 听觉: ${scene.sensory.auditory.join('; ')}\n`;
      if (scene.sensory.olfactory.length > 0) prompt += `- 嗅觉: ${scene.sensory.olfactory.join('; ')}\n`;
      if (scene.sensory.tactile.length > 0) prompt += `- 触觉: ${scene.sensory.tactile.join('; ')}\n`;
      if (scene.sensory.gustatory.length > 0) prompt += `- 味觉: ${scene.sensory.gustatory.join('; ')}\n`;
      prompt += `\n`;
    }

    // 情绪细节
    if (scene.emotions.length > 0) {
      prompt += `**情绪体验**:\n`;
      scene.emotions.forEach(e => prompt += `- ${e.content || e}\n`);
      prompt += `\n`;
    }

    // 场景写作指导（全新增强版）
    prompt += `**场景化写作要求**:\n\n`;
    prompt += `### 必须执行的写作技巧\n\n`;
    prompt += `**1. 定格一个具体瞬间**\n`;
    prompt += `- 不要概括性叙事（"那年很艰难"）\n`;
    prompt += `- 定格在一个具体的时间点（"2015年12月3日的晚上"）\n`;
    prompt += `- 描述一个具体的动作（"我站在便利店门前，攥着最后一个硬币"）\n\n`;

    prompt += `**2. 五感沉浸（至少调用三种感官）**\n`;
    const availableSenses = [];
    if (scene.sensory.visual.length > 0) availableSenses.push("视觉：" + scene.sensory.visual[0]);
    if (scene.sensory.auditory.length > 0) availableSenses.push("听觉：" + scene.sensory.auditory[0]);
    if (scene.sensory.tactile.length > 0) availableSenses.push("触觉：" + scene.sensory.tactile[0]);
    if (scene.sensory.olfactory.length > 0) availableSenses.push("嗅觉：" + scene.sensory.olfactory[0]);
    if (availableSenses.length > 0) {
      prompt += `- 可用素材：${availableSenses.join('、')}\n`;
    }
    prompt += `- 补充缺失的感官细节，让场景立体化\n\n`;

    prompt += `**3. 动作即情感**\n`;
    prompt += `- 不要直接说"他很痛苦/矛盾/纠结"\n`;
    prompt += `- 通过具体动作暗示内心状态\n`;
    prompt += `- 例："他的手在门把手上停住了，握紧，松开，又握紧"\n\n`;

    prompt += `**4. 生理共鸣**\n`;
    prompt += `- 描述情绪在身体上的反应\n`;
    prompt += `- 心跳、呼吸、体温、手抖、胃疼等\n\n`;

    prompt += `**5. 未尽之言**\n`;
    if (scene.dialogue.length > 0) {
      prompt += `- 可用对话素材：${scene.dialogue.map(d => d.content).join('; ')}\n`;
    }
    prompt += `- 记录对话中的停顿、犹豫、潜台词\n`;
    prompt += `- 注意没说出口的内容\n\n`;

    prompt += `### 结构要求\n\n`;
    prompt += `**电影式镜头推近**：\n`;
    prompt += `1. 远景（2-3句）：交代环境（天气、地点、氛围）\n`;
    prompt += `2. 中景（3-4句）：人物在场，在做什么\n`;
    prompt += `3. 近景（4-5句）：具体动作，手势、眼神\n`;
    prompt += `4. 特写（2-3句）：微观细节（扣子、伤痕、表情）\n`;
    prompt += `5. 内心（2-3句）：此时此刻的真实感受\n\n`;

    prompt += `### 走心要素\n\n`;
    prompt += `**第一层：生理共鸣** - 让读者身体上有反应\n`;
    prompt += `**第二层：情感共振** - 表达人人都有但未必说出的感受\n`;
    prompt += `**第三层：生命共鸣** - 从个人经历上升到普世价值\n\n`;

    prompt += `### 字数与风格\n\n`;
    prompt += `- 目标字数：800-1200字\n`;
    prompt += `- 语调：${styleHint || '具体、生动、克制'}\n`;
    prompt += `- 禁止：形容词堆砌、概括性叙事、直接描写情绪\n`;

    return prompt;
  }

  // 新增：生成开场场景的专门提示
  generateOpeningPrompt(sceneId) {
    const scene = this.reconstructScene(sceneId);
    let prompt = `## 开场场景写作指南\n\n`;

    prompt += `**目标**：用场景抓住读者，让他们欲罢不能\n\n`;

    prompt += `### 三种开场方式（选其一）\n\n`;

    prompt += `**方式一：从事件中途开始（In Media Res）**\n`;
    prompt += `公式：时间 + 地点 + 具体动作 + 感官细节\n`;
    prompt += `例：凌晨三点的深圳火车站，我蹲在马路牙子上，手里那根烟燃尽了烫到手指才发现。\n\n`;

    prompt += `**方式二：从感官细节切入**\n`;
    prompt += `公式：一个强烈的感官细节 + 它触发的记忆\n`;
    prompt += `例：那年夏天空气里总有一股潮湿的味道，像是要下雨，又像是永远不会下了。\n\n`;

    prompt += `**方式三：对比式开场**\n`;
    prompt += `公式：现在的状态 × 某个转折时刻\n`;
    prompt += `例：现在我的公司估值过亿，但经常还是会想起2015年那个冬天，口袋里只有200块钱。\n\n`;

    prompt += `### 可用素材\n\n`;
    if (scene.facts.length > 0) {
      prompt += `**事实**：${scene.facts.slice(0, 3).join('、')}\n`;
    }
    if (Object.values(scene.sensory).some(arr => arr.length > 0)) {
      prompt += `**感官细节**：`;
      const senses = [];
      if (scene.sensory.visual.length > 0) senses.push(scene.sensory.visual[0]);
      if (scene.sensory.auditory.length > 0) senses.push(scene.sensory.auditory[0]);
      if (scene.sensory.tactile.length > 0) senses.push(scene.sensory.tactile[0]);
      prompt += senses.join('、') + '\n';
    }

    prompt += `\n**写作要求**：\n`;
    prompt += `- 字数：500-800字\n`;
    prompt += `- 不要解释背景，直接进入场景\n`;
    prompt += `- 必须有画面感，让读者能"看见"\n`;
    prompt += `- 制造悬念：让读者想知道"接下来发生了什么"\n`;

    return prompt;
  }
}

// ============================================================================
// 情感弧线分析器
// ============================================================================

class EmotionalArcAnalyzer {
  constructor(memoryData) {
    this.memory = memoryData;
  }

  // 分析整个访谈的情感走向
  analyzeArc() {
    const emotions = this.getAllEmotions();
    const timeline = this.memory.timeline || [];

    // 识别情感转折点
    const turningPoints = this.identifyTurningPoints(emotions, timeline);

    // 峰终效应分析
    const peakEnd = this.analyzePeakEnd(emotions, timeline);

    // 构建情感弧线
    return {
      opening: this.determineOpeningEmotion(emotions),
      development: this.traceDevelopment(emotions, turningPoints),
      climax: this.identifyClimax(emotions, turningPoints),
      resolution: this.determineResolution(emotions),
      peakEnd: peakEnd  // 新增：峰终效应数据
    };
  }

  // 峰终效应分析（新增）
  analyzePeakEnd(emotions, timeline) {
    // 峰值：情绪最强烈的时刻
    const peaks = this.memory.peaks || [];
    const highlights = this.memory.highlights || [];

    // 确定峰值时刻
    const peakMoment = peaks.length > 0 ? peaks[0] : null;

    // 结尾：最后的感受
    const endingEmotion = emotions.length > 0 ? emotions[emotions.length - 1] : null;

    // 开头：用于形成呼应
    const openingEmotion = emotions.length > 0 ? emotions[0] : null;

    return {
      peak: peakMoment,
      ending: endingEmotion,
      opening: openingEmotion,
      hasCallResponse: this.checkCallResponse(openingEmotion, endingEmotion),
      highlights: highlights
    };
  }

  // 检查首尾呼应（用于峰终效应）
  checkCallResponse(opening, ending) {
    if (!opening || !ending) return false;

    // 简化：如果首尾情绪形成对比或升华，认为有呼应
    const openingWords = opening.content || '';
    const endingWords = ending.content || '';

    // 检查是否有明确的对比或回答关系
    const questions = ['为什么', '是什么', '怎么', '如何', '吗', '？'];
    const hasQuestion = questions.some(q => openingWords.includes(q));

    // 或者检查关键词重复（形成呼应）
    const openingKeywords = this.extractKeywords(openingWords);
    const endingKeywords = this.extractKeywords(endingWords);
    const hasOverlap = openingKeywords.some(k => endingKeywords.includes(k));

    return hasQuestion || hasOverlap;
  }

  extractKeywords(text) {
    // 简化的关键词提取
    const stopWords = ['的', '了', '是', '在', '我', '你', '他', '她', '它'];
    return text.split(/[，。！？\s]+/)
      .filter(w => w.length > 1 && !stopWords.includes(w));
  }

  getAllEmotions() {
    const all = [];
    Object.entries(this.memory.emotions || {}).forEach(([qId, emotions]) => {
      emotions.forEach(e => all.push({ questionId: qId, ...e }));
    });
    return all.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  identifyTurningPoints(emotions, timeline) {
    // 识别情绪发生重大变化的时刻
    const points = [];
    for (let i = 1; i < emotions.length; i++) {
      const prev = emotions[i - 1];
      const curr = emotions[i];
      // 简化：如果情绪关键词发生显著变化，视为转折点
      if (this.isEmotionShift(prev.content, curr.content)) {
        points.push({ from: prev, to: curr, questionId: curr.questionId });
      }
    }
    return points;
  }

  isEmotionShift(prev, curr) {
    // 简化的情绪转换判断
    const positiveWords = ['开心', '兴奋', '骄傲', '满足', '希望'];
    const negativeWords = ['痛苦', '难过', '绝望', '害怕', '焦虑'];

    const prevPositive = positiveWords.some(w => prev.includes(w));
    const currPositive = positiveWords.some(w => curr.includes(w));
    const prevNegative = negativeWords.some(w => prev.includes(w));
    const currNegative = negativeWords.some(w => curr.includes(w));

    return (prevPositive && currNegative) || (prevNegative && currPositive);
  }

  determineOpeningEmotion(emotions) {
    return emotions.length > 0 ? emotions[0] : null;
  }

  traceDevelopment(emotions, turningPoints) {
    return {
      phases: turningPoints.length + 1,
      turningPoints: turningPoints.map(tp => ({
        questionId: tp.questionId,
        from: tp.from.content,
        to: tp.to.content
      }))
    };
  }

  identifyClimax(emotions, turningPoints) {
    // 找到情绪最强烈的时刻
    // 简化：选择转折点中最突出的
    return turningPoints.length > 0 ? turningPoints[Math.floor(turningPoints.length / 2)] : null;
  }

  determineResolution(emotions) {
    return emotions.length > 0 ? emotions[emotions.length - 1] : null;
  }
}

// ============================================================================
// 故事架构师
// ============================================================================

class StoryArchitect {
  constructor(memoryData) {
    this.memory = memoryData;
    this.sceneReconstructor = new SceneReconstructor(memoryData);
    this.arcAnalyzer = new EmotionalArcAnalyzer(memoryData);
  }

  // 设计故事结构
  designStructure(style) {
    const arc = this.arcAnalyzer.analyzeArc();
    const keyScenes = this.selectKeyScenes();

    return {
      style,
      arc,
      scenes: keyScenes,
      wordCountAllocation: this.allocateWordCount(keyScenes.length)
    };
  }

  selectKeyScenes() {
    // 选择最关键的 3-5 个场景
    // 基于素材丰富度和情感重要性
    const allSceneIds = new Set([
      ...Object.keys(this.memory.facts || {}),
      ...Object.keys(this.memory.emotions || {})
    ]);

    // 简化：返回所有有素材的场景
    return Array.from(allSceneIds);
  }

  allocateWordCount(sceneCount) {
    const total = 7000; // 目标字数
    const opening = 600;
    const ending = 900;
    const body = total - opening - ending;
    const perScene = Math.floor(body / sceneCount);

    return { opening, perScene, ending, total };
  }

  // 生成完整写作指令
  generateWritingPrompt(style = 'hero') {
    const structure = this.designStructure(style);
    const styleConfig = this.getStyleConfig(style);

    let prompt = WRITING_METHODOLOGY;
    prompt += `\n\n${this.generateStylePrompt(styleConfig)}\n\n`;
    prompt += `# 写作任务\n\n`;
    prompt += `## 目标字数: ${structure.wordCountAllocation.total} 字\n\n`;

    // 峰终效应指导（新增）
    if (structure.arc.peakEnd) {
      prompt += `## 峰终效应应用（重要）\n\n`;
      const { peak, opening, ending, hasCallResponse, highlights } = structure.arc.peakEnd;

      if (highlights && highlights.length > 0) {
        prompt += `### 高光时刻（必须重点描写）\n\n`;
        highlights.forEach((h, i) => {
          prompt += `${i + 1}. ${h.description}\n`;
          if (h.reason) prompt += `   原因: ${h.reason}\n`;
        });
        prompt += `\n`;
        prompt += `**注意**: 高光时刻的描写应占全文 30-40% 篇幅，这是读者最期待的内容。\n\n`;
      }

      if (peak) {
        prompt += `### 情绪峰值时刻\n\n`;
        prompt += `- 峰值场景: ${peak.description || '待识别'}\n`;
        prompt += `- 峰值强度: ${peak.intensity || 'medium'}\n`;
        prompt += `\n**写作指导**: 这是最强烈的情绪时刻，需要用慢镜头技巧细致描写。\n\n`;
      }

      if (hasCallResponse) {
        prompt += `### 首尾呼应设计\n\n`;
        prompt += `- 开场关键词: ${opening?.content?.slice(0, 50) || '待定'}...\n`;
        prompt += `- 结尾关键词: ${ending?.content?.slice(0, 50) || '待定'}...\n`;
        prompt += `\n**写作指导**: 确保结尾能回答或呼应开场提出的问题，让读者有完整感。\n\n`;
      }
    }

    prompt += `## 情感弧线\n\n`;
    prompt += `- 开场情感: ${structure.arc.opening?.content || '待定'}\n`;
    prompt += `- 中间转折: ${structure.arc.development.turningPoints.map(t => t.to).join(' → ')}\n`;
    prompt += `- 结尾情感: ${structure.arc.resolution?.content || '待定'}\n\n`;

    prompt += `## 场景清单\n\n`;
    structure.scenes.forEach((sceneId, index) => {
      prompt += `### 场景 ${index + 1}\n\n`;
      prompt += this.sceneReconstructor.generateScenePrompt(sceneId, styleConfig.tone);
      prompt += `\n`;
    });

    prompt += `## 写作流程\n\n`;
    prompt += `1. **开场（${structure.wordCountAllocation.opening}字）**: 使用${styleConfig.opening}技巧\n`;
    prompt += `2. **主体场景（每个${structure.wordCountAllocation.perScene}字）**: 依次展开上述场景\n`;
    prompt += `3. **结尾（${structure.wordCountAllocation.ending}字）**: ${styleConfig.ending}\n\n`;
    prompt += `**特别提醒**: 高光时刻必须有足够篇幅，情绪峰值要用慢镜头，结尾要呼应开场。\n\n`;

    prompt += `## 场景化写作核心技巧（必须执行）\n\n`;
    prompt += `### 1. 定格瞬间法则\n`;
    prompt += `- ❌ "那年冬天我很穷"\n`;
    prompt += `- ✅ "那年冬天，我在便利店门前站了十分钟，手里攥着最后一个硬币，犹豫是买面包还是坐公交车"\n\n`;

    prompt += `### 2. 五感沉浸法则\n`;
    prompt += `- 每个场景至少调动三种感官\n`;
    prompt += `- 视觉：光线、颜色、形状\n`;
    prompt += `- 听觉：声音、沉默、回声\n`;
    prompt += `- 触觉：温度、质感、疼痛\n\n`;

    prompt += `### 3. 动作即情感法则\n`;
    prompt += `- ❌ "他内心很矛盾"\n`;
    prompt += `- ✅ "他的手在门把手上停住了，握紧，松开，又握紧，最终还是缩了回来"\n\n`;

    prompt += `### 4. 走心写作三层次\n`;
    prompt += `- 第一层：生理共鸣（心跳、呼吸、手抖）\n`;
    prompt += `- 第二层：情感共振（人人都有但未必说出的感受）\n`;
    prompt += `- 第三层：生命共鸣（从个人经历上升到普世价值）\n\n`;

    prompt += `## 禁止事项\n\n`;
    prompt += `❌ 概括性叙事（跳过具体场景）\n`;
    prompt += `❌ 形容词堆砌代替细节描写\n`;
    prompt += `❌ 直接描写情绪（"他很痛苦"）\n`;
    prompt += `❌ 陈词滥调（"岁月如歌""人生如梦"）\n`;
    prompt += `❌ 过度煽情或说教\n\n`;

    prompt += `## 重要提醒\n\n`;
    prompt += `- 每个场景必须使用记忆库中的细节\n`;
    prompt += `- 场景之间要有自然的过渡\n`;
    prompt += `- 全文服务于一个核心主题\n`;
    prompt += `- 避免说教，让故事自己说话\n`;
    prompt += `- 用具体细节让读者"看见"，而非直接"告诉"\n`;

    return prompt;
  }

  getStyleConfig(style) {
    const styles = {
      hero: {
        name: "英雄之旅",
        tone: "有力量感，节奏紧凑",
        opening: "场景化开场（从关键场景切入）",
        ending: "归来与启发（当下的意义）",
        techniques: ["危机-转机结构", "对比手法", "慢镜头高潮"],
        sceneFocus: "每个场景都要突出人物的主动性和选择的重量",
        emotionalDepth: "展现从困境到突破的内在转变"
      },
      intimate: {
        name: "私密对话",
        tone: "温柔、真诚",
        opening: "第二人称开场（「你有没有...」）",
        ending: "给读者的启发",
        techniques: ["自我暴露", "情感共鸣", "对话感"],
        sceneFocus: "聚焦于那些脆弱、真实的瞬间",
        emotionalDepth: "分享那些难以启齿的感受，让读者感觉被理解"
      },
      philosophical: {
        name: "哲思风格",
        tone: "理性、思辨",
        opening: "以问题或悖论开场",
        ending: "开放性思考",
        techniques: ["认知对比", "思辨性展开", "留白"],
        sceneFocus: "选择能触发思考的场景，而非单纯叙事",
        emotionalDepth: "从个人经历提炼出普世性的洞察"
      },
      // 新增风格
      narrative: {
        name: "叙事小说",
        tone: "文学性、沉浸感强",
        opening: "从细节切入，用小说笔法展开",
        ending: "余韵悠长，留有想象空间",
        techniques: ["象征性意象", "伏笔回收", "氛围渲染"],
        sceneFocus: "用小说的笔法还原真实故事，注重细节和氛围",
        emotionalDepth: "通过细节和意象暗示情感，而非直接抒发"
      },
      confession: {
        name: "忏悔录",
        tone: "坦诚、反思、救赎",
        opening: "从错误或遗憾开始",
        ending: "带着伤痕的智慧与和解",
        techniques: ["自我审视", "不加遮掩的暴露", "反思性升华"],
        sceneFocus: "直面那些不光彩的时刻，展现人性的复杂",
        emotionalDepth: "承认软弱和错误，在忏悔中寻找和解与成长"
      },
      business: {
        name: "商业洞察",
        tone: "专业、精炼、可行动",
        opening: "用一个具体的商业困境切入",
        ending: "给创业者的具体建议",
        techniques: ["问题-方案结构", "数据支撑", "经验提炼"],
        sceneFocus: "聚焦商业决策的关键时刻和背后的思考",
        emotionalDepth: "从个人商业经历中提炼可复用的方法论"
      },
      humorous: {
        name: "自嘲幽默",
        tone: "轻松、自嘲、有温度",
        opening: "用一个荒谬或尴尬的瞬间开场",
        ending: "笑着流泪的温暖",
        techniques: ["反讽自嘲", "夸张对比", "反转结构"],
        sceneFocus: "用幽默的方式讲述困境，让沉重话题变轻松",
        emotionalDepth: "用笑声包裹泪水，用自嘲化解沉重"
      },
      minimal: {
        name: "极简主义",
        tone: "克制、留白、字字珠玑",
        opening: "一句话开场，干净利落",
        ending: "戛然而止，余音绕梁",
        techniques: ["短句节奏", "大量留白", "意象并置"],
        sceneFocus: "去掉所有不必要的修饰，只保留最核心的细节",
        emotionalDepth: "克制中见深情，留白中有余韵"
      },
      lyric: {
        name: "诗意散文",
        tone: "优美、感伤、如诗如画",
        opening: "用一个富有诗意的意象切入",
        ending: "意犹未尽，如诗章收尾",
        techniques: ["通感修辞", "意象叠加", "韵律节奏"],
        sceneFocus: "用诗的语言和节奏讲述故事，注重语言的美感",
        emotionalDepth: "让情感在诗意的语言中自然流淌"
      },
      // 成交型叙事（营销专用）
      conversion: {
        name: "成交型叙事",
        tone: "真诚、紧迫、有说服力",
        opening: "先展示光鲜/常态，然后突然抛出危机（制造反差）",
        ending: "紧迫行动呼吁（限时/限额/关闭理性）",
        techniques: ["痛点共鸣", "细节扎心", "反认知转折", "产品救赎", "紧迫行动"],
        sceneFocus: "只截取'危机前后'那一段最痛的经历，不要写流水账",
        emotionalDepth: "用真实的'无力感'和'羞愧感'打动读者，激发杏仁核情绪反应"
      },
      // 成交型叙事-职场版
      career_pitch: {
        name: "职场成交型",
        tone: "专业、有共鸣、促行动",
        opening: "曾经的光环 vs 突然的职场危机（裁员/瓶颈/迷茫）",
        ending: "立即行动，别等下次危机",
        techniques: ["职场扎心场景", "反认知职业理念", "能力救赎", "紧迫感"],
        sceneFocus: "深夜加班、不敢请假、房贷焦虑、同事眼神等具体职场场景",
        emotionalDepth: "唤醒职场人的安全感缺失，用你的转型故事给他们希望"
      },
      // 成交型叙事-教育版
      education_pitch: {
        name: "教育成交型",
        tone: "理解家长、真诚、有温度",
        opening: "曾经以为的教育正确 vs 孩子的厌学/叛逆现实",
        ending: "别让孩子的问题成为遗憾，立即行动",
        techniques: ["亲子痛点", "深夜反思", "教育理念翻转", "方法救赎", "行动呼吁"],
        sceneFocus: "深夜吼娃后的自责、孩子关上的房门、家长群的沉默等",
        emotionalDepth: "用家长的愧疚和无力感打动，然后给出希望和出路"
      }
    };

    return styles[style] || styles.hero;
  }

  generateStylePrompt(style) {
    return `## 风格：${style.name}

**语调**: ${style.tone}

**开场技巧**: ${style.opening}

**结尾方式**: ${style.ending}

**核心技巧**: ${style.techniques.join('、')}

**场景聚焦**: ${style.sceneFocus}

**情感深度**: ${style.emotionalDepth}`;
  }
}

// ============================================================================
// 命令行接口
// ============================================================================

function loadMemoryData() {
  const memoryPath = path.join(__dirname, '..', '.interview-data', 'memory.db');
  if (fs.existsSync(memoryPath)) {
    return JSON.parse(fs.readFileSync(memoryPath, 'utf-8'));
  }
  return null;
}

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    action: args[0] || 'help',
    style: args.find((a, i) => a === '--style' && args[i + 1]) ?
      args[args.indexOf('--style') + 1] : 'hero',
    save: args.includes('--save')
  };
}

function main() {
  const options = parseArgs();
  const memoryData = loadMemoryData();

  if (!memoryData || Object.keys(memoryData.facts || {}).length === 0) {
    console.log(`# ⚠️ 尚未收集访谈素材\n\n`);
    console.log(`请先使用访谈命令收集素材：\n`);
    console.log(`- /story-entry    开始访谈（从任何阶段切入）\n`);
    console.log(`- /story-stats    查看已收集素材统计\n`);
    return;
  }

  const architect = new StoryArchitect(memoryData);

  switch (options.action) {
    case 'generate':
    case 'write':
      const prompt = architect.generateWritingPrompt(options.style);
      console.log(prompt);

      if (options.save) {
        const dir = path.join(__dirname, '..', 'life-stories');
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const filepath = path.join(dir, `story_${options.style}_${timestamp}.md`);
        fs.writeFileSync(filepath, prompt, 'utf-8');
        console.log(`\n✅ 已保存到: ${filepath}`);
      }
      break;

    case 'analyze':
      const arc = architect.arcAnalyzer.analyzeArc();
      console.log(`# 情感弧线分析\n\n`);
      console.log(`**开场情感**: ${arc.opening?.content || '待分析'}\n`);
      console.log(`**中间转折**: ${arc.development.turningPoints.map(t => t.to).join(' → ')}\n`);
      console.log(`**高潮时刻**: ${arc.climax?.to.content || '待分析'}\n`);
      console.log(`**结尾情感**: ${arc.resolution?.content || '待分析'}\n`);
      break;

    case 'scenes':
      console.log(`# 场景清单\n\n`);
      const scenes = architect.selectKeyScenes();
      scenes.forEach((sceneId, index) => {
        console.log(`## 场景 ${index + 1}: ${sceneId}\n`);
        console.log(architect.sceneReconstructor.generateScenePrompt(sceneId));
        console.log(`\n---\n\n`);
      });
      break;

    case 'help':
    default:
      console.log(`
人生故事工作台 - 写作引擎

用法:
  node life-story-writer.js generate [--style STYLE]  生成写作指令
  node life-story-writer.js analyze                    分析情感弧线
  node life-story-writer.js scenes                     查看场景清单
  node life-story-writer.js help                       显示帮助

风格选项:
  经典风格:
    --style hero              英雄之旅（有力量感）
    --style intimate          私密对话（温柔真诚）
    --style philosophical     哲思风格（理性思辨）

  文学风格:
    --style narrative         叙事小说（文学性、沉浸感）
    --style confession        忏悔录（坦诚反思、救赎）
    --style humorous          自嘲幽默（轻松、有温度）
    --style minimal           极简主义（克制、留白）
    --style lyric             诗意散文（优美、如诗如画）

  营销成交型（专门用于转化和成交）:
    --style conversion        成交型叙事（通用5步法）
    --style career_pitch      职场成交型（职场转型故事）
    --style education_pitch   教育成交型（亲子教育故事）

示例:
  /story-write              生成英雄之旅风格写作指令
  /story-write-conversion   生成成交型叙事写作指令
  /story-write-career       生成职场成交型写作指令
  /story-write-education    生成教育成交型写作指令
      `);
  }
}

main();
