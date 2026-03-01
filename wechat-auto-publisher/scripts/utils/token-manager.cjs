/**
 * Token管理器
 * 管理access_token的缓存和刷新
 */

class TokenManager {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  /**
   * 获取有效的access_token
   * 如果token过期或不存在，会自动刷新
   * @returns {Promise<string>} access_token
   */
  async getToken() {
    return await this.apiClient.getAccessToken();
  }

  /**
   * 强制刷新token
   * @returns {Promise<string>} 新的access_token
   */
  async refreshToken() {
    // 清除缓存，强制刷新
    this.apiClient.accessToken = null;
    this.apiClient.tokenExpireTime = 0;
    return await this.apiClient.getAccessToken();
  }

  /**
   * 检查token是否有效
   * @returns {boolean} 是否有效
   */
  isTokenValid() {
    return this.apiClient.accessToken &&
           Date.now() < this.apiClient.tokenExpireTime;
  }

  /**
   * 获取token剩余有效时间（秒）
   * @returns {number} 剩余秒数
   */
  getTokenTTL() {
    if (!this.isTokenValid()) {
      return 0;
    }
    return Math.floor((this.apiClient.tokenExpireTime - Date.now()) / 1000);
  }
}

module.exports = TokenManager;
