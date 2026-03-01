/**
 * Polish Expert - 文案润色脚本
 * 
 * 这个脚本演示了如何使用 Polish Expert 技能进行文案润色
 */

const { polishText, checkGrammar, checkSpelling, optimizeStyle } = require('../src/polish_expert');

/**
 * 小红书风格润色示例
 */
async function polishXiaohongshuExample() {
  console.log('正在进行小红书风格润色...\n');
  
  const text = '这个产品很好用，我很喜欢。';
  
  const options = {
    platform: 'xiaohongshu',
    style: '轻松活泼',
    focus: ['style'],
    maxChanges: 10,
    showComparison: true
  };
  
  try {
    const report = await polishText(text, options);
    console.log('小红书风格润色报告：');
    console.log('='.repeat(80));
    console.log(JSON.stringify(report, null, 2));
    console.log('='.repeat(80));
    
    // 保存报告到文件
    const fs = require('fs');
    const path = require('path');
    const outputPath = path.join(__dirname, '../examples/xiaohongshu_report.json');
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`\n润色报告已保存到：${outputPath}`);
    
  } catch (error) {
    console.error('润色失败：', error);
  }
}

/**
 * 微信公众号风格润色示例
 */
async function polishWeChatExample() {
  console.log('\n正在进行微信公众号风格润色...\n');
  
  const text = 'AI工具Claude Code的使用体验';
  
  const options = {
    platform: 'wechat',
    style: '专业详细',
    focus: ['readability'],
    maxChanges: 10,
    showComparison: true
  };
  
  try {
    const report = await polishText(text, options);
    console.log('微信公众号风格润色报告：');
    console.log('='.repeat(80));
    console.log(JSON.stringify(report, null, 2));
    console.log('='.repeat(80));
    
    // 保存报告到文件
    const fs = require('fs');
    const path = require('path');
    const outputPath = path.join(__dirname, '../examples/wechat_report.json');
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`\n润色报告已保存到：${outputPath}`);
    
  } catch (error) {
    console.error('润色失败：', error);
  }
}

/**
 * 语法检查示例
 */
async function checkGrammarExample() {
  console.log('\n正在进行语法检查...\n');
  
  const text = '我昨天去公园，看到一只漂亮的花。';
  
  try {
    const errors = await checkGrammar(text);
    console.log('语法错误检查结果：');
    console.log('='.repeat(80));
    console.log(JSON.stringify(errors, null, 2));
    console.log('='.repeat(80));
    
    // 保存检查结果到文件
    const fs = require('fs');
    const path = require('path');
    const outputPath = path.join(__dirname, '../examples/grammar_errors.json');
    fs.writeFileSync(outputPath, JSON.stringify(errors, null, 2));
    console.log(`\n语法错误检查结果已保存到：${outputPath}`);
    
  } catch (error) {
    console.error('语法检查失败：', error);
  }
}

/**
 * 拼写检查示例
 */
async function checkSpellingExample() {
  console.log('\n正在进行拼写检查...\n');
  
  const text = '这个产品的质量很好，价格也很便易。';
  
  try {
    const errors = await checkSpelling(text);
    console.log('拼写错误检查结果：');
    console.log('='.repeat(80));
    console.log(JSON.stringify(errors, null, 2));
    console.log('='.repeat(80));
    
    // 保存检查结果到文件
    const fs = require('fs');
    const path = require('path');
    const outputPath = path.join(__dirname, '../examples/spelling_errors.json');
    fs.writeFileSync(outputPath, JSON.stringify(errors, null, 2));
    console.log(`\n拼写错误检查结果已保存到：${outputPath}`);
    
  } catch (error) {
    console.error('拼写检查失败：', error);
  }
}

/**
 * 风格优化示例
 */
async function optimizeStyleExample() {
  console.log('\n正在进行风格优化...\n');
  
  const text = '这个产品的性能很好，值得购买。';
  const style = '轻松活泼';
  
  try {
    const optimizedText = await optimizeStyle(text, style);
    console.log('原始文本：');
    console.log(text);
    console.log('\n优化后的文本：');
    console.log('='.repeat(80));
    console.log(optimizedText);
    console.log('='.repeat(80));
    
    // 保存优化后的文本到文件
    const fs = require('fs');
    const path = require('path');
    const outputPath = path.join(__dirname, '../examples/optimized_text.txt');
    fs.writeFileSync(outputPath, optimizedText);
    console.log(`\n优化后的文本已保存到：${outputPath}`);
    
  } catch (error) {
    console.error('风格优化失败：', error);
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('='.repeat(80));
  console.log('Polish Expert - 文案润色工具');
  console.log('='.repeat(80));
  
  // 小红书风格润色示例
  await polishXiaohongshuExample();
  
  // 微信公众号风格润色示例
  await polishWeChatExample();
  
  // 语法检查示例
  await checkGrammarExample();
  
  // 拼写检查示例
  await checkSpellingExample();
  
  // 风格优化示例
  await optimizeStyleExample();
  
  console.log('\n' + '='.repeat(80));
  console.log('所有任务已完成！');
  console.log('='.repeat(80));
}

// 运行主函数
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  polishXiaohongshuExample,
  polishWeChatExample,
  checkGrammarExample,
  checkSpellingExample,
  optimizeStyleExample,
  main
};
