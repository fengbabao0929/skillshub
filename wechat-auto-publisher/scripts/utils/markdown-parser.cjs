/**
 * Markdown解析器
 * 解析Markdown文件并转换为公众号格式
 */

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

class MarkdownParser {
  constructor(options = {}) {
    this.defaultAuthor = options.defaultAuthor || '默认作者';
  }

  /**
   * 解析YAML frontmatter
   * @param {string} content 文件内容
   * @returns {Object} { meta: 元数据, content: 正文内容 }
   */
  parseFrontmatter(content) {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    if (!match) {
      // 没有frontmatter，直接返回内容
      return {
        meta: {},
        content: content
      };
    }

    const meta = {};
    const frontmatter = match[1];

    // 解析YAML格式的frontmatter
    const lines = frontmatter.split('\n');
    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();

        // 移除引号
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.substring(1, value.length - 1);
        }

        meta[key] = value;
      }
    }

    return {
      meta: meta,
      content: match[2]
    };
  }

  /**
   * 解析Markdown文件
   * @param {string} filePath 文件路径
   * @returns {Object} 解析结果
   */
  parseFile(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`文件不存在: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const { meta, content: body } = this.parseFrontmatter(content);

    return {
      title: meta.title || path.basename(filePath, '.md'),
      author: meta.author || this.defaultAuthor,
      summary: meta.summary || '',
      cover: meta.cover || '',
      tags: meta.tags ? meta.tags.split(',').map(t => t.trim()) : [],
      content: body,
      basePath: path.dirname(filePath)
    };
  }

  /**
   * 将Markdown转换为HTML（适配公众号）
   * @param {string} markdown Markdown内容
   * @returns {string} HTML内容
   */
  markdownToHTML(markdown) {
    // 配置marked选项
    marked.setOptions({
      breaks: true,        // 支持换行
      gfm: true,           // 支持GitHub风格
      headerIds: false,    // 不生成标题ID
      mangle: false        // 不转义邮箱
    });

    const html = marked(markdown);

    // 清理和适配公众号格式
    return this.adaptForWeChat(html);
  }

  /**
   * 适配微信公众号格式
   * @param {string} html HTML内容
   * @returns {string} 适配后的HTML
   */
  adaptForWeChat(html) {
    // 公众号支持的HTML标签和属性有限，需要简化
    let adapted = html;

    // 移除不支持的标签属性，只保留基本样式
    adapted = adapted.replace(/<h([1-6])([^>]*)>/gi, (match, level, attrs) => {
      return `<h${level}>`;
    });

    // 处理代码块
    adapted = adapted.replace(/<pre>/gi, '<pre style="background: #f5f5f5; padding: 10px; border-radius: 5px;">');

    // 处理引用块
    adapted = adapted.replace(/<blockquote>/gi, '<blockquote style="border-left: 4px solid #ddd; padding-left: 10px; color: #666;">');

    // 处理粗体
    adapted = adapted.replace(/<strong>/gi, '<strong style="font-weight: bold;">');

    // 处理图片
    adapted = adapted.replace(/<img([^>]*?)>/gi, (match, attrs) => {
      // 保留src和style属性
      const srcMatch = attrs.match(/src=["']([^"']+)["']/i);
      const src = srcMatch ? srcMatch[1] : '';
      return `<img src="${src}" style="max-width: 100%; height: auto; display: block;" />`;
    });

    // 处理链接
    adapted = adapted.replace(/<a([^>]*?)>/gi, (match, attrs) => {
      const hrefMatch = attrs.match(/href=["']([^"']+)["']/i);
      const href = hrefMatch ? hrefMatch[1] : '';
      return `<a href="${href}" style="color: #576b95; text-decoration: none;">`;
    });

    // 处理列表
    adapted = adapted.replace(/<ul>/gi, '<ul style="padding-left: 20px;">');
    adapted = adapted.replace(/<ol>/gi, '<ol style="padding-left: 20px;">');

    // 处理段落
    adapted = adapted.replace(/<p>/gi, '<p style="margin: 10px 0; line-height: 1.6;">');

    return adapted;
  }

  /**
   * 构建公众号文章数据结构
   * @param {Object} parsed 解析后的文章数据
   * @param {string} htmlContent HTML正文
   * @param {string} thumbMediaId 封面图media_id
   * @returns {Object} 公众号文章数据
   */
  buildArticleData(parsed, htmlContent, thumbMediaId = '') {
    const articleData = {
      title: parsed.title,
      author: parsed.author,
      digest: parsed.summary,
      content: htmlContent,
      content_source_url: '', // 原文链接
      need_open_comment: 1,    // 打开评论
      only_fans_can_comment: 0, // 所有人可评论
      show_cover_pic: 0        // 默认不显示封面
    };

    // thumb_media_id是必需字段
    if (thumbMediaId) {
      articleData.thumb_media_id = thumbMediaId;
      articleData.show_cover_pic = 1;
    } else {
      // 没有封面图时使用空字符串
      articleData.thumb_media_id = '';
    }

    return articleData;
  }

  /**
   * 提取文章中的图片路径
   * @param {string} markdown Markdown内容
   * @param {string} basePath 基础路径
   * @returns {Array<string>} 图片路径数组
   */
  extractImages(markdown, basePath = '.') {
    const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/gi;
    const images = [];
    let match;

    while ((match = imgRegex.exec(markdown)) !== null) {
      let src = match[2];

      // 跳过http/https开头的远程图片
      if (/^https?:\/\//i.test(src)) {
        continue;
      }

      // 转换相对路径为绝对路径
      if (!path.isAbsolute(src)) {
        src = path.resolve(basePath, src);
      }

      images.push(src);
    }

    return images;
  }
}

module.exports = MarkdownParser;
