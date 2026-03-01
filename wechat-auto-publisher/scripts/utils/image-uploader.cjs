/**
 * 图片上传器
 * 处理图片批量上传到微信素材库
 */

const fs = require('fs');
const path = require('path');

class ImageUploader {
  constructor(apiClient, options = {}) {
    this.apiClient = apiClient;
    this.maxSize = options.maxSize || 2 * 1024 * 1024; // 默认2MB
    this.supportedFormats = options.supportedFormats || ['jpg', 'jpeg', 'png', 'gif'];
  }

  /**
   * 检查图片是否符合要求
   * @param {string} imagePath 图片路径
   * @returns {Object} 检查结果
   */
  checkImage(imagePath) {
    if (!fs.existsSync(imagePath)) {
      return { valid: false, error: '文件不存在' };
    }

    const ext = path.extname(imagePath).toLowerCase().replace('.', '');
    if (!this.supportedFormats.includes(ext)) {
      return {
        valid: false,
        error: `不支持的图片格式，仅支持: ${this.supportedFormats.join(', ')}`
      };
    }

    const stats = fs.statSync(imagePath);
    if (stats.size > this.maxSize) {
      return {
        valid: false,
        error: `图片大小超过${Math.floor(this.maxSize / 1024 / 1024)}MB限制`
      };
    }

    return { valid: true };
  }

  /**
   * 上传单张图片
   * @param {string} imagePath 图片路径
   * @returns {Promise<string>} 图片URL
   */
  async uploadImage(imagePath) {
    // 检查图片
    const check = this.checkImage(imagePath);
    if (!check.valid) {
      throw new Error(check.error);
    }

    // 上传图片
    return await this.apiClient.uploadImage(imagePath);
  }

  /**
   * 批量上传图片
   * @param {Array<string>} imagePaths 图片路径数组
   * @returns {Promise<Object>} 上传结果映射
   */
  async uploadImages(imagePaths) {
    const results = {
      success: {},
      failed: {}
    };

    for (const imagePath of imagePaths) {
      try {
        const url = await this.uploadImage(imagePath);
        results.success[imagePath] = url;
      } catch (error) {
        results.failed[imagePath] = error.message;
      }
    }

    return results;
  }

  /**
   * 从HTML内容中提取图片路径
   * @param {string} html HTML内容
   * @param {string} basePath 基础路径（用于相对路径）
   * @returns {Array<string>} 图片路径数组
   */
  extractImagesFromHTML(html, basePath = '.') {
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    const images = [];
    let match;

    while ((match = imgRegex.exec(html)) !== null) {
      let src = match[1];

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

  /**
   * 上传HTML中的图片并替换URL
   * @param {string} html HTML内容
   * @param {string} basePath 基础路径
   * @returns {Promise<Object>} { html: 替换后的HTML, results: 上传结果 }
   */
  async uploadAndReplaceImages(html, basePath = '.') {
    const images = this.extractImagesFromHTML(html, basePath);
    const results = await this.uploadImages(images);

    // 替换成功上传的图片URL
    let newHtml = html;
    for (const [localPath, remoteUrl] of Object.entries(results.success)) {
      // 将绝对路径转回相对路径用于匹配
      const relativePath = path.relative(basePath, localPath).replace(/\\/g, '/');
      // 匹配并替换
      const regex = new RegExp(`<img[^>]+src=["']([^"']*${relativePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"']*)["'][^>]*>`, 'gi');
      newHtml = newHtml.replace(regex, (match) => {
        return match.replace(/src=["'][^"']*["']/i, `src="${remoteUrl}"`);
      });
    }

    return {
      html: newHtml,
      results: results
    };
  }
}

module.exports = ImageUploader;
