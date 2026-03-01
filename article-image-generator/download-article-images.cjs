#!/usr/bin/env node

/**
 * 为文章 "为什么孩子不爱学习？90%家长都做错了" 下载配图
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = 'qekoFPuHK6YT6369knsRXQ6ZeUkgbI2xPZKZ3qaRvyk';
const IMAGES_DIR = path.join(__dirname, '../articles/images');

// 图片配置
const IMAGES = [
    // 封面图
    { name: '01-封面-学习中', keyword: 'child studying', orientation: 'landscape' },
    { name: '02-封面-教育', keyword: 'child education', orientation: 'landscape' },

    // 开头困境
    { name: '03-困境-沮丧', keyword: 'frustrated student', orientation: 'landscape' },
    { name: '04-困境-作业', keyword: 'homework stress', orientation: 'landscape' },
    { name: '05-困境-焦虑', keyword: 'student anxiety', orientation: 'landscape' },

    // 亲子关系
    { name: '06-亲子-母子', keyword: 'mother and child', orientation: 'landscape' },
    { name: '07-亲子-家庭', keyword: 'family time', orientation: 'landscape' },
    { name: '08-亲子-教导', keyword: 'parent teaching child', orientation: 'landscape' },

    // 改善方法
    { name: '09-方法-鼓励', keyword: 'parent encouragement', orientation: 'landscape' },
    { name: '10-方法-成功', keyword: 'happy student', orientation: 'landscape' },
    { name: '11-方法-进步', keyword: 'student achievement', orientation: 'landscape' },

    // 结尾励志
    { name: '12-结尾-希望', keyword: 'hope future', orientation: 'landscape' },
    { name: '13-结尾-成长', keyword: 'child growth', orientation: 'landscape' },
];

/**
 * 搜索并下载图片
 */
async function downloadImage(keyword, orientation, filename) {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&orientation=${orientation}&per_page=1&client_id=${API_KEY}`;

    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const json = JSON.parse(data);
                        const results = json.results || [];

                        if (results.length > 0) {
                            const img = results[0];
                            const imageUrl = img.urls.regular;

                            // 下载图片
                            https.get(imageUrl, (imgRes) => {
                                if (imgRes.statusCode === 200) {
                                    const filePath = path.join(IMAGES_DIR, filename);
                                    const stream = fs.createWriteStream(filePath);
                                    imgRes.pipe(stream);
                                    stream.on('close', () => {
                                        console.log(`✅ ${filename}`);
                                        resolve({
                                            filename,
                                            keyword,
                                            url: imageUrl,
                                            description: img.description || img.alt_description,
                                            author: img.user.name
                                        });
                                    });
                                    stream.on('error', reject);
                                } else {
                                    reject(new Error(`下载失败: ${imgRes.statusCode}`));
                                }
                            }).on('error', reject);
                        } else {
                            console.log(`⚠️  ${filename} (未找到 "${keyword}" 的图片)`);
                            resolve(null);
                        }
                    } catch (e) {
                        reject(e);
                    }
                } else {
                    reject(new Error(`API错误: ${res.statusCode}`));
                }
            });
        }).on('error', reject);
    });
}

/**
 * 主函数
 */
async function main() {
    console.log('\n📸 正在为文章下载配图...\n');
    console.log(`📁 保存目录: ${IMAGES_DIR}\n`);

    // 确保目录存在
    if (!fs.existsSync(IMAGES_DIR)) {
        fs.mkdirSync(IMAGES_DIR, { recursive: true });
    }

    const results = [];

    for (const img of IMAGES) {
        const filename = `${img.name}.jpg`;
        try {
            const result = await downloadImage(img.keyword, img.orientation, filename);
            if (result) {
                results.push(result);
            }
            // 添加延迟避免API限流
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (e) {
            console.error(`❌ ${filename}: ${e.message}`);
        }
    }

    console.log(`\n✅ 下载完成!`);
    console.log(`📊 成功下载: ${results.length}/${IMAGES.length} 张图片\n`);

    // 生成使用说明
    console.log('📖 图片列表:\n');
    results.forEach((img, index) => {
        console.log(`${index + 1}. ${img.filename}`);
        console.log(`   关键词: ${img.keyword}`);
        console.log(`   描述: ${img.description || '无'}`);
        console.log(`   作者: ${img.author}`);
        console.log(`   路径: ${path.join(IMAGES_DIR, img.filename)}`);
        console.log('');
    });
}

main().catch(console.error);
