/**
 * 微信公众号文章发布器
 * 核心发布脚本
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const chalk = require('chalk');

// 导入工具模块
const WeChatAPIClient = require('./utils/api-client.cjs');
const ImageUploader = require('./utils/image-uploader.cjs');
const MarkdownParser = require('./utils/markdown-parser.cjs');
const { loadConfig } = require('./wechat-config.cjs');

// 配置文件路径
const configPath = path.join(__dirname, 'config', 'wechat.env');

/**
 * 加载配置
 */
function loadConfigWithFallback() {
  if (!fs.existsSync(configPath)) {
    console.error(chalk.red('✗ 配置文件不存在！请先运行 /wx-config 进行配置'));
    console.error(chalk.yellow('配置文件位置: ' + configPath));
    process.exit(1);
  }

  return dotenv.parse(fs.readFileSync(configPath));
}

/**
 * 解析命令行参数
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    article: null,
    action: 'draft',
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--article':
      case '-a':
        options.article = args[++i];
        break;
      case '--action':
        options.action = args[++i];
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
    }
  }

  return options;
}

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log('\n微信公众号文章发布器\n');
  console.log('用法:');
  console.log('  node wechat-publisher.cjs --article <文章路径> [--action <操作>]\n');
  console.log('参数:');
  console.log('  --article, -a    Markdown文章文件路径（必填）');
  console.log('  --action         操作类型: draft(草稿) | publish(发布) [默认: draft]\n');
  console.log('示例:');
  console.log('  # 发布到草稿箱');
  console.log('  node wechat-publisher.cjs --article ./article.md --action draft\n');
  console.log('  # 立即发布');
  console.log('  node wechat-publisher.cjs --article ./article.md --action publish\n');
}

/**
 * 发布文章到公众号
 */
