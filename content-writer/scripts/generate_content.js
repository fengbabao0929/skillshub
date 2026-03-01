/**
 * Content Writer - 自媒体文案生成脚本
 * 
 * 这个脚本演示了如何使用Content Writer技能生成自媒体文案
 */

const { generateContent, polishContent, convertFormat } = require('../src/content_writer');

/**
 * 生成微信公众号文案
 */
async function generateWeChatArticle() {
  console.log('正在生成微信公众号文章...\n');
  
  const options = {
    topic: 'AI工具Claude Code的使用体验',
    platform: '微信公众号',
    style: '轻松有趣',
    maxLength: 500,
    keywords: ['AI编程', '效率提升', '程序员']
  };
  
  try {
    const content = await generateContent(options);
    console.log('生成的微信公众号文章：');
    console.log('='.repeat(80));
    console.log(content);
    console.log('='.repeat(80));
    
    // 保存到文件
    const fs = require('fs');
    const path = require('path');
    const outputPath = path.join(__dirname, '../examples/wechat_article.md');
    fs.writeFileSync(outputPath, content);
    console.log(`\n文章已保存到：${outputPath}`);
    
  } catch (error) {
    console.error('生成文章失败：', error);
  }
}

/**
 * 生成小红书文案
 */
async function generateXiaohongshuContent() {
  console.log('\n正在生成小红书文案...\n');
  
  const options = {
    topic: '程序员的高效工作技巧',
    platform: '小红书',
    style: '轻松活泼',
    maxLength: 300,
    keywords: ['程序员', '效率', '工作技巧', '时间管理']
  };
  
  try {
    const content = await generateContent(options);
    console.log('生成的小红书文案：');
    console.log('='.repeat(80));
    console.log(content);
    console.log('='.repeat(80));
    
    // 保存到文件
    const fs = require('fs');
    const path = require('path');
    const outputPath = path.join(__dirname, '../examples/xiaohongshu_content.md');
    fs.writeFileSync(outputPath, content);
    console.log(`\n文案已保存到：${outputPath}`);
    
  } catch (error) {
    console.error('生成文案失败：', error);
  }
}

/**
 * 润色现有文案
 */
async function polishExistingContent() {
  console.log('\n正在润色文案...\n');
  
  const originalContent = 'Claude Code是一个很好的AI编程工具，它能帮助程序员提高工作效率。';
  
  const options = {
    platform: '小红书',
    style: '轻松有趣',
    maxLength: 300
  };
  
  try {
    const polishedContent = await polishContent(originalContent, options);
    console.log('原始文案：');
    console.log(originalContent);
    console.log('\n润色后的文案：');
    console.log('='.repeat(80));
    console.log(polishedContent);
    console.log('='.repeat(80));
    
    // 保存到文件
    const fs = require('fs');
    const path = require('path');
    const outputPath = path.join(__dirname, '../examples/polished_content.md');
    fs.writeFileSync(outputPath, polishedContent);
    console.log(`\n润色后的文案已保存到：${outputPath}`);
    
  } catch (error) {
    console.error('润色文案失败：', error);
  }
}

/**
 * 转换文案格式
 */
async function convertContentFormat() {
  console.log('\n正在转换文案格式...\n');
  
  const markdownContent = '# 标题\n\n正文内容\n\n## 子标题\n\n子标题内容';
  
  try {
    const htmlContent = await convertFormat(markdownContent, 'markdown', 'html');
    console.log('Markdown格式：');
    console.log(markdownContent);
    console.log('\n转换后的HTML格式：');
    console.log('='.repeat(80));
    console.log(htmlContent);
    console.log('='.repeat(80));
    
    // 保存到文件
    const fs = require('fs');
    const path = require('path');
    const outputPath = path.join(__dirname, '../examples/converted_content.html');
    fs.writeFileSync(outputPath, htmlContent);
    console.log(`\n转换后的内容已保存到：${outputPath}`);
    
  } catch (error) {
    console.error('转换格式失败：', error);
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('='.repeat(80));
  console.log('Content Writer - 自媒体文案生成工具');
  console.log('='.repeat(80));
  
  // 生成微信公众号文章
  await generateWeChatArticle();
  
  // 生成小红书文案
  await generateXiaohongshuContent();
  
  // 润色现有文案
  await polishExistingContent();
  
  // 转换文案格式
  await convertContentFormat();
  
  console.log('\n' + '='.repeat(80));
  console.log('所有任务已完成！');
  console.log('='.repeat(80));
}

// 运行主函数
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  generateWeChatArticle,
  generateXiaohongshuContent,
  polishExistingContent,
  convertContentFormat,
  main
};
