/**
 * 微信公众号API客户端
 * 封装微信公众号常用API调用
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

class WeChatAPIClient {
  constructor(config) {
    this.appid = config.WECHAT_APPID;
    this.appsecret = config.WECHAT_APPSECRET;
    this.apiBase = config.WECHAT_API_BASE || 'https://api.weixin.qq.com';
    this.accessToken = null;
    this.tokenExpireTime = 0;
    this.tokenExpireTimeSec = parseInt(config.TOKEN_EXPIRE_TIME || '7000');
  }

  /**
   * 获取access_token
   * @returns {Promise<string>} access_token
   */
  async getAccessToken() {
    // 检查缓存是否有效
    if (this.accessToken && Date.now() < this.tokenExpireTime) {
      return this.accessToken;
    }

    // 获取新的token
    try {
      const response = await axios.get(`${this.apiBase}/cgi-bin/token`, {
        params: {
          grant_type: 'client_credential',
          appid: this.appid,
          secret: this.appsecret
        }
      });

      if (response.data.errcode) {
        throw new Error(`获取access_token失败: ${response.data.errmsg} (${response.data.errcode})`);
      }

      this.accessToken = response.data.access_token;
      this.tokenExpireTime = Date.now() + this.tokenExpireTimeSec * 1000;

      return this.accessToken;
    } catch (error) {
      throw new Error(`获取access_token失败: ${error.message}`);
    }
  }

  /**
   * 上传图片素材
   * @param {string} imagePath 图片路径
   * @returns {Promise<string>} 图片URL
   */
  async uploadImage(imagePath) {
    try {
      const token = await this.getAccessToken();

      // 检查文件是否存在
      if (!fs.existsSync(imagePath)) {
        throw new Error(`图片文件不存在: ${imagePath}`);
      }

      // 检查文件大小
      const stats = fs.statSync(imagePath);
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (stats.size > maxSize) {
        throw new Error(`图片大小超过2MB限制: ${imagePath}`);
      }

      // 创建form-data
      const form = new FormData();
      form.append('media', fs.createReadStream(imagePath));
      form.append('type', 'image');

      const response = await axios.post(
        `${this.apiBase}/cgi-bin/material/add_material`,
        form,
        {
          params: { access_token: token },
          headers: {
            ...form.getHeaders()
          }
        }
      );

      if (response.data.errcode) {
        throw new Error(`上传图片失败: ${response.data.errmsg} (${response.data.errcode})`);
      }

      return response.data.url;
    } catch (error) {
      throw new Error(`上传图片失败: ${error.message}`);
    }
  }

  /**
   * 创建草稿
   * @param {Array} articles 文章数组
   * @returns {Promise<string>} media_id
   */
  async createDraft(articles) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.post(
        `${this.apiBase}/cgi-bin/draft/add`,
        { articles },
        {
          params: { access_token: token }
        }
      );

      if (response.data.errcode) {
        throw new Error(`创建草稿失败: ${response.data.errmsg} (${response.data.errcode})`);
      }

      return response.data.media_id;
    } catch (error) {
      throw new Error(`创建草稿失败: ${error.message}`);
    }
  }

  /**
   * 发布草稿
   * @param {string} mediaId 草稿media_id
   * @returns {Promise<boolean>} 是否成功
   */
  async publishDraft(mediaId) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.post(
        `${this.apiBase}/cgi-bin/freepublish/submit`,
        { media_id: mediaId },
        {
          params: { access_token: token }
        }
      );

      if (response.data.errcode) {
        throw new Error(`发布草稿失败: ${response.data.errmsg} (${response.data.errcode})`);
      }

      return response.data.msg_id || true;
    } catch (error) {
      throw new Error(`发布草稿失败: ${error.message}`);
    }
  }

  /**
   * 获取草稿列表
   * @param {number} offset 偏移量
   * @param {number} count 数量（最大20）
   * @returns {Promise<Array>} 草稿列表
   */
  async getDrafts(offset = 0, count = 20) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.post(
        `${this.apiBase}/cgi-bin/draft/get`,
        { offset, count },
        {
          params: { access_token: token }
        }
      );

      if (response.data.errcode) {
        throw new Error(`获取草稿列表失败: ${response.data.errmsg} (${response.data.errcode})`);
      }

      return response.data.item || [];
    } catch (error) {
      throw new Error(`获取草稿列表失败: ${error.message}`);
    }
  }

  /**
   * 删除草稿
   * @param {string} mediaId 草稿media_id
   * @returns {Promise<boolean>} 是否成功
   */
  async deleteDraft(mediaId) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.post(
        `${this.apiBase}/cgi-bin/draft/delete`,
        { media_id: mediaId },
        {
          params: { access_token: token }
        }
      );

      if (response.data.errcode) {
        throw new Error(`删除草稿失败: ${response.data.errmsg} (${response.data.errcode})`);
      }

      return true;
    } catch (error) {
      throw new Error(`删除草稿失败: ${error.message}`);
    }
  }
}

module.exports = WeChatAPIClient;
