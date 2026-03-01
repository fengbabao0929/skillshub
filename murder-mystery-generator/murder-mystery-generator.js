#!/usr/bin/env node

/**
 * 培训体验类剧本杀编写器
 * 用法: node murder-mystery-generator.js <主题> [选项]
 *
 * 示例:
 *   node murder-mystery-generator.js "职场沟通"
 *   node murder-mystery-generator.js "团队协作" --players 6 --full
 *   node murder-mystery-generator.js "项目管理" --players 8 --save
 */

const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  red: '\x1b[31m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// 剧本杀角色配置模板
const CHARACTER_TEMPLATES = {
  决策者: {
    desc: '拥有最终决策权，但面临多方压力',
    skills: ['决策能力', '风险判断', '资源调配'],
    secrets: ['隐藏的KPI压力', '上级的秘密指示', '过往的决策失误']
  },
  执行者: {
    desc: '负责具体执行，掌握一线信息',
    skills: ['执行力', '细节观察', '问题解决'],
    secrets: ['发现的流程漏洞', '未报的风险', '私下解决的问题']
  },
  监督者: {
    desc: '负责监督合规，了解规则边界',
    skills: ['合规审查', '风险识别', '规则解读'],
    secrets: ['曾经睁一只眼闭一只眼', '收受过小恩小惠', '与某人有旧交']
  },
  外部方: {
    desc: '外部合作伙伴，带来外部视角',
    skills: ['外部资源', '市场信息', '谈判能力'],
    secrets: ['与竞争对手也有接触', '隐瞒的关键信息', '别有用心的目的']
  },
  新人: {
    desc: '入职不久，看似无关但可能有关键信息',
    skills: ['新锐视角', '敏锐直觉', '信息收集'],
    secrets: ['背境不简单', '有意接近某人', '发现了不该发现的']
  },
  老员工: {
    desc: '资深员工，了解历史和潜规则',
    skills: ['经验丰富', '人脉广泛', '历史知情'],
    secrets: ['参与过过往事件', '掌握把柄', '对现状不满']
  },
  反对者: {
    desc: '对项目持保留意见，可能成为阻力',
    skills: ['批判思维', '风险意识', '影响力'],
    secrets: ['暗中破坏的计划', '真实的反对原因', '与其他势力的关系']
  },
  中立者: {
    desc: '表面上中立，实则可能有隐藏立场',
    skills: ['平衡能力', '信息枢纽', '调解技巧'],
    secrets: ['双面下注', '掌握关键证据', '真正的利益诉求']
  }
};

// 剧本杀场景配置模板
const SCENE_TEMPLATES = {
  项目启动: {
    name: '紧急项目启动会议',
    setting: '公司会议室，时间紧迫，一个重要项目需要立即启动',
    conflict: '项目存在重大风险，但各方利益相关',
    objectives: ['识别项目风险', '明确各方立场', '做出启动决策']
  },
  危机处理: {
    name: '突发危机应对',
    setting: '出现问题后的紧急会议室，情况紧急',
    conflict: '危机原因不明，责任归属不清',
    objectives: ['找出问题根源', '分配应对责任', '制定解决方案']
  },
  资源争夺: {
    name: '有限资源分配',
    setting: '预算/人力分配会议，资源有限',
    conflict: '各方都想获得更多资源，理由各异',
    objectives: ['评估资源需求', '公平分配资源', '达成共识']
  },
  合规审查: {
    name: '合规问题审查',
    setting: '内部审计或合规调查会议室',
    conflict: '发现违规线索，但真相扑朔迷离',
    objectives: ['查明违规事实', '确定责任归属', '提出改进措施']
  },
  变革推动: {
    name: '组织变革推行',
    setting: '变革方案讨论会，阻力重重',
    conflict: '变革触动利益，有人明里暗里反对',
    objectives: ['识别阻力来源', '化解反对意见', '推动变革落地']
  },
  客户谈判: {
    name: '重要客户谈判',
    setting: '客户会议室，谈判关键时刻',
    conflict: '内部意见不一，客户要求苛刻',
    objectives: ['统一内部立场', '达成有利协议', '维护客户关系']
  }
};

