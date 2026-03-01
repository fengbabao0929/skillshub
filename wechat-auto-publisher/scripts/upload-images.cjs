/**
 * 图片上传工具 - 批量上传图片到微信素材库
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// 从API客户端模块导入
const WeChatAPIClient = require('./utils/api-client.cjs');
const ImageUploader = require('./utils/image-uploader.cjs');

/**
 * 加载配置文件
 */
function loadConfig() {
  const configPath = path.join(__dirname, 'config', 'wechat.env');
  if (!fs.existsSync(configPath)) {
    console.error(`❌ 配置文件不存在: ${configPath}`);
    console.error(`请先运行 /wx-config 进行配置`);
    process.exit(1);
  }
  return dotenv.parse(fs.readFileSync(configPath));
}

/**
 * 上传指定目录的图片到微信素材库
 */
async function uploadImagesToMaterial(imageDir) {
  // 加载配置
  const config = loadConfig();
  const apiClient = new WeChatAPIClient(config);
  const uploader = new ImageUploader(apiClient);

  // 检查目录是否存在
  if (!fs.existsSync(imageDir)) {
    console.error(`❌ 目录不存在: ${imageDir}`);
    process.exit(1);
  }

  // 获取所有图片文件
  const files = fs.readdirSync(imageDir);
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.png', '.jpg', '.jpeg', '.gif'].includes(ext);
  });

  if (imageFiles.length === 0) {
    console.log('📁 目录中没有图片文件');
    return;
  }

  console.log(`\n📸 准备上传 ${imageFiles.length} 张图片到微信素材库\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const results = {
    success: [],
    failed: []
  };

  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    const imagePath = path.join(imageDir, file);
    const fileName = path.basename(file);

    console.log(`[${i + 1}/${imageFiles.length}] 上传 ${fileName}...`);

    try {
      const check = uploader.checkImage(imagePath);
      if (!check.valid) {
        throw new Error(check.error);
      }

      const url = await uploader.uploadImage(imagePath);
      results.success.push({ file, url });
      console.log(`  ✅ 成功: ${url}\n`);

    } catch (error) {
      results.failed.push({ file, error: error.message });
      console.log(`  ❌ 失败: ${error.message}\n`);
    }
  }

  // 输出结果总结
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n📊 上传结果统计:`);
  console.log(`  成功: ${results.success.length}张`);
  console.log(`  失败: ${results.failed.length}张\n`);

  if (results.success.length > 0) {
    console.log(`✅ 成功上传的图片:`);
    results.success.forEach(({ file, url }) => {
      console.log(`  - ${file}: ${url}`);
    });
    console.log('');
  }

  if (results.failed.length > 0) {
    console.log(`❌ 上传失败的图片:`);
    results.failed.forEach(({ file, error }) => {
      console.log(`  - ${file}: ${error}`);
    });
    console.log('');
  }

  return results;
}

// 命令行入口
if (require.main === module) {
  const imageDir = process.argv[2] || './outputs/images';

  uploadImagesToMaterial(imageDir).catch(error => {
    console.error(`\n❌ 错误: ${error.message}\n`);
    process.exit(1);
  });
}

module.exports = uploadImagesToMaterial;
