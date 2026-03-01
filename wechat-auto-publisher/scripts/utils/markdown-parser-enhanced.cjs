/**
 * Markdown解析器 - 八宝说财审风格增强版
 * 解析Markdown文件并转换为公众号格式
 */

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

class MarkdownParser {
  constructor(options = {}) {
    this.defaultAuthor = options.defaultAuthor || '八宝';
  }

  /**
   * 解析YAML frontmatter
   */
  parseFrontmatter(content) {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    if (!match) {
      return {
        meta: {},
        content: content
      };
    }

    const meta = {};
    const frontmatter = match[1];

    const lines = frontmatter.split('\n');
    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();

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
   */
  parseFile(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`文件不存在: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const { meta, content: body } = this.parseFrontmatter(content);

    return {
      title: meta.title || path.basename(filePath, '.md'),
      subtitle: meta.subtitle || '',
      author: meta.author || this.defaultAuthor,
      summary: meta.summary || '',
      cover: meta.cover || '',
      tags: meta.tags ? meta.tags.split(',').map(t => t.trim()) : [],
      date: meta.date || new Date().toISOString().split('T')[0],
      content: body,
      basePath: path.dirname(filePath)
    };
  }

  /**
   * 将Markdown转换为HTML（适配公众号）
   */
  markdownToHTML(markdown) {
    marked.setOptions({
      breaks: true,
      gfm: true,
      headerIds: false,
      mangle: false
    });

    let html = marked(markdown);
    html = this.adaptForWeChat(html);
    return this.enhanceForBabaoStyle(html);
  }

  /**
   * 适配微信公众号格式
   */
  adaptForWeChat(html) {
    let adapted = html;

    // 处理图片
    adapted = adapted.replace(/<img([^>]*?)>/gi, (match, attrs) => {
      const srcMatch = attrs.match(/src=["']([^"']+)["']/i);
      const src = srcMatch ? srcMatch[1] : '';
      return `<img src="${src}" style="max-width: 100%; height: auto; display: block; margin: 24px auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />`;
    });

    // 处理链接
    adapted = adapted.replace(/<a([^>]*?)>/gi, (match, attrs) => {
      const hrefMatch = attrs.match(/href=["']([^"']+)["']/i);
      const href = hrefMatch ? hrefMatch[1] : '';
      return `<a href="${href}" style="color: #576b95; text-decoration: none; border-bottom: 1px solid transparent;">`;
    });

    // 处理表格
    adapted = adapted.replace(/<table>/gi, '<table style="border-collapse: collapse; width: 100%; margin: 24px 0; font-size: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">');
    adapted = adapted.replace(/<th>/gi, '<th style="background: linear-gradient(135deg, #576b95 0%, #4a5c7a 100%); color: #fff; padding: 12px 16px; border: 1px solid #e0e0e0; text-align: left;">');
    adapted = adapted.replace(/<td>/gi, '<td style="border: 1px solid #e0e0e0; padding: 12px 16px; text-align: left;">');
    adapted = adapted.replace(/<tr>/gi, '<tr style="background: #fff;">');

    // 处理标题
    adapted = adapted.replace(/<h1([^>]*)>/gi, '<h1 style="font-size: 28px; border-bottom: 3px solid #576b95; padding-bottom: 12px; margin-bottom: 20px; color: #1a1a1a; margin-top: 32px;">');
    adapted = adapted.replace(/<h2([^>]*)>/gi, '<h2 style="font-size: 22px; border-left: 4px solid #576b95; padding-left: 12px; margin-top: 40px; color: #1a1a1a;">');
    adapted = adapted.replace(/<h3([^>]*)>/gi, '<h3 style="font-size: 18px; margin-top: 24px; color: #444;">');

    // 处理引用块（重要金句）
    adapted = adapted.replace(/<blockquote>/gi, '<blockquote style="border-left: 4px solid #576b95; padding: 16px 20px; margin: 24px 0; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); color: #2c3e50; font-style: italic; border-radius: 0 8px 8px 0;">');

    // 处理段落
    adapted = adapted.replace(/<p>/gi, '<p style="margin-bottom: 16px; text-align: justify; line-height: 1.8;">');

    // 处理代码块
    adapted = adapted.replace(/<pre>/gi, '<pre style="background: #2c3e50; color: #ecf0f1; padding: 16px; border-radius: 8px; overflow-x: auto; margin: 20px 0;">');
    adapted = adapted.replace(/<code>/gi, '<code style="background: #f5f5f5; padding: 3px 8px; border-radius: 4px; font-family: Consolas, Monaco, monospace; font-size: 14px; color: #e74c3c;">');

    // 处理列表
    adapted = adapted.replace(/<ul>/gi, '<ul style="padding-left: 24px; margin: 16px 0;">');
    adapted = adapted.replace(/<ol>/gi, '<ol style="padding-left: 24px; margin: 16px 0;">');
    adapted = adapted.replace(/<li>/gi, '<li style="margin-bottom: 8px; line-height: 1.7;">');

    // 处理分隔线
    adapted = adapted.replace(/<hr>/gi, '<hr style="border: none; border-top: 2px dashed #ddd; margin: 40px 0;">');

    return adapted;
  }

  /**
   * 增强八宝说财审风格元素
   */
  enhanceForBabaoStyle(html) {
    let enhanced = html;

    // 将 ✅/❌ 开头的列表项转换为特殊样式
    enhanced = enhanced.replace(/<li>[✅❌]\s*/gi, (match) => {
      const symbol = match.includes('✅') ? '✅' : '❌';
      return `<li style="padding-left: 32px; position: relative;"><span style="position: absolute; left: 0; font-size: 20px;">${symbol}</span>`;
    });

    // 处理加粗文字（关键结论）
    enhanced = enhanced.replace(/<strong>(.*?)<\/strong>/gi, (match, content) => {
      return `<strong style="font-weight: 700; color: #1a1a1a;">${content}</strong>`;
    });

    return enhanced;
  }

  /**
   * 构建公众号文章数据结构
   */
  buildArticleData(parsed, htmlContent, thumbMediaId = '') {
    const articleData = {
      title: parsed.title,
      author: parsed.author,
      digest: parsed.summary,
      content: htmlContent,
      content_source_url: '',
      need_open_comment: 1,
      only_fans_can_comment: 0,
      show_cover_pic: 0
    };

    if (thumbMediaId) {
      articleData.thumb_media_id = thumbMediaId;
      articleData.show_cover_pic = 1;
    } else {
      articleData.thumb_media_id = '';
    }

    return articleData;
  }

  /**
   * 提取文章中的图片路径
   */
  extractImages(markdown, basePath = '.') {
    const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/gi;
    const images = [];
    let match;

    while ((match = imgRegex.exec(markdown)) !== null) {
      let src = match[2];

      if (/^https?:\/\//i.test(src)) {
        continue;
      }

      if (!path.isAbsolute(src)) {
        src = path.resolve(basePath, src);
      }

      images.push(src);
    }

    return images;
  }
}

module.exports = MarkdownParser;