// 根据玩家数量推荐角色配置
function recommendCharacters(playerCount) {
  const configs = {
    4: ['决策者', '执行者', '监督者', '外部方'],
    5: ['决策者', '执行者', '监督者', '外部方', '新人'],
    6: ['决策者', '执行者', '监督者', '外部方', '老员工', '反对者'],
    7: ['决策者', '执行者', '监督者', '外部方', '新人', '老员工', '反对者'],
    8: ['决策者', '执行者', '监督者', '外部方', '新人', '老员工', '反对者', '中立者']
  };
  return configs[playerCount] || configs[8];
}

// 生成剧本标题
function generateTitles(topic) {
  const templates = [
    `《${topic}迷局：一场看不见的博弈》`,
    `《${topic}风暴：谁在说谎？》`,
    `《${topic}困局：真相只有一个》`,
    `《${topic}暗流：揭开隐藏的真相》`,
    `《${topic}时刻：生死抉择》`,
    `《${topic}迷雾：寻找破局之路》`,
    `《${topic}风云：谁主沉浮？》`,
    `《${topic}危机：信任的考验》`
  ];
  return templates.slice(0, 5).map((t, i) => `${i + 1}. ${t}`);
}

// 生成角色卡
function generateCharacterCard(roleType, roleName, topic) {
  const template = CHARACTER_TEMPLATES[roleType];
  const secrets = template.secrets.map((s, i) => `  ${i + 1}. ${s}`).join('\n');

  return `
## ${roleType}：${roleName}

### 基本信息
- **角色类型**：${roleType}
- **角色描述**：${template.desc}

### 核心能力
${template.skills.map(s => `- ${s}`).join('\n')}

### 个人目标
- **表面目标**：在${topic}中实现部门/个人利益最大化
- **隐藏目标**：[根据剧情设定]

### 秘密信息（仅自己知晓）
${secrets}

### 人际关系
- 与谁有明面上的合作关系？
- 与谁存在潜在冲突？
- 与谁有私下联系？

### 可用资源
- [列出角色可调用的资源]

### 特殊技能
- 每个角色有一个特殊技能，可在关键时刻使用一次
`;

}

