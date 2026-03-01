/**
 * 内容创作引擎 - 6阶段文章创作流程
 * 参考 wechat-article-writer 的结构设计
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// 导入模块
const TitleOptimizer = require('./title-optimizer.cjs');
const ArticleWriter = require('./article-writer.cjs');
const ImagePromptGenerator = require('./image-prompt-generator.cjs');

class ContentCreator {
  constructor(configPath = null) {
    this.titleOptimizer = new TitleOptimizer(configPath);
    this.articleWriter = new ArticleWriter(configPath);
    this.imagePromptGenerator = new ImagePromptGenerator();
    this.configPath = configPath || path.join(__dirname, '../config/creation-rules.json');
    this.currentStage = 0;
  }

  /**
   * 6阶段交互式创作流程
   */
  async createArticle() {
    console.log('\n🚀 微信公众号爆款文章创作工具');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const context = {};

    // 阶段01：选题定位
    context.topic = await this.stage01_Topic();

    // 阶段02：标题优化
    context.title = await this.stage02_Title(context.topic);

    // 阶段03：框架搭建
    const { keyPoints } = await this.stage03_Framework(context.topic);

    // 阶段04：全文撰写
    const article = await this.stage04_Writing({
      title: context.title,
      topic: context.topic,
      keyPoints
    });

    // 阶段05：保存文章
    const savedPath = await this.stage05_Save(article, context.topic);

    // 阶段06：配图提示词
    await this.stage06_ImagePrompts(article, savedPath);

    console.log('\n✅ 创作完成！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n💡 下一步：`);
    console.log(`   - 查看文章: ${savedPath}`);
    console.log(`   - 发布文章: /wx-publish "${savedPath}"`);
    console.log(`   - 生成图片: /wx-generate-images\n`);

    return {
      title: context.title,
      topic: context.topic,
      articlePath: savedPath
    };
  }

  /**
   * 阶段01：选题定位
   */
  async stage01_Topic() {
    console.log('\n📌 阶段01：选题定位');
    console.log('──────────────────────────────\n');

    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (prompt) => new Promise(resolve => {
      rl.question(prompt, resolve);
    });

    const topic = await question('请输入文章主题: ');
    rl.close();

    if (!topic || topic.trim() === '') {
      throw new Error('主题不能为空');
    }

    console.log(`\n✓ 主题确认: ${topic}`);
    return topic.trim();
  }

  /**
   * 阶段02：标题优化
   * 必须生成5-10个爆款标题供用户选择
   */
  async stage02_Title(topic) {
    console.log('\n📝 阶段02：标题优化');
    console.log('──────────────────────────────');
    console.log('正在生成爆款标题...\n');

    // 生成标题选项
    const titles = await this.titleOptimizer.generateTitles({
      topic,
      targetAudience: '财务人',
      benefit: '让工作更轻松',
      count: 10
    });

    // 显示标题
    console.log('📌 为您生成的爆款标题：\n');
    titles.forEach((t, i) => {
      console.log(`  ${i + 1}. ${t.title}`);
      console.log(`     [${t.formula}] ★${t.score}\n`);
    });

    // 等待用户选择
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const index = await new Promise(resolve => {
      rl.question(`\n请选择标题 (输入序号 1-${titles.length}, 默认: 1): `, answer => {
        rl.close();
        resolve(parseInt(answer) || 1);
      });
    });

    const selectedTitle = titles[index - 1]?.title || titles[0].title;
    console.log(`\n✓ 已选择: ${selectedTitle}`);
    return selectedTitle;
  }

  /**
   * 阶段03：框架搭建
   */
  async stage03_Framework(topic) {
    console.log('\n📋 阶段03：框架搭建');
    console.log('──────────────────────────────');
    console.log('正在生成文章框架...\n');

    // 生成关键点
    const keyPoints = await this.articleWriter.generateKeyPoints(topic, 5);

    // 显示框架
    console.log('📋 文章框架：\n');
    console.log('## 开篇钩子');
    console.log('  类型: 痛点共鸣/场景代入');
    console.log(`  主题: ${topic}\n`);

    console.log('## 主体内容');
    keyPoints.forEach((p, i) => {
      console.log(`  ${i + 1}. **${p.title}**`);
      console.log(`     ${p.description.substring(0, 40)}...`);
    });
    console.log('');

    console.log('✓ 框架已生成');
    return { keyPoints };
  }

  /**
   * 阶段04：全文撰写
   */
  async stage04_Writing(options) {
    console.log('\n✍️  阶段04：全文撰写');
    console.log('──────────────────────────────');
    console.log('正在撰写文章（目标2500-3000字）...\n');

    const article = await this.articleWriter.generateArticle(options);

    console.log(`\n✓ 文章撰写完成！字数: ${article.length} 字`);
    return article;
  }

  /**
   * 阶段05：保存文章
   */
  async stage05_Save(article, topic) {
    console.log('\n💾 阶段05：保存文章');
    console.log('──────────────────────────────\n');

    // 确保输出目录存在
    const outputDir = path.join(process.cwd(), 'outputs', 'articles');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 生成文件名
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const filename = `${date}_${topic.replace(/[\/\\?%*:|"<>]/g, '-')}.md`;
    const outputPath = path.join(outputDir, filename);

    // 保存文章
    this.articleWriter.saveArticle(article, outputPath);

    console.log(`✓ 文章已保存到: ${outputPath}`);
    return outputPath;
  }

  /**
   * 阶段06：配图提示词
   * 自动生成配图提示词并保存，然后询问用户是否生成图片
   */
  async stage06_ImagePrompts(article, articlePath) {
    console.log('\n🎨 阶段06：配图提示词');
    console.log('──────────────────────────────');
    console.log('正在生成配图提示词...\n');

    // 生成配图提示词
    const prompts = this.imagePromptGenerator.generatePrompts(article);

    // 保存提示词文件
    const promptsDir = path.join(process.cwd(), 'outputs', 'prompts');
    if (!fs.existsSync(promptsDir)) {
      fs.mkdirSync(promptsDir, { recursive: true });
    }

    const promptsFile = path.join(promptsDir, 'image-prompts.jsonl');
    const promptsData = prompts.map(p => JSON.stringify(p)).join('\n');
    fs.writeFileSync(promptsFile, promptsData, 'utf8');

    console.log(`✓ 配图提示词已生成（共${prompts.length}张）`);
    console.log(`  - cover.png (封面图)`);
    console.log(`  - info1.png (信息图1)`);
    console.log(`  - info2.png (信息图2)`);
    console.log(`  - info3.png (信息图3)`);
    console.log(`  - cta.png (引导图)`);
    console.log(`\n  保存位置: ${promptsFile}`);

    // 询问是否生成图片
    console.log('\n──────────────────────────────');
    console.log('\n💡 是否需要调用API生成图片？');
    console.log('   回复"是"或运行 /wx-generate-images 开始生成\n');

    return promptsFile;
  }

  /**
   * 快速生成标题（用于命令行调用）
   */
  async quickTitles(topic, count = 10) {
    const titles = await this.titleOptimizer.generateTitles({
      topic,
      targetAudience: '财务人',
      benefit: '让工作更轻松',
      count
    });

    console.log('\n📌 爆款标题生成结果\n');
    titles.forEach((t, i) => {
      console.log(`${i + 1}. ${t.title} [${t.formula}] ★${t.score}`);
    });
    console.log('');

    return titles;
  }

  /**
   * 快速生成文章（用于命令行调用）
   */
  async quickWrite(topic, title) {
    console.log('\n🤖 正在生成文章...\n');

    const article = await this.articleWriter.generateArticle({
      title: title || topic,
      topic
    });

    // 保存文章
    const outputDir = path.join(process.cwd(), 'outputs', 'articles');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const filename = `${date}_${topic.replace(/[\/\\?%*:|"<>]/g, '-')}.md`;
    const outputPath = path.join(outputDir, filename);

    // 添加YAML frontmatter
    const frontmatter = `---
title: ${title || topic}
author: 财务干货
summary: ${topic}相关内容
cover: ./outputs/images/cover.png
---

`;

    this.articleWriter.saveArticle(frontmatter + article, outputPath);

    console.log(`\n✓ 文章已保存到: ${outputPath}`);
    console.log(`✓ 字数: ${article.length} 字\n`);

    return outputPath;
  }
}

// 导出
module.exports = ContentCreator;

// 命令行入口
if (require.main === module) {
  const creator = new ContentCreator();
  const command = process.argv[2];

  (async () => {
    if (command === 'titles') {
      // 快速生成标题
      const topic = process.argv[3] || '财务管理';
      const count = parseInt(process.argv[4]) || 10;
      await creator.quickTitles(topic, count);

    } else if (command === 'write') {
      // 快速生成文章
      const topic = process.argv[3] || '财务管理';
      const title = process.argv[4];
      await creator.quickWrite(topic, title);

    } else if (command === 'create') {
      // 6阶段交互式创作
      await creator.createArticle();

    } else {
      // 默认：显示帮助
      console.log('\n🚀 微信公众号爆款文章创作工具\n');
      console.log('用法:');
      console.log('  node content-creator.cjs create         - 6阶段交互式创作');
      console.log('  node content-creator.cjs titles <主题>  - 快速生成标题');
      console.log('  node content-creator.cjs write <主题>   - 快速生成文章\n');
      console.log('示例:');
      console.log('  node content-creator.cjs create');
      console.log('  node content-creator.cjs titles "个税汇算清缴"');
      console.log('  node content-creator.cjs write "金税四期"\n');
    }
  })();
}
