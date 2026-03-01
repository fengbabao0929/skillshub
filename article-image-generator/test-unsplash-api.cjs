#!/usr/bin/env node

/**
 * 测试 Unsplash API 连接
 */

const https = require('https');

const API_KEY = 'qekoFPuHK6YT6369knsRXQ6ZeUkgbI2xPZKZ3qaRvyk';

async function testUnsplashAPI() {
    console.log('🔍 正在测试 Unsplash API 连接...\n');

    const keyword = 'studying';
    const url = `https://api.unsplash.com/search/photos?query=${keyword}&orientation=landscape&per_page=3&client_id=${API_KEY}`;

    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const statusCode = res.statusCode;
                console.log(`📊 状态码: ${statusCode}\n`);

                if (statusCode === 200) {
                    try {
                        const json = JSON.parse(data);
                        const results = json.results || [];

                        console.log(`✅ API 连接成功！\n`);
                        console.log(`🔍 搜索关键词: "${keyword}"`);
                        console.log(`📷 找到 ${results.length} 张图片:\n`);

                        results.forEach((img, index) => {
                            console.log(`${index + 1}. ${img.description || img.alt_description || '无描述'}`);
                            console.log(`   预览: ${img.urls.thumb}`);
                            console.log(`   正式: ${img.urls.regular}`);
                            console.log(`   作者: ${img.user.name}`);
                            console.log('');
                        });

                        console.log('🎉 配置成功！可以正常使用 Unsplash API 了！\n');
                        resolve(true);
                    } catch (e) {
                        console.error('❌ 解析响应失败:', e.message);
                        console.error('响应内容:', data.substring(0, 200));
                        reject(e);
                    }
                } else {
                    console.error('❌ API 请求失败');
                    console.error(`状态码: ${statusCode}`);
                    try {
                        const errorData = JSON.parse(data);
                        console.error(`错误信息: ${errorData.errors?.[0] || '未知错误'}`);
                    } catch (e) {
                        console.error('响应内容:', data.substring(0, 200));
                    }
                    reject(new Error(`API 返回错误状态码: ${statusCode}`));
                }
            });
        }).on('error', (err) => {
            console.error('❌ 网络请求失败:', err.message);
            reject(err);
        });
    });
}

// 运行测试
testUnsplashAPI()
    .then(() => {
        console.log('✅ 测试完成！Unsplash API 已配置成功。');
    })
    .catch((err) => {
        console.error('\n❌ 测试失败！请检查:');
        console.error('1. API Key 是否正确');
        console.error('2. 网络连接是否正常');
        console.error('3. Unsplash 服务是否可用');
        process.exit(1);
    });