async function publishArticle(articlePath, action = 'draft') {
  console.log(chalk.bold('\n=== 微信公众号文章发布器 ===\n'));

  // 加载配置
  console.log('加载配置...');
  const config = loadConfigWithFallback();
  console.log(chalk.green('✓ 配置加载成功'));

  // 初始化客户端
  const apiClient = new WeChatAPIClient(config);
  const imageUploader = new ImageUploader(apiClient, {
    maxSize: parseInt(config.MAX_IMAGE_SIZE || '2097152'),
    supportedFormats: (config.SUPPORTED_IMAGE_FORMATS || 'jpg,png,gif').split(',')
  });
  const mdParser = new MarkdownParser({
    defaultAuthor: config.DEFAULT_AUTHOR || '默认作者'
  });

  // 解析文章
  console.log('\n解析文章...');
  let parsed;
  try {
    parsed = mdParser.parseFile(articlePath);
    console.log(chalk.green('✓ 文章解析成功'));
    console.log(`  标题: ${parsed.title}`);
    console.log(`  作者: ${parsed.author}`);
  } catch (error) {
    console.error(chalk.red('✗ 文章解析失败: ' + error.message));
    process.exit(1);
  }

  // 转换为HTML
  console.log('\n转换为HTML...');
  const htmlContent = mdParser.markdownToHTML(parsed.content);
  console.log(chalk.green('✓ HTML转换完成'));

  // 上传封面图
  let thumbMediaId = null;
  if (parsed.cover) {
    console.log('\n上传封面图...');
    try {
      const coverPath = path.isAbsolute(parsed.cover)
        ? parsed.cover
        : path.resolve(parsed.basePath, parsed.cover);
      const coverUrl = await imageUploader.uploadImage(coverPath);

      // 上传永久素材获取thumb_media_id
      const token = await apiClient.getAccessToken();
      const FormData = require('form-data');
      const axios = require('axios');

      const form = new FormData();
      form.append('media', fs.createReadStream(coverPath));
      form.append('type', 'thumb');

      const thumbResponse = await axios.post(
        `${config.WECHAT_API_BASE}/cgi-bin/material/add_material`,
        form,
        {
          params: { access_token: token },
          headers: form.getHeaders()
        }
      );

      if (thumbResponse.data.media_id) {
        thumbMediaId = thumbResponse.data.media_id;
        console.log(chalk.green('✓ 封面图上传成功'));
      }
    } catch (error) {
      console.log(chalk.yellow('⚠ 封面图上传失败: ' + error.message));
      console.log(chalk.yellow('  将使用占位图'));
    }
  }

  // 如果没有封面图，提示用户
  if (!thumbMediaId) {
    console.log(chalk.yellow('\n⚠ 文章缺少封面图'));
    console.log(chalk.yellow('微信公众号要求文章必须有封面图'));
    console.log(chalk.yellow('\n请在文章的frontmatter中添加封面图：'));
    console.log(chalk.white('---\n' +
      'title: 文章标题\n' +
      'cover: ./images/cover.png  # 添加这行\n' +
      '---\n'));
    console.log(chalk.gray('\n提示：封面图建议尺寸为900x383像素，格式为JPG或PNG'));

    // 使用一个远程的默认封面图（可选）
    // 这里我们抛出错误，要求用户提供封面图
    throw new Error('文章缺少封面图，请在frontmatter中指定cover字段');
  }

  // 上传正文图片并替换URL
  console.log('\n检查正文图片...');
  const images = mdParser.extractImages(parsed.content, parsed.basePath);
  if (images.length > 0) {
    console.log(`发现 ${images.length} 张图片，开始上传...`);

    const uploadResult = await imageUploader.uploadAndReplaceImages(htmlContent, parsed.basePath);

    // 显示上传结果
    const successCount = Object.keys(uploadResult.results.success).length;
    const failedCount = Object.keys(uploadResult.results.failed).length;

    console.log(chalk.green(`✓ 成功上传 ${successCount} 张`));
    if (failedCount > 0) {
      console.log(chalk.yellow(`⚠ ${failedCount} 张上传失败:`));
      for (const [imgPath, error] of Object.entries(uploadResult.results.failed)) {
        console.log(chalk.yellow(`  - ${path.basename(imgPath)}: ${error}`));
      }
    }

    parsed.content = uploadResult.html;
  } else {
    console.log(chalk.gray('  无本地图片'));
  }

  // 构建文章数据
  console.log('\n构建文章数据...');
  const articleData = mdParser.buildArticleData(parsed, parsed.content, thumbMediaId);
  console.log(chalk.green('✓ 文章数据构建完成'));

  // 创建草稿或发布
  if (action === 'publish') {
    console.log('\n正在发布...');
    console.log(chalk.yellow('⚠ 即将发布到公众号，请确认文章内容无误！'));

    // 先创建草稿
    const mediaId = await apiClient.createDraft([articleData]);
    console.log(chalk.green('✓ 草稿创建成功'));

    // 发布草稿
    const result = await apiClient.publishDraft(mediaId);
    console.log(chalk.green('✓ 文章发布成功！'));
    console.log(`  消息ID: ${result}`);
  } else {
    console.log('\n创建草稿...');
    try {
      const mediaId = await apiClient.createDraft([articleData]);
      console.log(chalk.green('✓ 草稿创建成功！'));
      console.log(`  Media ID: ${mediaId}`);
      console.log(chalk.gray('\n提示: 请登录公众号后台查看和编辑草稿'));
    } catch (error) {
      console.error(chalk.red('✗ 草稿创建失败: ' + error.message));

      // 显示错误码说明
      if (error.message.includes('errcode')) {
        console.log(chalk.yellow('\n常见错误码:'));
        console.log(chalk.yellow('40001: AppSecret错误'));
        console.log(chalk.yellow('40014: access_token无效'));
        console.log(chalk.yellow('42001: access_token超时'));
        console.log(chalk.yellow('61007: 服务器IP未加入白名单'));
      }

      process.exit(1);
    }
  }

  console.log(chalk.bold('\n=== 完成 ===\n'));
}

// 主函数
async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    return;
  }

  if (!options.article) {
    console.error(chalk.red('✗ 请指定文章路径！'));
    console.error(chalk.yellow('使用 --help 查看帮助信息'));
    process.exit(1);
  }

  // 检查文件是否存在
  if (!fs.existsSync(options.article)) {
    console.error(chalk.red(`✗ 文件不存在: ${options.article}`));
    process.exit(1);
  }

  // 发布文章
  try {
    await publishArticle(options.article, options.action);
  } catch (error) {
    console.error(chalk.red('\n✗ 发布失败: ' + error.message));
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red('错误:', error.message));
    process.exit(1);
  });
}

module.exports = { publishArticle };
