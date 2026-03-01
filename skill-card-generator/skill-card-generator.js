#!/usr/bin/env node

/**
 * 剧本杀技能卡生成器
 * 用法: node skill-card-generator.js [选项]
 *
 * 示例:
 *   node skill-card-generator.js --role 张总
 *   node skill-card-generator.js --all
 *   node skill-card-generator.js --format markdown --save
 */

const fs = require('fs');
const path = require('path');

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

const ROLE_SKILLS = {
  张总: [
    {
      name: '权威施压',
      type: '防御型',
      apCost: 2,
      effect: '指定1人本回合不能对你使用"施压质询"',
      description: '利用CFO的权威地位，压制下属的质疑',
      usage: '在私聊或公聊时声明使用，指定目标角色'
    },
    {
      name: '利益诱惑',
      type: '交易型',
      apCost: 2,
      effect: '指定1人，若接受你的提议，双方各+2AP',
      description: '用奖金、晋升等利益诱惑他人合作',
      usage: '私下向某人提出利益交换，对方同意后生效'
    },
    {
      name: '转移矛盾',
      type: '攻击型',
      apCost: 3,
      effect: '强制转移公众注意力到另一角色身上',
      description: '将问题引向其他人，缓解自己的压力',
      usage: '在公聊时使用，引导大家关注另一个角色'
    },
    {
      name: 'CEO授权',
      type: '防御型',
      apCost: 3,
      effect: '抵抗1次"施压质询"，不透露信息',
      description: '声称得到CEO授权，拒绝回答问题',
      usage: '在被施压时使用，展示"授权"证据'
    }
  ],
  小李: [
    {
      name: '客户关系',
      type: '辅助型',
      apCost: 1,
      effect: '与客户通话，获取1条客户方面信息',
      description: '利用与客户的私人关系，获取信息',
      usage: '声明使用后，DM提供1条客户相关信息'
    },
    {
      name: '业绩压力',
      type: '防御型',
      apCost: 2,
      effect: '情感牌，使1人对你同情，本轮不攻击',
      description: '展示业绩压力，博取同情',
      usage: '在公聊时使用，描述自己的业绩压力'
    },
    {
      name: '甩锅推责',
      type: '防御型',
      apCost: 2,
      effect: '将责任推给法务部"流程太慢"',
      description: '声称是法务流程问题，导致违规操作',
      usage: '在被质疑时使用，指责法务部流程'
    },
    {
      name: '私下交易',
      type: '交易型',
      apCost: 3,
      effect: '与1人私下达成协议，交换保密信息',
      description: '私下与某人达成交易，互相保护',
      usage: '私聊时提出交易，双方同意后生效'
    }
  ],
  王经理: [
    {
      name: '审计底稿',
      type: '辅助型',
      apCost: 1,
      effect: '查看自己1月份的工作记录',
      description: '回顾自己的审计工作底稿',
      usage: '声明使用后，DM提供1条内审记录'
    },
    {
      name: '坚持原则',
      type: '防御型',
      apCost: 2,
      effect: '抵抗1次上级的"权威施压"',
      description: '坚持审计师职业操守，拒绝妥协',
      usage: '在被上级施压时使用，拒绝透露信息'
    },
    {
      name: '联合行动',
      type: '辅助型',
      apCost: 2,
      effect: '邀请1人联合查阅线索，AP减半',
      description: '与他人合作调查，效率更高',
      usage: '私聊时邀请某人合作，双方AP消耗减半'
    },
    {
      name: '保护举报人',
      type: '防御型',
      apCost: 3,
      effect: '保护1名线人不被报复',
      description: '承诺保护提供线索的人',
      usage: '在有人提供线索时使用，承诺保护'
    }
  ],
  陈审计师: [
    {
      name: '审计函证',
      type: '攻击型',
      apCost: 2,
      effect: '向客户发函，强制获取1条客户信息',
      description: '利用审计程序，向客户函证',
      usage: '声明使用后，DM提供1条客户函证信息'
    },
    {
      name: '职业怀疑',
      type: '攻击型',
      apCost: 1,
      effect: '对1人的发言表示怀疑，要求补充证据',
      description: '表达职业怀疑，要求对方提供证据',
      usage: '在公聊时使用，质疑某人的发言'
    },
    {
      name: '保留意见威胁',
      type: '攻击型',
      apCost: 3,
      effect: '威胁出具保留意见，迫使1人妥协',
      description: '以审计意见为筹码，迫使对方配合',
      usage: '在谈判时使用，威胁出具保留意见'
    },
    {
      name: '合伙人支持',
      type: '防御型',
      apCost: 2,
      effect: '获得合伙人授权，抵抗1次客户压力',
      description: '声称得到合伙人支持，拒绝客户压力',
      usage: '在被客户施压时使用，展示合伙人授权'
    }
  ],
  刘姐: [
    {
      name: '档案回忆',
      type: '辅助型',
      apCost: 1,
      effect: '回忆1条合同流转细节',
      description: '回顾合同管理流程中的细节',
      usage: '声明使用后，DM提供1条合同流转信息'
    },
    {
      name: '装糊涂',
      type: '防御型',
      apCost: 2,
      effect: '抵抗1次"施压质询"，但需投骰子检定',
      description: '假装记不清，需要投骰子判定',
      usage: '在被施压时使用，投骰子（1-3成功，4-6失败）'
    },
    {
      name: '监控录像',
      type: '攻击型',
      apCost: 3,
      effect: '⭐王牌技能：展示监控证据，威胁或交易',
      description: '展示关键监控录像，作为筹码',
      usage: '在关键时刻使用，展示监控证据'
    },
    {
      name: '即将退休',
      type: '防御型',
      apCost: 1,
      effect: '情感牌，使1人对你同情',
      description: '以即将退休为由，博取同情',
      usage: '在公聊时使用，表达退休压力'
    }
  ],
  赵主管: [
    {
      name: '合规审查',
      type: '辅助型',
      apCost: 1,
      effect: '检查1份合同的合规性',
      description: '从法务角度审查合同',
      usage: '声明使用后，DM提供1条合规审查信息'
    },
    {
      name: '邮件证据',
      type: '防御型',
      apCost: 2,
      effect: '展示1条拒绝违规的邮件证据',
      description: '展示自己拒绝违规的邮件记录',
      usage: '在被质疑时使用，展示邮件证据'
    },
    {
      name: '流程整改',
      type: '攻击型',
      apCost: 3,
      effect: '推动流程改革，使违规操作难度+1',
      description: '借机推动流程改革，增加违规成本',
      usage: '在公聊时使用，提出流程改革方案'
    },
    {
      name: '法律威慑',
      type: '攻击型',
      apCost: 2,
      effect: '威胁追究法律责任，迫使1人妥协',
      description: '以法律责任为筹码，迫使对方配合',
      usage: '在谈判时使用，威胁法律后果'
    }
  ]
};

