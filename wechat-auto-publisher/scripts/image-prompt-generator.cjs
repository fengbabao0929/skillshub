/**
 * 图片提示词生成器 - 为文章自动生成配图提示词
 * 基于文章内容生成封面、信息图、引导图的提示词
 */

const fs = require('fs');
const path = require('path');

class ImagePromptGenerator {
  constructor() {
    this.styleBlock = this.loadStyleBlock();
    this.templates = {
      cover: this.loadCoverTemplates(),
      infographic: this.loadInfographicTemplates(),
      cta: this.loadCtaTemplates()
    };
  }

  /**
   * 加载风格基准
   */
  loadStyleBlock() {
    const stylePath = path.join(__dirname, '../image_templates/style-block.md');
    try {
      return fs.readFileSync(stylePath, 'utf8');
    } catch (e) {
      return '';
    }
  }

  /**
   * 加载封面图模板
   */
  loadCoverTemplates() {
    return [
      {
        name: '大标题居中式',
        template: (title) => `A 900x383 pixel infographic with a warm cream paper texture background. In the center, a large bold Chinese title "${title}" in hand-drawn style colored pencil text. Important: keep all core content within the center 383x383 pixel area to prevent cropping. Around the title, 2-3 small playful doodle icons related to the topic. Colored pencil line art with light watercolor wash. Warm color palette, clean and cute style, ample white space. No 3D, no photorealism, no complex gradients. Chinese text must be clear and readable with large font.`
      },
      {
        name: '标题左置+右侧装饰',
        template: (title) => `A 900x383 pixel infographic with a warm cream paper texture background. On the left side, a large bold Chinese title "${title}" in hand-drawn colored pencil text. On the right side, 2-3 playful illustrations related to business and finance. Important: keep core content within the center 383x383 pixel area. Colored pencil line art with light watercolor wash. Warm color palette, doodle style, clean and cute. No 3D, no photorealism. Chinese text must be clear and readable.`
      }
    ];
  }

  /**
   * 加载信息图模板
   */
  loadInfographicTemplates() {
    return [
      {
        name: '要点列表式',
        template: (title, items) => `A 900x383 pixel infographic on warm cream paper texture background. Title at top: "${title}" in hand-drawn colored pencil text. Below, ${items.length} horizontal cards, each with a small icon and a short Chinese point. Items: ${items.map((item, i) => `${i + 1}. ${item}`).join('; ')}. Important: keep core content within the center 383x383 pixel area. Colored pencil line art with light watercolor wash. Warm color palette, clean layout with arrows between cards. Ample white space, Chinese text clear and readable. No 3D, no photorealism.`
      },
      {
        name: '流程步骤式',
        template: (title, items) => `A 900x383 pixel infographic on warm cream paper texture showing a ${items.length}-step process. Each step in a rounded rectangle card with hand-drawn border. Arrows connecting the cards from left to right. Each card has a number and a short Chinese description. Steps: ${items.map((item, i) => `${i + 1}. ${item}`).join('; ')}. Important: keep content within center 383x383 pixel area. Colored pencil line art with light watercolor wash. Warm pastel colors, clean alignment. Chinese text clear and readable. Playful doodle style. No 3D, no photorealism.`
      }
    ];
  }

  /**
   * 加载引导图模板
   */
  loadCtaTemplates() {
    return [
      {
        name: '关注引导',
        template: () => `A 900x383 pixel infographic on warm cream paper texture. Center: a hand-drawn heart or star icon. Below: Chinese text "点个【在看】，让更多人看到" in playful colored pencil style. Important: keep core content within the center 383x383 pixel area. Small decorative doodles around (stars, dots, squiggles). Colored pencil line art with light watercolor wash. Warm pink/orange tones, cute and inviting. Chinese text clear and readable with large font. No 3D, no photorealism. Playful doodle style.`
      },
      {
        name: '互动提问',
        template: (topic) => `A 900x383 pixel infographic on warm cream paper texture. Top: a hand-drawn question mark icon. Center: Chinese text "你在${topic}中遇到过什么问题？" in bold colored pencil text. Important: keep content within center 383x383 pixel area. Bottom: smaller text "欢迎在评论区分享~". Colored pencil line art with light watercolor wash. Warm blue/purple tones, friendly and inviting. Chinese text clear and readable. No 3D, no photorealism. Playful doodle style.`
      }
    ];
  }