// 生成剧本大纲
function generateOutline(topic, playerCount) {
  const characters = recommendCharacters(playerCount);
  const scene = SCENE_TEMPLATES[Object.keys(SCENE_TEMPLATES)[Math.floor(Math.random() * Object.keys(SCENE_TEMPLATES).length)]];

  return `
# ${topic}剧本杀：${scene.name}

## 📖 剧本概述

### 剧本背景
**场景**：${scene.setting}
**主题**：${topic}
**类型**：培训体验型剧本杀
**人数**：${playerCount}人
**时长**：2-3小时

### 核心冲突
${scene.conflict}

### 培训目标
${scene.objectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

---

## 🎭 角色列表

${characters.map((char, i) => `${i + 1}. **${char}** - ${CHARACTER_TEMPLATES[char].desc}`).join('\n')}

---

## 📜 剧情大纲

### 第一幕：开场（20分钟）

#### 1.1 剧情引入（10分钟）
- DM（主持人）介绍背景
- 分发角色卡
- 阅读个人剧本

#### 1.2 第一轮公聊（10分钟）
- 所有角色自我介绍
- 表明各自立场和诉求
- 初步建立人际关系

---

### 第二幕：冲突升级（40分钟）

#### 2.1 事件触发（10分钟）
- DM宣布突发事件
- 每人收到一条私密信息
- 形势变得更加复杂

#### 2.2 私聊环节（15分钟）
- 两两私聊，交换信息
- 寻找盟友，试探虚实
- 收集关键线索

#### 2.3 第二轮公聊（15分钟）
- 分享调查发现
- 讨论应对方案
- 初步形成阵营

---

### 第三幕：高潮对决（40分钟）

#### 3.1 关键事件（10分钟）
- 新的危机出现
- 必须做出决策
- 真相即将揭晓

#### 3.2 激烈辩论（20分钟）
- 各方陈述观点
- 揭露隐藏信息
- 投票或决策

#### 3.3 真相揭露（10分钟）
- DM公布真相
- 回顾关键线索
- 意想不到的反转

---

### 第四幕：复盘总结（30分钟）

#### 4.1 角色复盘（10分钟）
- 每个角色分享自己的真实目的
- 解释关键行为的动机
- 回顾关键决策点

#### 4.2 培训要点总结（15分钟）
- ${topic}的关键知识点
- 实际工作中的启示
- 可转移应用的技能

#### 4.3 反思与讨论（5分钟）
- 如果重来一次会怎么做？
- 这个场景在实际工作中如何避免？

---

## 🎯 培训要点映射

### ${topic}知识点
- [列出3-5个核心知识点]

### 能力锻炼
- **沟通协调**：如何在利益冲突中达成共识
- **信息收集**：如何有效获取和验证信息
- **决策能力**：如何在信息不完备时做出决策
- **团队协作**：如何在复杂关系中建立信任

### 行为反思
- 哪些行为导致了问题？
- 有哪些更好的处理方式？
- 如何预防类似情况？

---

## 📦 所需材料

### DM物料
- 剧本总纲
- 各角色秘密信息卡
- 事件触发卡
- 真相说明
- 线索卡

### 玩家物料
- 角色卡（含个人信息、秘密、目标）
- 个人剧本（背景故事）
- 线索记录表
- 笔记工具

### 场地要求
- 一个安静的空间
- 便于分组私聊的多个小区域
- 白板或大纸（用于梳理信息）

---

## 📋 游戏规则

### 基本规则
1. **角色扮演**：全程保持角色状态，不要出戏
2. **信息真实性**：可以说谎，但不能泄露超出角色的信息
3. **隐私保护**：私密信息只能在指定环节分享
4. **时间控制**：严格遵守每个环节的时间限制

### 胜利条件
- **个人胜利**：实现自己的隐藏目标
- **团队胜利**：${scene.objectives[0]}

### 评分维度
- 信息收集能力
- 沟通协调能力
- 决策质量
- 团队贡献度
`;
}

// 生成完整剧本
function generateFullScript(topic, playerCount) {
  const characters = recommendCharacters(playerCount);
  const scene = SCENE_TEMPLATES[Object.keys(SCENE_TEMPLATES)[Math.floor(Math.random() * Object.keys(SCENE_TEMPLATES).length)]];
  let script = generateOutline(topic, playerCount);

  script += '\n\n---\n\n';
  script += '# 🎭 详细角色剧本\n\n';

  characters.forEach((charType, index) => {
    script += generateCharacterCard(charType, `角色${index + 1}`, topic);
    script += '\n---\n\n';
  });

  script += '# 🎬 主持人（DM）手册\n\n';

  script += '## 剧情时间线\n\n';
  script += '### 开场前准备\n';
  script += '- [ ] 准备所有角色卡\n';
  script += '- [ ] 准备私密信息卡\n';
  script += '- [ ] 准备线索卡\n';
  script += '- [ ] 熟悉剧本剧情\n\n';

  script += '### 真相设定（仅DM可见）\n\n';
  script += '#### 事件真相\n';
  script += '[此处填写事件的真相，这是整个剧本的核心]\n\n';
  script += '#### 每个角色的真实目的\n';
  characters.forEach((char, i) => {
    script += `- **${char}**：[真实目的]\n`;
  });

  script += '\n#### 关键线索\n';
  script += '- 线索1：[描述线索内容及发现者]\n';
  script += '- 线索2：[描述线索内容及发现者]\n';
  script += '- 线索3：[描述线索内容及发现者]\n\n';

  script += '## 私密信息分发表\n\n';
  script += '| 时间 | 对象 | 内容 | 目的 |\n';
  script += '|------|------|------|------|\n';
  script += '| 第一幕私聊前 | 全员 | [私密信息内容] | [为什么给这个信息] |\n';
  script += '| 第二幕开始 | 特定角色 | [私密信息内容] | [为什么给这个信息] |\n\n';

  script += '## 主持人注意事项\n\n';
  script += '### 时间控制\n';
  script += '- 严格把控各环节时间\n';
  script += '- 在讨论陷入僵局时给出提示\n';
  script += '- 确保每个环节目标达成\n\n';

  script += '### 引导技巧\n';
  script += '- 观察玩家状态，适时推动剧情\n';
  script += '- 鼓励内向玩家参与\n';
  script += '- 避免直接给出答案，而是引导思考\n\n';

  script += '### 应急处理\n';
  script += '- 如果玩家卡壳：提供备选话题或线索\n';
  script += '- 如果剧情偏离：温和引导回主线\n';
  script += '- 如果时间不足：压缩环节但保证核心体验\n\n';

  script += '## 复盘要点\n\n';
  script += `### 与${topic}相关的核心反思\n`;
  script += '1. 引导玩家思考：这个场景在实际工作中是否可能发生？\n';
  script += `2. 引导玩家思考：${topic}的关键要点是什么？\n`;
  script += '3. 引导玩家思考：如何将剧本中的经验应用到实际工作？\n\n';

  return script;
}