function generateSkillCard(skill, roleName) {
  const typeIcons = {
    '攻击型': '⚔️',
    '防御型': '🛡️',
    '辅助型': '🔧',
    '交易型': '🤝'
  };

  const typeIcon = typeIcons[skill.type] || '📜';

  return `
┌────────────────────────────────────────┐
│  【${typeIcon} ${skill.name}】技能卡              │
├────────────────────────────────────────┤
│  角色：${roleName}                           │
│  类型：${skill.type} (${typeIcon})                    │
│  AP消耗：${skill.apCost}                           │
├────────────────────────────────────────┤
│  效果：                                  │
│  ${skill.effect}                          │
│                                          │
│  描述：                                  │
│  ${skill.description}                     │
│                                          │
│  使用方法：                              │
│  ${skill.usage}                          │
├────────────────────────────────────────┤
│  ⚠️ 每张技能卡限用1次                     │
│  ⚠️ 使用时需公开声明                      │
│  ⚠️ 被针对者可使用防御型技能抵抗         │
└────────────────────────────────────────┘
`;
}

function generateRoleSkillCards(roleName) {
  const skills = ROLE_SKILLS[roleName];
  if (!skills) {
    console.log(colorize(`错误：找不到角色 "${roleName}" 的技能卡`, 'red'));
    return null;
  }

  let output = '';
  output += colorize(`╔══════════════════════════════════════╗\n`, 'cyan');
  output += colorize(`║      ${roleName} 的技能卡组              ║\n`, 'cyan');
  output += colorize(`╚══════════════════════════════════════╝\n`, 'cyan');
  output += '\n';

  skills.forEach((skill, index) => {
    output += colorize(`\n════════════ 技能卡 ${index + 1}/${skills.length} ════════════\n\n`, 'yellow');
    output += generateSkillCard(skill, roleName);
    output += '\n';
  });

  return output;
}

function generateAllSkillCards() {
  let output = '';
  output += colorize(`╔══════════════════════════════════════╗\n`, 'cyan');
  output += colorize(`║      剧本杀技能卡完整集合             ║\n`, 'cyan');
  output += colorize(`╚══════════════════════════════════════╝\n`, 'cyan');
  output += '\n';

  Object.keys(ROLE_SKILLS).forEach((roleName, roleIndex) => {
    output += colorize(`\n${'='.repeat(50)}\n`, 'magenta');
    output += colorize(`  ${roleName} 的技能卡组\n`, 'bright');
    output += colorize(`${'='.repeat(50)}\n\n`, 'magenta');

    const skills = ROLE_SKILLS[roleName];
    skills.forEach((skill, skillIndex) => {
      output += colorize(`\n--- 技能卡 ${skillIndex + 1}/${skills.length} ---\n\n`, 'yellow');
      output += generateSkillCard(skill, roleName);
      output += '\n';
    });
  });

  return output;
}

