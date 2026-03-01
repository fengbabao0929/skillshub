#!/usr/bin/env node

/**
 * 财税内容编辑部工作流系统
 * 模拟真实编辑部的5人专业评审团队
 *
 * 工作流角色：
 *   1. 架构师 - 内容总监（算法推荐+私域转化视角）
 *   2. 主笔管 - 资深创作者（结构化内容+复杂主题拆解）
 *   3. 毒舌编辑 - 严苛审核（挑错找茬+质量把关）
 *   4. 金牌改稿人 - 改稿专家（内容优化+表达打磨）
 *   5. 王牌包装人 - 流量运营（爆款设计+全链路变现）
 *
 * 用法: node editorial-workflow.js [选项]
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ==================== 颜色输出 ====================

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
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

// ==================== 编辑部角色定义 ====================

const EDITORS = {
  ARCHITECT: {
    id: 'architect',
    name: '架构师',
    title: '内容总监',
    emoji: '🏗️',
    bio: '5年以上公众号实战经验，服务过3个100万+粉丝账号，新榜/西瓜数据认证专家',
    expertise: ['算法推荐逻辑', '私域转化设计', '内容营销全链路', '用户留存提升20%+'],
    focus: '从流量获取到变现转化的全链路设计',
    questions: [
      '这个选题是否符合当前微信算法推荐机制？能否触发自然流量？',
      '文章是否设计了明确的转化路径？（关注、加群、领取资料等）',
      '标题和导语是否足够吸引点击？打开率预期如何？',
      '内容中是否设置了社交货币点？（值得分享/收藏的点）',
      '是否设计了裂变钩子？（如"转发领取XXX"）',
      '目标用户画像是否清晰？内容是否精准匹配？',
      '预估这篇文章能带来多少私域新增？如何承接？',
      '是否有二次传播机制？读者愿意转发吗？'
    ],
    scoringCriteria: [
      { name: '流量获取能力', weight: 0.25, desc: '选题、标题、导语的吸引力' },
      { name: '转化设计', weight: 0.25, desc: '私域引流、变现路径设计' },
      { name: '社交传播性', weight: 0.20, desc: '分享转发、裂变机制' },
      { name: '用户留存', weight: 0.15, desc: '关注、复购、长期价值' },
      { name: '算法友好度', weight: 0.15, desc: '符合推荐机制程度' }
    ]
  },

  LEAD_WRITER: {
    id: 'lead_writer',
    name: '主笔管',
    title: '资深内容创作者',
    emoji: '✍️',
    bio: '专注于微信公众号文章创作的资深非虚构内容创作者',
    expertise: ['复杂主题拆解', '结构化内容搭建', '快速内容生产', '深度专题报道'],
    focus: '内容的逻辑性、结构完整性、专业深度',
    questions: [
      '主题的核心观点是什么？是否清晰明确？',
      '文章结构是否合理？逻辑是否严密？',
      '是否有效拆解了复杂主题？读者能理解吗？',
      '论据是否充分？案例是否有力？',
      '内容深度是否足够？是否有独到见解？',
      '是否存在逻辑跳跃或断层？',
      '各部分之间的衔接是否自然？',
      '开头是否引人入胜？结尾是否有力？',
      '是否避免了流水账式写作？'
    ],
    scoringCriteria: [
      { name: '结构逻辑', weight: 0.30, desc: '框架设计、逻辑严密性' },
      { name: '内容深度', weight: 0.30, desc: '专业深度、独到见解' },
      { name: '主题拆解', weight: 0.20, desc: '复杂问题简化能力' },
      { name: '论据充分性', weight: 0.20, desc: '案例、数据、引用的支撑' }
    ]
  },

  ACID_EDITOR: {
    id: 'acid_editor',
    name: '毒舌编辑',
    title: '最挑剔的读者',
    emoji: '🔪',
    bio: '对文字、逻辑、观点有近乎偏执要求的严苛审核者',
    expertise: ['挑错找茬', '逻辑漏洞识别', '表达洁癖', '质量把关'],
    focus: '找问题、挑毛病、鸡蛋里挑骨头',
    questions: [
      '有没有错别字、语病、标点错误？',
      '有没有陈词滥调、空洞无物的表达？',
      '有没有自相矛盾的论述？',
      '有没有逻辑漏洞或不严谨的推断？',
      '有没有啰嗦冗余、可以删减的内容？',
      '专业术语使用是否准确？有没有歧义？',
      '引用的法规、数据是否准确？有没有过时？',
      '观点是否偏激？有没有绝对化表述？',
      '排版是否清晰？有没有阅读障碍？',
      '读者会不会觉得"这文章有问题"？'
    ],
    scoringCriteria: [
      { name: '语言准确性', weight: 0.25, desc: '错别字、语病、术语' },
      { name: '逻辑严密性', weight: 0.30, desc: '漏洞、矛盾、推断' },
      { name: '表达精准度', weight: 0.25, desc: '冗余、模糊、歧义' },
      { name: '专业严谨性', weight: 0.20, desc: '法规、数据、引用' }
    ],
    criticalMode: true
  },

  GHOST_WRITER: {
    id: 'ghost_writer',
    name: '金牌改稿人',
    title: '资深改稿专家',
    emoji: '✨',
    bio: '专注于微信公众号千万级粉丝账号内容创作的资深改稿专家',
    expertise: ['内容优化', '表达打磨', '节奏调整', '爆款改写'],
    focus: '让好内容变得更好，提升可读性和吸引力',
    questions: [
      '标题能否更吸引人？有没有更好的表述？',
      '导语能否更快抓住读者？',
      '哪些段落需要调整顺序？',
      '哪些表述可以更精炼？',
      '哪些地方可以加入金句？',
      '节奏是否合适？需要调整快慢吗？',
      '是否需要加入更多案例或数据？',
      '结尾能否更有力？能否更好地引导行动？',
      '整体文风是否统一？是否需要调整语气？',
      '有没有让人眼前一亮的点？怎么强化？'
    ],
    scoringCriteria: [
      { name: '标题吸引力', weight: 0.25, desc: '标题的点击欲望' },
      { name: '可读性', weight: 0.30, desc: '流畅度、节奏感' },
      { name: '表达质量', weight: 0.25, desc: '精炼度、感染力' },
      { name: '亮点密度', weight: 0.20, desc: '金句、记忆点' }
    ],
    improvementMode: true
  },

  PACKAGER: {
    id: 'packager',
    name: '王牌包装人',
    title: '流量运营总监',
    emoji: '🚀',
    bio: '深耕内容变现5年，操盘20+篇10万+爆款文',
    expertise: ['爆款文设计', '标题优化', '视觉包装', '互动设计', '分发策略'],
    focus: '让文章获得最大曝光和转化',
    questions: [
      '标题够不够爆款？能打几分？',
      '封面图/配图建议？视觉冲击力如何？',
      '金句是否提炼？能否做成金句卡片？',
      '是否设计了互动点？（评论、点赞、转发）',
      '摘要/分享语是否优化？',
      '发布时间建议？',
      '是否需要设置话题标签？',
      '是否有可二次传播的金图/金句？',
      '评论区引导语设计了吗？',
      '后续内容衔接？能否做成系列？',
      '变现路径清晰吗？能直接转化吗？'
    ],
    scoringCriteria: [
      { name: '爆款潜质', weight: 0.30, desc: '10万+可能性' },
      { name: '标题冲击力', weight: 0.25, desc: '标题的爆款程度' },
      { name: '视觉包装', weight: 0.20, desc: '配图、排版、视觉' },
      { name: '互动设计', weight: 0.15, desc: '评论、点赞、转发' },
      { name: '分发策略', weight: 0.10, desc: '发布时间、标签、系列' }
    ]
  }
};

// ==================== 工作流配置 ====================

const WORKFLOW_STEPS = [
  { id: 'architect', editor: EDITORS.ARCHITECT, order: 1, name: '架构师评审', required: true },
  { id: 'lead_writer', editor: EDITORS.LEAD_WRITER, order: 2, name: '主笔管评审', required: true },
  { id: 'acid_editor', editor: EDITORS.ACID_EDITOR, order: 3, name: '毒舌编辑挑错', required: true },
  { id: 'ghost_writer', editor: EDITORS.GHOST_WRITER, order: 4, name: '金牌改稿人优化', required: false },
  { id: 'packager', editor: EDITORS.PACKAGER, order: 5, name: '王牌包装人包装', required: true }
];

// ==================== 工具函数 ====================

function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

function question(rl, prompt) {
  return new Promise(resolve => {
    rl.question(prompt, answer => resolve(answer));
  });
}

function calculateScore(criteria, scores) {
  let totalScore = 0;
  let totalWeight = 0;

  Object.keys(criteria).forEach((key, index) => {
    const criterion = criteria[key];
    const score = scores[index] || 0;
    totalScore += score * criterion.weight;
    totalWeight += criterion.weight;
  });

  return totalWeight > 0 ? (totalScore / totalWeight).toFixed(1) : 0;
}

function getScoreRating(score) {
  if (score >= 9.0) return { rating: 'S级-完美', color: 'magenta', emoji: '💎' };
  if (score >= 8.0) return { rating: 'A级-优秀', color: 'green', emoji: '🌟' };
  if (score >= 7.0) return { rating: 'B级-良好', color: 'cyan', emoji: '✅' };
  if (score >= 6.0) return { rating: 'C级-合格', color: 'yellow', emoji: '📝' };
  return { rating: 'D级-需重构', color: 'red', emoji: '❌' };
}

function getIssueLevel(count) {
  if (count === 0) return { level: '无问题', color: 'green', emoji: '🎉' };
  if (count <= 2) return { level: '轻微问题', color: 'yellow', emoji: '⚠️' };
  if (count <= 5) return { level: '中等问题', color: 'yellow', emoji: '🔶' };
  return { level: '严重问题', color: 'red', emoji: '🚨' };
}

// ==================== 评审引擎 ====================

async function runEditorReview(editorId, topic, content = '', metadata = {}) {
  const editor = EDITORS[editorId.toUpperCase()];
  const rl = createInterface();

  console.log('');
  console.log(colorize('╔═══════════════════════════════════════════════════════════════╗', 'cyan'));
  console.log(colorize(`║  ${editor.emoji} ${editor.title} - ${editor.name}`, 'cyan'));
  console.log(colorize('╚═══════════════════════════════════════════════════════════════╝', 'cyan'));
  console.log('');
  console.log(colorize('📋 资质背景', 'yellow'));
  console.log(colorize(editor.bio, 'dim'));
  console.log('');
  console.log(colorize('🎯 专业领域', 'yellow'));
  editor.expertise.forEach(exp => console.log(`   • ${exp}`));
  console.log('');
  console.log(colorize('📌 评审重点', 'yellow'));
  console.log(`   ${editor.focus}`);
  console.log('');
  console.log(colorize('───────────────────────────────────────────────────────────────', 'cyan'));
  console.log(colorize('📝 选题信息', 'yellow'));
  console.log(colorize('───────────────────────────────────────────────────────────────', 'cyan'));
  console.log(`   主题：${topic}`);
  if (metadata.domain) console.log(`   领域：${metadata.domain}`);
  if (metadata.articleType) console.log(`   类型：${metadata.articleType}`);
  console.log('');

  // 收集评分
  const scores = [];
  const issues = [];
  const suggestions = [];
  const highlights = [];

  console.log(colorize('───────────────────────────────────────────────────────────────', 'cyan'));
  console.log(colorize('🔍 评审问卷', 'yellow'));
  console.log(colorize('───────────────────────────────────────────────────────────────', 'cyan'));

  // 核心问题评估
  for (let i = 0; i < editor.questions.length; i++) {
    console.log('');
    console.log(colorize(`Q${i + 1}. ${editor.questions[i]}`, 'cyan'));

    if (editor.criticalMode) {
      // 毒舌编辑模式：找问题
      const hasIssue = await question(rl, colorize('   是否发现问题？(y/n/q跳过): ', 'yellow'));
      if (hasIssue.toLowerCase() === 'y') {
        const issueDesc = await question(rl, colorize('   → 请描述问题: ', 'red'));
        const severity = await question(rl, colorize('   → 严重程度 (1-轻微/2-中等/3-严重): ', 'yellow'));
        issues.push({ question: editor.questions[i], issue: issueDesc, severity: parseInt(severity) });
      }
    } else if (editor.improvementMode) {
      // 改稿人模式：提建议
      const needImprove = await question(rl, colorize('   是否需要优化？(y/n/q跳过): ', 'yellow'));
      if (needImprove.toLowerCase() === 'y') {
        const improveDesc = await question(rl, colorize('   → 优化建议: ', 'green'));
        suggestions.push({ question: editor.questions[i], suggestion: improveDesc });
      }
    } else {
      // 标准评分模式
      const score = await question(rl, colorize('   评分 (1-10分，直接回车跳过): ', 'cyan'));
      if (score.trim()) {
        scores.push(parseFloat(score));

        const comment = await question(rl, colorize('   具体意见 (可选): ', 'dim'));
        if (comment.trim()) {
          if (parseFloat(score) >= 8) {
            highlights.push({ question: editor.questions[i], comment });
          } else if (parseFloat(score) <= 5) {
            suggestions.push({ question: editor.questions[i], suggestion: comment });
          }
        }
      }
    }
  }

  // 标准化评分
  let finalScore = 0;
  let rating = {};

  if (!editor.criticalMode && !editor.improvementMode && scores.length > 0) {
    finalScore = calculateScore(editor.scoringCriteria, scores);
    rating = getScoreRating(finalScore);

    console.log('');
    console.log(colorize('───────────────────────────────────────────────────────────────', 'cyan'));
    console.log(colorize('📊 评分结果', 'yellow'));
    console.log(colorize('───────────────────────────────────────────────────────────────', 'cyan'));

    editor.scoringCriteria.forEach((c, i) => {
      if (scores[i] !== undefined) {
        console.log(`   ${c.name} (${c.weight * 100}%): ${scores[i]}`);
      }
    });

    console.log('');
    console.log(colorize(`   总分: ${finalScore}`, rating.color));
    console.log(colorize(`   评级: ${rating.emoji} ${rating.rating}`, rating.color));
  }

  // 问题统计
  if (editor.criticalMode && issues.length > 0) {
    const issueLevel = getIssueLevel(issues.filter(i => i.severity >= 2).length);
    console.log('');
    console.log(colorize('───────────────────────────────────────────────────────────────', 'cyan'));
    console.log(colorize('⚠️  问题清单', 'red'));
    console.log(colorize('───────────────────────────────────────────────────────────────', 'cyan'));
    console.log(colorize(`   发现 ${issues.length} 个问题 (${issueLevel.level})`, issueLevel.color));
    console.log('');

    issues.forEach((issue, i) => {
      const severityIcon = issue.severity === 3 ? '🚨' : issue.severity === 2 ? '🔶' : '⚠️';
      console.log(`   ${i + 1}. ${severityIcon} ${issue.issue}`);
      console.log(colorize(`      来源: ${issue.question}`, 'dim'));
      console.log('');
    });
  }

  // 建议汇总
  if (suggestions.length > 0) {
    console.log('');
    console.log(colorize('───────────────────────────────────────────────────────────────', 'cyan'));
    console.log(colorize('💡 优化建议', 'green'));
    console.log(colorize('───────────────────────────────────────────────────────────────', 'cyan'));
    console.log('');

    suggestions.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.suggestion}`);
      console.log(colorize(`      针对: ${s.question}`, 'dim'));
      console.log('');
    });
  }

  // 亮点总结
  if (highlights.length > 0) {
    console.log('');
    console.log(colorize('───────────────────────────────────────────────────────────────', 'cyan'));
    console.log(colorize('✨ 亮点总结', 'green'));
    console.log(colorize('───────────────────────────────────────────────────────────────', 'cyan'));
    console.log('');

    highlights.forEach((h, i) => {
      console.log(`   ${i + 1}. ${h.comment}`);
      console.log(colorize(`      亮点: ${h.question}`, 'dim'));
      console.log('');
    });
  }

  // 最终结论
  console.log('');
  console.log(colorize('───────────────────────────────────────────────────────────────', 'cyan'));

  let conclusion = '';
  if (editor.criticalMode) {
    const criticalIssues = issues.filter(i => i.severity === 3).length;
    conclusion = criticalIssues > 0 ? '🚫 存在严重问题，必须修正' :
                 issues.length > 0 ? '⚠️ 存在问题，建议修改' :
                 '✅ 质量过关，无重大问题';
  } else if (editor.improvementMode) {
    conclusion = suggestions.length > 0 ? '📝 有优化空间，建议改进' : '✅ 内容质量良好';
  } else {
    conclusion = parseFloat(finalScore) >= 7.0 ? '✅ 达标，可进入下一环节' : '⚠️ 需要改进后再推进';
  }

  console.log(colorize(`   ${conclusion}`, conclusion.includes('✅') ? 'green' : conclusion.includes('🚫') ? 'red' : 'yellow'));
  console.log(colorize('───────────────────────────────────────────────────────────────', 'cyan'));

  rl.close();

  return {
    editorId: editor.id,
    editorName: editor.name,
    editorTitle: editor.title,
    scores: scores.length > 0 ? scores : null,
    finalScore: scores.length > 0 ? parseFloat(finalScore) : null,
    rating: scores.length > 0 ? rating.rating : null,
    issues,
    suggestions,
    highlights,
    conclusion,
    criticalIssues: issues.filter(i => i.severity === 3).length
  };
}

// ==================== 完整工作流 ====================

async function runFullWorkflow(topic, metadata = {}) {
  console.log('');
  console.log(colorize('╔═══════════════════════════════════════════════════════════════╗', 'cyan'));
  console.log(colorize('║                                                           ║', 'cyan'));
  console.log(colorize('║        🏛️  财税内容编辑部 · 专业评审工作流                      ║', 'cyan'));
  console.log(colorize('║                                                           ║', 'cyan'));
  console.log(colorize('╚═══════════════════════════════════════════════════════════════╝', 'cyan'));

  const reviews = [];
  const rl = createInterface();

  for (const step of WORKFLOW_STEPS) {
    console.log('');
    console.log(colorize(`\n【步骤 ${step.order}/${WORKFLOW_STEPS.length}】${step.name}`, 'yellow'));
    console.log(colorize(step.required ? '  (必选环节)' : '  (可选环节)', 'dim'));

    const confirm = await question(rl, colorize('\n按回车继续，输入 q 退出: ', 'cyan'));
    if (confirm.toLowerCase() === 'q') break;

    const review = await runEditorReview(step.id, topic, '', metadata);
    reviews.push(review);

    // 如果毒舌编辑发现严重问题，询问是否继续
    if (step.id === 'acid_editor' && review.criticalIssues > 0) {
      console.log('');
      console.log(colorize('⚠️  检测到严重问题，强烈建议修正后再继续', 'red'));
      const continueAnyway = await question(rl, colorize('是否仍要继续后续环节？(y/n): ', 'yellow'));
      if (continueAnyway.toLowerCase() !== 'y') {
        console.log(colorize('\n已中止工作流，请修正问题后重新开始', 'yellow'));
        rl.close();
        return generateReport(reviews, true);
      }
    }
  }

  rl.close();
  return generateReport(reviews, false);
}

// ==================== 报告生成 ====================

function generateReport(reviews, interrupted = false) {
  let report = '';
  report += '# 🏛️ 财税内容编辑部评审报告\n\n';
  report += `**生成时间**: ${new Date().toLocaleString('zh-CN')}\n`;
  report += `**评审状态**: ${interrupted ? '⚠️ 已中止' : '✅ 已完成'}\n\n`;
  report += '---\n\n';

  // 执行摘要
  report += '## 📊 执行摘要\n\n';

  if (reviews.length === 0) {
    report += '> 暂无评审记录\n\n';
  } else {
    // 统计
    const totalIssues = reviews.reduce((sum, r) => sum + r.issues.length, 0);
    const criticalIssues = reviews.reduce((sum, r) => sum + r.criticalIssues, 0);
    const totalSuggestions = reviews.reduce((sum, r) => sum + r.suggestions.length, 0);
    const avgScore = reviews
      .filter(r => r.finalScore !== null)
      .reduce((sum, r, _, arr) => sum + r.finalScore / arr.length, 0)
      .toFixed(1);

    report += `- 评审环节: ${reviews.length}/${WORKFLOW_STEPS.length}\n`;
    if (avgScore > 0) report += `- 平均得分: ${avgScore}\n`;
    report += `- 发现问题: ${totalIssues} 个 (严重: ${criticalIssues})\n`;
    report += `- 优化建议: ${totalSuggestions} 条\n\n`;

    // 最终结论
    if (criticalIssues > 0) {
      report += `### 🚨 最终结论\n\n`;
      report += `**状态**: 存在严重问题，必须修正后才能发布\n\n`;
    } else if (totalIssues > 3) {
      report += `### ⚠️ 最终结论\n\n`;
      report += `**状态**: 存在较多问题，建议全面修改后再发布\n\n`;
    } else if (avgScore >= 8.0) {
      report += `### ✅ 最终结论\n\n`;
      report += `**状态**: 质量优秀，可以发布\n\n`;
    } else if (avgScore >= 7.0) {
      report += `### 📝 最终结论\n\n`;
      report += `**状态**: 质量良好，建议微调后发布\n\n`;
    } else {
      report += `### 🔶 最终结论\n\n`;
      report += `**状态**: 质量一般，需要优化后再发布\n\n`;
    }
  }

  report += '---\n\n';

  // 详细评审记录
  report += '## 📋 详细评审记录\n\n';

  reviews.forEach((review, index) => {
    report += `### ${index + 1}. ${review.editorTitle} - ${review.editorName}\n\n`;

    if (review.finalScore !== null) {
      const rating = getScoreRating(review.finalScore);
      report += `**评分**: ${review.finalScore} (${rating.emoji} ${rating.rating})\n\n`;
    }

    if (review.issues.length > 0) {
      report += '**🚨 问题清单**:\n\n';
      review.issues.forEach((issue, i) => {
        const severityIcon = issue.severity === 3 ? '🚨' : issue.severity === 2 ? '🔶' : '⚠️';
        report += `${i + 1}. ${severityIcon} ${issue.issue}\n`;
      });
      report += '\n';
    }

    if (review.suggestions.length > 0) {
      report += '**💡 优化建议**:\n\n';
      review.suggestions.forEach((s, i) => {
        report += `${i + 1}. ${s.suggestion}\n`;
      });
      report += '\n';
    }

    if (review.highlights && review.highlights.length > 0) {
      report += '**✨ 亮点总结**:\n\n';
      review.highlights.forEach((h, i) => {
        report += `${i + 1}. ${h.comment}\n`;
      });
      report += '\n';
    }

    report += `**结论**: ${review.conclusion}\n\n`;
    report += '---\n\n';
  });

  // 行动清单
  report += '## 🎯 行动清单\n\n';

  const criticalIssues = [];
  const normalIssues = [];
  const allSuggestions = [];

  reviews.forEach(review => {
    review.issues.forEach(issue => {
      if (issue.severity === 3) {
        criticalIssues.push(`[${review.editorName}] ${issue.issue}`);
      } else {
        normalIssues.push(`[${review.editorName}] ${issue.issue}`);
      }
    });
    review.suggestions.forEach(s => {
      allSuggestions.push(`[${review.editorName}] ${s.suggestion}`);
    });
  });

  if (criticalIssues.length > 0) {
    report += '### 🚨 必须修正 (严重问题)\n\n';
    criticalIssues.forEach((issue, i) => {
      report += `${i + 1}. ${issue}\n`;
    });
    report += '\n';
  }

  if (normalIssues.length > 0) {
    report += '### ⚠️ 建议修改 (一般问题)\n\n';
    normalIssues.forEach((issue, i) => {
      report += `${i + 1}. ${issue}\n`;
    });
    report += '\n';
  }

  if (allSuggestions.length > 0) {
    report += '### 💡 可选优化 (提升建议)\n\n';
    allSuggestions.forEach((suggestion, i) => {
      report += `${i + 1}. ${suggestion}\n`;
    });
    report += '\n';
  }

  if (criticalIssues.length === 0 && normalIssues.length === 0 && allSuggestions.length === 0) {
    report += '> 暂无行动项\n\n';
  }

  report += '---\n\n';
  report += `*报告由 财税内容编辑部工作流系统 生成*\n`;

  return report;
}

// ==================== 命令行模式 ====================

function showHelp() {
  console.log('');
  console.log(colorize('财税内容编辑部工作流系统', 'cyan'));
  console.log('');
  console.log('用法:');
  console.log('  node editorial-workflow.js [选项]');
  console.log('');
  console.log('选项:');
  console.log('  --topic <主题>          指定选题 (必需)');
  console.log('  --domain <领域>         指定领域');
  console.log('  --type <类型>          文章类型');
  console.log('  --step <步骤>          指定评审步骤');
  console.log('  --output <文件>        保存报告到文件');
  console.log('  --help                 显示帮助信息');
  console.log('');
  console.log('评审步骤:');
  console.log('  architect   - 架构师评审 (流量+转化视角)');
  console.log('  lead_writer - 主笔管评审 (结构+深度视角)');
  console.log('  acid_editor - 毒舌编辑挑错 (找错+质量视角)');
  console.log('  ghost_writer - 金牌改稿人优化 (表达+可读性视角)');
  console.log('  packager    - 王牌包装人包装 (爆款+变现视角)');
  console.log('  full        - 完整工作流 (全部环节)');
  console.log('');
  console.log('示例:');
  console.log('  node editorial-workflow.js --topic "增值税新政" --domain 税务');
  console.log('  node editorial-workflow.js --topic "存货审计" --step architect');
  console.log('  node editorial-workflow.js --topic "AI审计" --step full --output report.md');
  console.log('');
}

// ==================== 主函数 ====================

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  let topic = '';
  let domain = '';
  let articleType = '实务指南';
  let step = 'full';
  let outputFile = '';

  // 解析参数
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--topic':
      case '-t':
        topic = args[++i];
        break;
      case '--domain':
      case '-d':
        domain = args[++i];
        break;
      case '--type':
        articleType = args[++i];
        break;
      case '--step':
      case '-s':
        step = args[++i];
        break;
      case '--output':
      case '-o':
        outputFile = args[++i];
        break;
    }
  }

  if (!topic) {
    console.log(colorize('错误: 请指定选题 --topic', 'red'));
    console.log('使用 --help 查看帮助');
    process.exit(1);
  }

  let report = '';

  // 执行对应步骤
  switch (step) {
    case 'architect':
      const review1 = await runEditorReview('architect', topic, '', { domain, articleType });
      report = generateReport([review1]);
      break;
    case 'lead_writer':
      const review2 = await runEditorReview('lead_writer', topic, '', { domain, articleType });
      report = generateReport([review2]);
      break;
    case 'acid_editor':
      const review3 = await runEditorReview('acid_editor', topic, '', { domain, articleType });
      report = generateReport([review3]);
      break;
    case 'ghost_writer':
      const review4 = await runEditorReview('ghost_writer', topic, '', { domain, articleType });
      report = generateReport([review4]);
      break;
    case 'packager':
      const review5 = await runEditorReview('packager', topic, '', { domain, articleType });
      report = generateReport([review5]);
      break;
    case 'full':
    default:
      report = await runFullWorkflow(topic, { domain, articleType });
      break;
  }

  // 输出报告
  console.log('');
  console.log(colorize('═══════════════════════════════════════════════════════════', 'cyan'));
  console.log(colorize('📄 评审报告', 'yellow'));
  console.log(colorize('═══════════════════════════════════════════════════════════', 'cyan'));
  console.log('');
  console.log(report);

  // 保存到文件
  if (outputFile) {
    const articlesDir = path.join(process.cwd(), 'articles');
    if (!fs.existsSync(articlesDir)) {
      fs.mkdirSync(articlesDir, { recursive: true });
    }
    const filepath = path.join(articlesDir, outputFile);
    fs.writeFileSync(filepath, report, 'utf-8');
    console.log('');
    console.log(colorize(`✅ 报告已保存到: ${filepath}`, 'green'));
  }
}

main();
