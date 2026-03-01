#!/usr/bin/env node

/**
 * 文章自动配图工具
 * 支持 Unsplash 和 AI绘画
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const CONFIG = {
    imagesDir: path.join(__dirname, '../articles/images'),
    unsplash: {
        baseUrl: 'https://api.unsplash.com',
        accessKey: 'qekoFPuHK6YT6369knsRXQ6ZeUkgbI2xPZKZ3qaRvyk', // 用户配置的 API Key
        perPage: 5
    }
};

/**
 * 从 Unsplash 搜索图片
 */
async function searchUnsplash(keyword, orientation = 'landscape') {
    return new Promise((resolve, reject) => {
        const url = `${CONFIG.unsplash.baseUrl}/search/photos?query=${encodeURIComponent(keyword)}&orientation=${orientation}&per_page=${CONFIG.unsplash.perPage}&client_id=${CONFIG.unsplash.accessKey}`;

        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const results = json.results.map(img => ({
                        url: img.urls.regular,
                        thumb: img.urls.thumb,
                        description: img.description || img.alt_description,
                        author: img.user.name,
                        authorUrl: img.user.links.html
                    }));
                    resolve(results);
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

/**
 * 下载图片
 */
async function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                   .on('error', reject)
                   .on('close', () => resolve(filepath));
            } else {
                reject(new Error(`Failed to download: ${res.statusCode}`));
            }
        }).on('error', reject);
    });
}

/**
 * 根据文章内容生成配图关键词
 */
function generateKeywords(articleContent) {
    // 学习教育类关键词映射
    const keywordMap = {
        '学习': 'studying',
        '孩子': 'child',
        '家长': 'parent',
        '作业': 'homework',
        '考试': 'exam',
        '焦虑': 'anxiety',
        '成绩': 'grades',
        '课堂': 'classroom',
        '老师': 'teacher',
        '阅读': 'reading',
        '家庭': 'family',
        '亲子': 'parenting',
        '手机': 'phone',
        '注意力': 'focus',
        '习惯': 'habit',
        '兴趣': 'interest'
    };

    // 找出文章中出现的关键词
    const keywords = [];
    for (const [chinese, english] of Object.entries(keywordMap)) {
        if (articleContent.includes(chinese)) {
            keywords.push(english);
        }
    }

    // 如果没找到，使用默认关键词
    if (keywords.length === 0) {
        keywords.push('studying', 'child education');
    }

    return keywords;
}

/**
 * 为文章生成配图
 */
async function generateImagesForArticle(articlePath, articleContent) {
    console.log(`\n📸 正在为文章生成配图...`);
    console.log(`📄 文章: ${articlePath}`);

    // 确保图片目录存在
    if (!fs.existsSync(CONFIG.imagesDir)) {
        fs.mkdirSync(CONFIG.imagesDir, { recursive: true });
    }

    // 生成关键词
    const keywords = generateKeywords(articleContent);
    console.log(`🔑 关键词: ${keywords.join(', ')}`);

    const images = [];

    // 搜索并下载图片
    for (const keyword of keywords.slice(0, 2)) { // 只搜索前2个关键词
        try {
            const searchResults = await searchUnsplash(keyword);

            for (let i = 0; i < Math.min(2, searchResults.length); i++) {
                const img = searchResults[i];
                const filename = `${keyword}_${i + 1}.jpg`;
                const filepath = path.join(CONFIG.imagesDir, filename);

                console.log(`  ⬇️  下载: ${filename}`);
                await downloadImage(img.url, filepath);

                images.push({
                    file: filename,
                    path: filepath,
                    url: img.url,
                    description: img.description,
                    author: img.author,
                    authorUrl: img.authorUrl
                });
            }
        } catch (e) {
            console.error(`  ❌ 搜索 "${keyword}" 失败:`, e.message);
        }
    }

    return images;
}

/**
 * 生成配图Markdown
 */
function generateImageMarkdown(images) {
    if (images.length === 0) return '';

    let markdown = '\n---\n\n## 📷 配图\n\n';

    images.forEach((img, index) => {
        markdown += `### 图片 ${index + 1}\n\n`;
        markdown += `![${img.description || '配图'}](images/${img.file})\n\n`;
        markdown += `*图片来源: [Unsplash](https://unsplash.com) by [${img.author}](${img.authorUrl})*\n\n`;
    });

    return markdown;
}

// ==================== 命令行使用 ====================

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log(`
📸 文章自动配图工具

用法:
  node article-image-generator.cjs <文章路径> [选项]

选项:
  --keywords <关键词>  手动指定关键词，用逗号分隔
  --count <数量>       下载图片数量 (默认: 4)
  --markdown           生成配图Markdown代码

示例:
  node article-image-generator.cjs ../articles/文章.md
  node article-image-generator.cjs ../articles/文章.md --keywords "studying,child" --count 6
  node article-image-generator.cjs ../articles/文章.md --markdown
        `);
        return;
    }

    const articlePath = args[0];
    let keywords = null;
    let count = 4;
    let outputMarkdown = false;

    // 解析参数
    for (let i = 1; i < args.length; i++) {
        if (args[i] === '--keywords' && args[i + 1]) {
            keywords = args[i + 1].split(',');
            i++;
        } else if (args[i] === '--count' && args[i + 1]) {
            count = parseInt(args[i + 1]);
            i++;
        } else if (args[i] === '--markdown') {
            outputMarkdown = true;
        }
    }

    // 读取文章内容
    const articleContent = fs.readFileSync(articlePath, 'utf-8');

    // 生成图片
    const finalKeywords = keywords || generateKeywords(articleContent);
    console.log(`\n🎨 使用关键词: ${finalKeywords.join(', ')}`);

    // 如果需要，可以在这里调用实际的图片生成逻辑
    console.log(`\n⚠️  注意: 需要先在 CONFIG.unsplash.accessKey 中配置你的 Unsplash API Key`);
    console.log(`\n📝 获取 Unsplash API Key: https://unsplash.com/developers`);
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    generateImagesForArticle,
    generateImageMarkdown,
    searchUnsplash,
    downloadImage
};