function generateMarkdownSkillCards(roleName) {
  const skills = ROLE_SKILLS[roleName];
  if (!skills) {
    console.log(colorize(`错误：找不到角色 "${roleName}" 的技能卡`, 'red'));
    return null;
  }

  let output = `# ${roleName} 的技能卡组\n\n`;
  
  output += `## 技能卡清单\n\n`;
  output += `| 序号 | 技能名称 | 类型 | AP消耗 | 效果 |\n`;
  output += `|------|---------|------|--------|------|\n`;
  
  skills.forEach((skill, index) => {
    const typeIcons = {
      '攻击型': '⚔️',
      '防御型': '🛡️',
      '辅助型': '🔧',
      '交易型': '🤝'
    };
    const typeIcon = typeIcons[skill.type] || '📜';
    output += `| ${index + 1} | ${skill.name} | ${skill.type} ${typeIcon} | ${skill.apCost} | ${skill.effect} |\n`;
  });
  
  output += `\n---\n\n`;
  
  skills.forEach((skill, index) => {
    output += `## 技能卡 ${index + 1}：${skill.name}\n\n`;
    output += `- **角色**：${roleName}\n`;
    output += `- **类型**：${skill.type}\n`;
    output += `- **AP消耗**：${skill.apCost}\n\n`;
    output += `### 效果\n\n${skill.effect}\n\n`;
    output += `### 描述\n\n${skill.description}\n\n`;
    output += `### 使用方法\n\n${skill.usage}\n\n`;
    output += `---\n\n`;
  });

  return output;
}

function main() {
  const args = process.argv.slice(2);
  const options = {
    role: null,
    all: args.includes('--all'),
    format: args.includes('--markdown') ? 'markdown' : 'text',
    save: args.includes('--save')
  };

  const roleIndex = args.indexOf('--role');
  if (roleIndex !== -1 && args[roleIndex + 1]) {
    options.role = args[roleIndex + 1];
  }

  if (!options.all && !options.role) {
    console.log('');
    console.log(colorize('╔══════════════════════════════════════╗', 'cyan'));
    console.log(colorize('║      剧本杀技能卡生成器              ║', 'cyan'));
    console.log(colorize('╚══════════════════════════════════════╝', 'cyan'));
    console.log('');
    console.log(colorize('用法: node skill-card-generator.js [选项]', 'yellow'));
    console.log('');
    console.log('选项:');
    console.log('  --role <角色名>    生成指定角色的技能卡');
    console.log('  --all              生成所有角色的技能卡');
    console.log('  --markdown         生成Markdown格式');
    console.log('  --save             保存到文件');
    console.log('');
    console.log('可用角色:');
    console.log('  张总、小李、王经理、陈审计师、刘姐、赵主管');
    console.log('');
    console.log('示例:');
    console.log('  node skill-card-generator.js --role 张总');
    console.log('  node skill-card-generator.js --all --save');
    console.log('  node skill-card-generator.js --role 陈审计师 --markdown --save');
    console.log('');
    process.exit(1);
  }

  console.log('');
  console.log(colorize('╔══════════════════════════════════════╗', 'cyan'));
  console.log(colorize('║      剧本杀技能卡生成器              ║', 'cyan'));
  console.log(colorize('╚══════════════════════════════════════╝', 'cyan'));
  console.log('');

  let content = '';
  let filename = '';

  if (options.all) {
    if (options.format === 'markdown') {
      let allContent = '';
      Object.keys(ROLE_SKILLS).forEach(roleName => {
        allContent += generateMarkdownSkillCards(roleName);
        allContent += '\n\n';
      });
      content = allContent;
      filename = 'skill_cards_all.md';
    } else {
      content = generateAllSkillCards();
      filename = 'skill_cards_all.txt';
    }
  } else if (options.role) {
    if (options.format === 'markdown') {
      content = generateMarkdownSkillCards(options.role);
      filename = `skill_card_${options.role}.md`;
    } else {
      content = generateRoleSkillCards(options.role);
      filename = `skill_card_${options.role}.txt`;
    }
  }

  if (content) {
    console.log(content);
    console.log('');

    if (options.save) {
      fs.writeFileSync(filename, content, 'utf-8');
      console.log(colorize(`✓ 已保存到: ${filename}`, 'green'));
      console.log('');
    }
  }
}

main();