  /**
   * 解析文章文件
   */
  parseArticle(articlePath) {
    const content = fs.readFileSync(articlePath, 'utf8');

    // 解析 frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    let frontmatter = {};
    let articleContent = content;

    if (frontmatterMatch) {
      const frontmatterContent = frontmatterMatch[1];
      frontmatterContent.split('\n').forEach(line => {
        const match = line.match(/^(\w+):\s*(.*)$/);
        if (match) {
          frontmatter[match[1]] = match[2];
        }
      });
      articleContent = content.replace(frontmatterMatch[0], '').trim();
    }

    // 提取标题
    const title = frontmatter.title || this.extractTitle(articleContent) || '文章标题';

    // 提取关键点
    const keyPoints = this.extractKeyPoints(articleContent);

    return {
      title,
      content: articleContent,
      frontmatter,
      keyPoints
    };
  }

  /**
   * 提取文章标题
   */
  extractTitle(content) {
    const titleMatch = content.match(/^#\s+(.+)$/m);
    return titleMatch ? titleMatch[1].trim() : null;
  }

  /**
   * 提取文章关键点
   */
  extractKeyPoints(content) {
    const points = [];

    // 提取标题下的关键点
    const lines = content.split('\n');
    for (const line of lines) {
      // 匹配 ### 或 ** 开头的标题行
      const headerMatch = line.match(/^###\s+(.+)$/);
      const boldMatch = line.match(/^\*\*(.+)\*\*/);

      if (headerMatch) {
        points.push(headerMatch[1].trim());
      } else if (boldMatch) {
        points.push(boldMatch[1].trim());
      }

      if (points.length >= 5) break;
    }

    // 如果没有找到足够的关键点，使用默认
    if (points.length < 3) {
      return ['方法1', '方法2', '方法3', '方法4', '方法5'];
    }

    return points.slice(0, 5);
  }

  /**
   * 为文章生成配图提示词
   * @param {string} articlePath - 文章路径
   * @returns {Object} 包含所有提示词的对象
   */
  generatePrompts(articlePath) {
    const article = this.parseArticle(articlePath);
    const { title, keyPoints } = article;

    const prompts = [];

    // 1. 封面图提示词
    const coverTemplate = this.templates.cover[0];
    prompts.push({
      id: 'cover',
      type: 'cover',
      template: coverTemplate.name,
      prompt: coverTemplate.template(title),
      size: '900x383'
    });

    // 2. 信息图提示词（2-3张）
    const infographicCount = Math.min(3, Math.ceil(keyPoints.length / 2));
    for (let i = 0; i < infographicCount; i++) {
      const startIdx = i * 2;
      const endIdx = Math.min(startIdx + 2, keyPoints.length);
      const items = keyPoints.slice(startIdx, endIdx);

      const template = this.templates.infographic[i % this.templates.infographic.length];
      prompts.push({
        id: `info${i + 1}`,
        type: 'infographic',
        template: template.name,
        prompt: template.template(`要点${i + 1}`, items),
        size: '900x383'
      });
    }

    // 3. 引导图提示词
    const ctaTemplate = this.templates.cta[0];
    prompts.push({
      id: 'cta',
      type: 'cta',
      template: ctaTemplate.name,
      prompt: ctaTemplate.template(),
      size: '900x383'
    });

    return {
      article,
      prompts
    };
  }

  /**
   * 保存提示词到JSONL文件（用于Python脚本）
   * @param {Object} result - generatePrompts返回的结果
   * @param {string} outputPath - 输出路径
   */
  savePromptsToJsonl(result, outputPath) {
    const jsonlContent = result.prompts.map(p =>
      JSON.stringify({ id: p.id, size: p.size, prompt: p.prompt })
    ).join('\n');

    fs.writeFileSync(outputPath, jsonlContent, 'utf8');
    return outputPath;
  }

  /**
   * 保存提示词到Markdown文件（可读格式）
   * @param {Object} result - generatePrompts返回的结果
   * @param {string} outputPath - 输出路径
   */
  savePromptsToMarkdown(result, outputPath) {
    let md = `# ${result.article.title} - 配图提示词\n\n`;
    md += `## 文章信息\n\n`;
    md += `- 标题: ${result.article.title}\n`;
    md += `- 关键点数: ${result.article.keyPoints.length}\n`;
    md += `- 配图数量: ${result.prompts.length}\n\n`;

    md += `## 配图提示词\n\n`;

    result.prompts.forEach((p, i) => {
      md += `### ${i + 1}. ${p.id} - ${this.getTypeName(p.type)} (${p.template})\n\n`;
      md += `\`\`\`\n${p.prompt}\n\`\`\`\n\n`;
    });

    md += `## 使用方法\n\n`;
    md += `1. 确认已配置 \`scripts/image.env\` 文件\n`;
    md += `2. 运行命令生成图片:\n`;
    md += `\`\`\`bash\n`;
    md += `python scripts/generate_images.py --input ${path.basename(outputPath, '.md')}.jsonl --out ./images\n`;
    md += `\`\`\`\n`;

    fs.writeFileSync(outputPath, md, 'utf8');
    return outputPath;
  }

  /**
   * 获取类型中文名
   */
  getTypeName(type) {
    const names = {
      'cover': '封面图',
      'infographic': '信息图',
      'cta': '引导图'
    };
    return names[type] || type;
  }

  /**
   * 格式化输出提示词
   */
  formatPrompts(result) {
    let output = `\n📸 配图提示词生成结果\n`;
    output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    output += `文章标题: ${result.article.title}\n`;
    output += `配图数量: ${result.prompts.length}\n\n`;

    result.prompts.forEach((p, i) => {
      output += `${i + 1}. [${p.id}] ${this.getTypeName(p.type)} - ${p.template}\n`;
      output += `   ${p.prompt.substring(0, 80)}...\n\n`;
    });

    return output;
  }
}

// 导出
module.exports = ImagePromptGenerator;

// 命令行入口
if (require.main === module) {
  const generator = new ImagePromptGenerator();
  const articlePath = process.argv[2];

  if (!articlePath) {
    console.log('\n📸 配图提示词生成器\n');
    console.log('用法:');
    console.log('  node image-prompt-generator.cjs <文章路径>\n');
    console.log('示例:');
    console.log('  node image-prompt-generator.cjs ./article.md\n');
    process.exit(1);
  }

  try {
    const result = generator.generatePrompts(articlePath);

    // 输出到控制台
    console.log(generator.formatPrompts(result));

    // 保存到文件
    const articleDir = path.dirname(articlePath);
    const articleName = path.basename(articlePath, '.md');
    const jsonlPath = path.join(articleDir, `${articleName}_prompts.jsonl`);
    const mdPath = path.join(articleDir, `${articleName}_配图提示词.md`);

    generator.savePromptsToJsonl(result, jsonlPath);
    generator.savePromptsToMarkdown(result, mdPath);

    console.log(`✅ 提示词已保存:`);
    console.log(`   JSONL: ${jsonlPath}`);
    console.log(`   Markdown: ${mdPath}\n`);
    console.log(`💡 下一步: 运行以下命令生成图片`);
    console.log(`   python scripts/generate_images.py --input "${jsonlPath}"\n`);

  } catch (e) {
    console.error(`❌ 错误: ${e.message}`);
    process.exit(1);
  }
}
