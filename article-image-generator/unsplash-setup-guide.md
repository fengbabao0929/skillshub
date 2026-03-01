# Unsplash API 配置指南

## 📝 获取 Unsplash API Key（免费）

### 步骤 1：注册 Unsplash 账号

1. 访问：https://unsplash.com/developers
2. 点击右上角 **"Register"** 或 **"Sign Up"**
3. 可以用 Google 账号快捷注册

### 步骤 2：创建应用

1. 登录后，访问：https://unsplash.com/developers
2. 点击 **"New Application"**
3. 填写应用信息：
   - **Application Name**: `我的公众号配图工具`（随便填）
   - **Description**: `为教育类公众号文章生成配图`（随便填）
   - **Usage**: 选择 **"Educational"** 或 **"Personal"**
4. 勾选 **"I agree to the Unsplash API Terms"**
5. 点击 **"Apply for access"**

### 步骤 3：获取 Access Key

1. 创建成功后，会进入应用详情页
2. 找到 **"Access Key"** 一栏
3. 点击复制（类似 `abcdefghijklmnopqrstuvwxyz123456` 的字符串）

## ⚙️ 配置工具

### 方法 1：直接修改配置文件

打开文件：`E:\Claude Code\claude\skills\article-image-generator.cjs`

找到第 11 行：
```javascript
accessKey: 'YOUR_UNSPLASH_ACCESS_KEY',
```

替换为：
```javascript
accessKey: '你复制的AccessKey',
```

### 方法 2：让我帮你配置

获取到 Access Key 后，直接告诉我，我帮你修改配置文件。

## 🚀 测试工具

配置完成后，运行测试命令：

```bash
node "E:\Claude Code\claude\skills\article-image-generator.cjs"
```

如果看到帮助信息，说明配置成功！

## 📸 下载配图

为文章生成配图：

```bash
node "E:\Claude Code\claude\skills\article-image-generator.cjs" "../articles/公众号_20260128_为什么孩子不爱学习_完整版.md" --markdown
```

---

**获取到 Access Key 后告诉我，我帮你完成配置和测试！**