// 主函数
function main() {
  const args = process.argv.slice(2);
  const topic = args[0];

  const options = {
    players: 6,
    full: args.includes('--full'),
    save: args.includes('--save'),
    outlineOnly: args.includes('--outline-only')
  };

  const playersIndex = args.indexOf('--players');
  if (playersIndex !== -1 && args[playersIndex + 1]) {
    options.players = parseInt(args[playersIndex + 1]) || 6;
    if (options.players < 4) options.players = 4;
    if (options.players > 8) options.players = 8;
  }

  if (!topic) {
    console.log('');
    console.log(colorize('╔══════════════════════════════════════╗', 'cyan'));
    console.log(colorize('║      培训体验类剧本杀编写器         ║', 'cyan'));
    console.log(colorize('╚══════════════════════════════════════╝', 'cyan'));
    console.log('');
    console.log(colorize('用法: node murder-mystery-generator.js <主题> [选项]', 'yellow'));
    console.log('');
    console.log('选项:');
    console.log('  --players <数量>  玩家数量（4-8人，默认6人）');
    console.log('  --outline-only   仅生成大纲');
    console.log('  --full           生成完整剧本（含角色卡）');
    console.log('  --save           保存到文件');
    console.log('');
    console.log('示例:');
    console.log('  node murder-mystery-generator.js "职场沟通"');
    console.log('  node murder-mystery-generator.js "团队协作" --players 8 --full');
    console.log('  node murder-mystery-generator.js "项目管理" --full --save');
    console.log('');
    console.log(colorize('剧本主题推荐:', 'green'));
    console.log('  职场沟通、团队协作、项目管理、危机处理、');
    console.log('  冲突管理、领导力、谈判技巧、合规管理、');
    console.log('  变革管理、跨部门协作等');
    console.log('');
    process.exit(1);
  }

  console.log('');
  console.log(colorize('╔══════════════════════════════════════╗', 'cyan'));
  console.log(colorize('║      培训体验类剧本杀编写器         ║', 'cyan'));
  console.log(colorize('╚══════════════════════════════════════╝', 'cyan'));
  console.log('');
  console.log(colorize(`📖 剧本主题: ${topic}`, 'bright'));
  console.log(colorize(`👥 玩家数量: ${options.players}人`, 'bright'));
  console.log('');

  const content = options.full
    ? generateFullScript(topic, options.players)
    : generateOutline(topic, options.players);

  console.log(content);

  console.log('');
  console.log(colorize('────────────────────────────────────', 'cyan'));
  console.log(colorize('提示: 使用 --full 生成完整剧本（含角色卡）', 'green'));
  console.log(colorize('提示: 使用 --save 保存到文件', 'green'));
  console.log(colorize('────────────────────────────────────', 'cyan'));
  console.log('');

  if (options.save) {
    const safeTopic = topic.replace(/[<>:"/\\|?*]/g, '_');
    const filename = `murder_mystery_${safeTopic}_${options.players}players_${Date.now()}.md`;
    fs.writeFileSync(filename, content, 'utf-8');
    console.log(colorize(`✓ 已保存到: ${filename}`, 'green'));
    console.log('');
  }
}

main();
