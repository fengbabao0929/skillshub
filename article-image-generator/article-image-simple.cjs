#!/usr/bin/env node

/**
 * 文章配图工具 - 简化版（不需要API Key）
 * 使用 Unsplash Source API，免费且无需注册
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
    imagesDir: path.join(__dirname, '../articles/images'),
    // Unsplash Source API - 无需API Key
    sourceUrl: 'https://source.unsplash.com'
};

/**
 * 根据文章主题生成图片链接
 */
function generateImageLinks(articleContent, articleTitle) {
    // 教育类文章的主题映射
    const themes = {
        '封面': {
            keywords: ['studying', 'child-education', 'parenting', 'learning'],
            size: '1600x900' // 16:9 适合封面
        },
        '开头困境': {
            keywords: ['frustrated-student', 'homework', 'stress', 'anxiety'],
            size: '800x600'
        },
        '亲子关系': {
            keywords: ['mother-child', 'family', 'parenting', 'teaching'],
            size: '800x600'
        },
        '进步成功': {
            keywords: ['successful-student', 'achievement', 'happy-child', 'motivation'],
            size: '800x600'
        },
        '结尾': {
            keywords: ['hope', 'future', 'success', 'growth'],
            size: '1600x900'
        }
    };

    const links = [];

    Object.entries(themes).forEach(([position, config]) => {
        // 为每个位置生成1-2张图片
        config.keywords.forEach((keyword, index) => {
            const url = `${CONFIG.sourceUrl}/${config.size}/?${keyword}&sig=${Date.now()}_${index}`;
            links.push({
                position,
                type: index === 0 ? '主图' : '备选',
                keyword,
                url,
                downloadUrl: `${CONFIG.sourceUrl}/${config.size}/?${keyword}&sig=${Date.now()}_${index}&dl=1`,
                markdown: `![${position} - ${keyword}](${url})`
            });
        });
    });

    return links;
}

/**
 * 生成图片Markdown
 */
function generateImageMarkdown(links, articleTitle) {
    let markdown = `\n## 📷 文章配图\n\n`;
    markdown += `**文章**: ${articleTitle}\n\n`;

    // 按位置分组
    const grouped = {};
    links.forEach(link => {
        if (!grouped[link.position]) {
            grouped[link.position] = [];
        }
        grouped[link.position].push(link);
    });

    // 输出每个位置的图片
    Object.entries(grouped).forEach(([position, imgs]) => {
        markdown += `\n### ${position}\n\n`;

        imgs.forEach((img, index) => {
            if (index === 0) {
                markdown += `#### 推荐:\n\n`;
                markdown += `${img.markdown}\n\n`;
                markdown += `- 关键词: \`${img.keyword}\`\n`;
                markdown += `- 下载链接: [右键另存为](${img.url}) 或 [直接下载](${img.downloadUrl})\n\n`;
            } else {
                markdown += `#### 备选 ${index}:\n\n`;
                markdown += `${img.markdown}\n\n`;
            }
        });

        markdown += `---\n\n`;
    });

    // 添加使用说明
    markdown += `## 📖 使用说明\n\n`;
    markdown += `### 方法1: 直接下载使用\n`;
    markdown += `1. 点击上面的图片链接\n`;
    markdown += `2. 右键另存为图片到本地\n`;
    markdown += `3. 上传到公众号后台\n\n`;
    markdown += `### 方法2: 使用外链\n`;
    markdown += `部分平台支持 Markdown 格式的图片外链，直接复制上面 Markdown 代码即可使用。\n\n`;
    markdown += `### 方法3: 批量下载脚本\n`;
    markdown += `运行以下命令下载所有图片到本地：\n`;
    markdown += `\`\`\`bash\n`;
    markdown += `# 创建图片目录\n`;
    markdown += `mkdir -p articles/images\n\n`;
    markdown += `# 下载图片（使用 curl）\n`;
    links.forEach((link, index) => {
        markdown += `curl -L "${link.url}" -o articles/images/image_${index + 1}.jpg\n`;
    });
    markdown += `\`\`\`\n\n`;

    return markdown;
}

/**
 * 主函数
 */
async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log(`
📸 文章配图工具 - 简化版（无需API Key）

用法:
  node article-image-simple.cjs <文章路径> [选项]

选项:
  --output <文件>   输出配图信息到文件
  --count <数量>    每个位置生成多少张图片 (默认: 1)

示例:
  node article-image-simple.cjs ../articles/文章.md
  node article-image-simple.cjs ../articles/文章.md --output 配图信息.md
        `);
        return;
    }

    const articlePath = args[0];
    let outputFile = null;
    let count = 1;

    // 解析参数
    for (let i = 1; i < args.length; i++) {
        if (args[i] === '--output' && args[i + 1]) {
            outputFile = args[i + 1];
            i++;
        } else if (args[i] === '--count' && args[i + 1]) {
            count = parseInt(args[i + 1]);
            i++;
        }
    }

    // 读取文章
    const articleContent = fs.readFileSync(articlePath, 'utf-8');

    // 提取标题
    const titleMatch = articleContent.match(/^# (.+)$/m);
    const articleTitle = titleMatch ? titleMatch[1] : path.basename(articlePath);

    console.log(`\n📸 正在为文章生成配图...`);
    console.log(`📄 文章: ${articleTitle}`);
    console.log(`📄 路径: ${articlePath}\n`);

    // 生成图片链接
    const links = generateImageLinks(articleContent, articleTitle);

    console.log(`✅ 生成了 ${links.length} 张图片链接\n`);

    // 生成 Markdown
    const markdown = generateImageMarkdown(links, articleTitle);

    console.log(markdown);

    // 如果需要输出到文件
    if (outputFile) {
        fs.writeFileSync(outputFile, markdown, 'utf-8');
        console.log(`✅ 配图信息已保存到: ${outputFile}\n`);
    }

    console.log(`💡 提示: 点击图片链接后，右键"图片另存为"即可下载！\n`);
}

// 运行
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    generateImageLinks,
    generateImageMarkdown
};
