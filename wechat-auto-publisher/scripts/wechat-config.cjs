/**
 * 微信公众号配置管理脚本
 * 用于配置AppID/AppSecret和测试连接
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const dotenv = require('dotenv');

// 配置文件路径
const configDir = path.join(__dirname, 'config');
const envExamplePath = path.join(configDir, 'wechat.env.example');
const envPath = path.join(configDir, 'wechat.env');

// API客户端类
class WeChatAPIClient {
  constructor(appid, appsecret) {
    this.appid = appid;
    this.appsecret = appsecret;
    this.apiBase = 'https://api.weixin.qq.com';
  }

  async testConnection() {
    const axios = require('axios');
    try {
      const response = await axios.get(`${this.apiBase}/cgi-bin/token`, {
        params: {
          grant_type: 'client_credential',
          appid: this.appid,
          secret: this.appsecret
        }
      });

      if (response.data.errcode) {
        return {
          success: false,
          error: `错误码 ${response.data.errcode}: ${response.data.errmsg}`
        };
      }

      return {
        success: true,
        accessToken: response.data.access_token.substring(0, 20) + '...'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

/**
 * 从.env文件加载配置
 */
function loadConfig() {
  if (!fs.existsSync(envPath)) {
    return null;
  }

  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  return envConfig;
}

/**
 * 保存配置到.env文件
 */
function saveConfig(appid, appsecret) {
  let content = '';

  // 如果存在.env文件，读取其他配置项
  if (fs.existsSync(envPath)) {
    const existing = dotenv.parse(fs.readFileSync(envPath));
    content = `# 微信公众号开发者凭证\n`;
    content += `# 获取方式：公众号后台 -> 设置与开发 -> 基本配置\n`;
    content += `WECHAT_APPID=${appid}\n`;
    content += `WECHAT_APPSECRET=${appsecret}\n`;

    // 保留其他配置项
    for (const [key, value] of Object.entries(existing)) {
      if (key !== 'WECHAT_APPID' && key !== 'WECHAT_APPSECRET') {
        content += `${key}=${value}\n`;
      }
    }
  } else {
    // 从example复制
    if (fs.existsSync(envExamplePath)) {
      content = fs.readFileSync(envExamplePath, 'utf-8');
      content = content.replace(/WECHAT_APPID=.*/, `WECHAT_APPID=${appid}`);
      content = content.replace(/WECHAT_APPSECRET=.*/, `WECHAT_APPSECRET=${appsecret}`);
    } else {
      content = `# 微信公众号开发者凭证\n`;
      content += `# 获取方式：公众号后台 -> 设置与开发 -> 基本配置\n`;
      content += `WECHAT_APPID=${appid}\n`;
      content += `WECHAT_APPSECRET=${appsecret}\n`;
      content += `WECHAT_API_BASE=https://api.weixin.qq.com\n`;
      content += `TOKEN_EXPIRE_TIME=7000\n`;
      content += `MAX_IMAGE_SIZE=2097152\n`;
      content += `DEFAULT_AUTHOR=默认作者名\n`;
    }
  }

  fs.writeFileSync(envPath, content, 'utf-8');
}

/**
 * 交互式输入
 */
function question(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

/**
 * 配置向导
 */
async function configWizard() {
  console.log('\n=== 微信公众号配置向导 ===\n');

  // 检查是否已有配置
  const existingConfig = loadConfig();
  if (existingConfig && existingConfig.WECHAT_APPID) {
    console.log(`已配置的AppID: ${existingConfig.WECHAT_APPID}`);
    const reconfig = await question('是否重新配置? (y/N): ');
    if (reconfig.toLowerCase() !== 'y') {
      console.log('配置已取消。');
      return;
    }
  }

  console.log('\n请登录微信公众平台获取AppID和AppSecret：');
  console.log('1. 访问 https://mp.weixin.qq.com');
  console.log('2. 进入「设置与开发」→「基本配置」\n');

  const appid = await question('请输入AppID: ');
  if (!appid || appid.trim() === '') {
    console.log('AppID不能为空！');
    return;
  }

  const appsecret = await question('请输入AppSecret: ');
  if (!appsecret || appsecret.trim() === '') {
    console.log('AppSecret不能为空！');
    return;
  }

  // 保存配置
  saveConfig(appid.trim(), appsecret.trim());
  console.log('\n✓ 配置已保存到: ' + envPath);

  // 测试连接
  console.log('\n正在测试连接...');
  const client = new WeChatAPIClient(appid.trim(), appsecret.trim());
  const result = await client.testConnection();

  if (result.success) {
    console.log('✓ 连接成功！Access Token已获取。');
    console.log('\n⚠ 重要提示：');
    console.log('1. 请在公众号后台配置服务器IP白名单');
    console.log('2. ' + envPath + ' 包含敏感信息，请勿分享或提交到版本控制');
    console.log('3. 建议将该文件添加到 .gitignore');
  } else {
    console.log('✗ 连接失败: ' + result.error);
    console.log('\n请检查：');
    console.log('1. AppID和AppSecret是否正确');
    console.log('2. 公众号类型是否为已认证的订阅号或服务号');
    console.log('3. IP白名单是否已配置');
  }
}

/**
 * 测试连接
 */
async function testConnection() {
  const config = loadConfig();
  if (!config || !config.WECHAT_APPID || !config.WECHAT_APPSECRET) {
    console.log('✗ 配置不存在，请先运行 /wx-config 进行配置');
    return;
  }

  console.log('正在测试微信API连接...');
  console.log(`AppID: ${config.WECHAT_APPID}`);

  const client = new WeChatAPIClient(config.WECHAT_APPID, config.WECHAT_APPSECRET);
  const result = await client.testConnection();

  if (result.success) {
    console.log('✓ 连接成功！');
    console.log(`Access Token: ${result.accessToken}`);
  } else {
    console.log('✗ 连接失败: ' + result.error);
    process.exit(1);
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--test')) {
    await testConnection();
  } else {
    await configWizard();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(error => {
    console.error('错误:', error.message);
    process.exit(1);
  });
}

module.exports = { loadConfig, configWizard, testConnection };
