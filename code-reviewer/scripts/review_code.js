/**
 * Code Reviewer - 代码审查脚本
 * 
 * 这个脚本演示了如何使用 Code Reviewer 技能进行代码审查
 */

const { reviewCode, fixCode, getBestPractices } = require('../src/code_reviewer');

/**
 * 审查 SQL 注入漏洞示例
 */
async function reviewSqlInjectionExample() {
  console.log('正在审查 SQL 注入漏洞示例...\n');
  
  const code = `def get_user_data(user_id):
    # 从数据库获取用户数据
    query = f"SELECT * FROM users WHERE id = {user_id}"
    result = db.execute(query)
    return result`;
  
  const options = {
    language: 'python',
    focus: ['security', 'correctness'],
    severityThreshold: 'medium',
    maxIssues: 10
  };
  
  try {
    const report = await reviewCode(code, options);
    console.log('SQL 注入漏洞审查报告：');
    console.log('='.repeat(80));
    console.log(JSON.stringify(report, null, 2));
    console.log('='.repeat(80));
    
    // 保存报告到文件
    const fs = require('fs');
    const path = require('path');
    const outputPath = path.join(__dirname, '../examples/sql_injection_report.json');
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`\n审查报告已保存到：${outputPath}`);
    
  } catch (error) {
    console.error('审查失败：', error);
  }
}

/**
 * 审查 XSS 漏洞示例
 */
async function reviewXssExample() {
  console.log('\n正在审查 XSS 漏洞示例...\n');
  
  const code = `function renderUserComment(comment) {
    const div = document.createElement('div');
    div.innerHTML = \`<p>${comment.content}</p>\`;
    return div;
}`;
  
  const options = {
    language: 'javascript',
    focus: ['security'],
    severityThreshold: 'high',
    maxIssues: 5
  };
  
  try {
    const report = await reviewCode(code, options);
    console.log('XSS 漏洞审查报告：');
    console.log('='.repeat(80));
    console.log(JSON.stringify(report, null, 2));
    console.log('='.repeat(80));
    
    // 保存报告到文件
    const fs = require('fs');
    const path = require('path');
    const outputPath = path.join(__dirname, '../examples/xss_report.json');
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`\n审查报告已保存到：${outputPath}`);
    
  } catch (error) {
    console.error('审查失败：', error);
  }
}

/**
 * 审查性能问题示例
 */
async function reviewPerformanceExample() {
  console.log('\n正在审查性能问题示例...\n');
  
  const code = `def find_user(users, user_id):
    for user in users:
        if user['id'] == user_id:
            return user
    return None

# 使用示例
users = get_all_users()  # 返回 10000 个用户
user = find_user(users, 12345)`;
  
  const options = {
    language: 'python',
    focus: ['performance'],
    severityThreshold: 'low',
    maxIssues: 10
  };
  
  try {
    const report = await reviewCode(code, options);
    console.log('性能问题审查报告：');
    console.log('='.repeat(80));
    console.log(JSON.stringify(report, null, 2));
    console.log('='.repeat(80));
    
    // 保存报告到文件
    const fs = require('fs');
    const path = require('path');
    const outputPath = path.join(__dirname, '../examples/performance_report.json');
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`\n审查报告已保存到：${outputPath}`);
    
  } catch (error) {
    console.error('审查失败：', error);
  }
}

/**
 * 自动修复代码示例
 */
async function autoFixExample() {
  console.log('\n正在自动修复代码示例...\n');
  
  const code = `function getUserData(userId) {
    const query = \`SELECT * FROM users WHERE id = ${userId}\`;
    return db.execute(query);
}`;
  
  const issues = [
    {
      type: 'sql_injection',
      line: 2,
      column: 15,
      description: 'SQL injection vulnerability'
    }
  ];
  
  try {
    const fixedCode = await fixCode(code, issues);
    console.log('原始代码：');
    console.log(code);
    console.log('\n修复后的代码：');
    console.log('='.repeat(80));
    console.log(fixedCode);
    console.log('='.repeat(80));
    
    // 保存修复后的代码到文件
    const fs = require('fs');
    const path = require('path');
    const outputPath = path.join(__dirname, '../examples/fixed_code.js');
    fs.writeFileSync(outputPath, fixedCode);
    console.log(`\n修复后的代码已保存到：${outputPath}`);
    
  } catch (error) {
    console.error('修复失败：', error);
  }
}

/**
 * 获取最佳实践示例
 */
async function getBestPracticesExample() {
  console.log('\n正在获取最佳实践示例...\n');
  
  try {
    const practices = await getBestPractices('javascript', 'security');
    console.log('JavaScript 安全性最佳实践：');
    console.log('='.repeat(80));
    console.log(JSON.stringify(practices, null, 2));
    console.log('='.repeat(80));
    
    // 保存最佳实践到文件
    const fs = require('fs');
    const path = require('path');
    const outputPath = path.join(__dirname, '../examples/javascript_security_practices.json');
    fs.writeFileSync(outputPath, JSON.stringify(practices, null, 2));
    console.log(`\n最佳实践已保存到：${outputPath}`);
    
  } catch (error) {
    console.error('获取最佳实践失败：', error);
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('='.repeat(80));
  console.log('Code Reviewer - 代码审查工具');
  console.log('='.repeat(80));
  
  // 审查 SQL 注入漏洞示例
  await reviewSqlInjectionExample();
  
  // 审查 XSS 漏洞示例
  await reviewXssExample();
  
  // 审查性能问题示例
  await reviewPerformanceExample();
  
  // 自动修复代码示例
  await autoFixExample();
  
  // 获取最佳实践示例
  await getBestPracticesExample();
  
  console.log('\n' + '='.repeat(80));
  console.log('所有任务已完成！');
  console.log('='.repeat(80));
}

// 运行主函数
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  reviewSqlInjectionExample,
  reviewXssExample,
  reviewPerformanceExample,
  autoFixExample,
  getBestPracticesExample,
  main
};
