# 降噪 AI 广播编辑器

一个基于 AI 的广播内容编辑工具，可以将专业的 AI 文章转化为通俗易懂的广播内容，并支持文本转语音功能。

## 功能特点

- 🤖 AI 驱动的内容改写
- 🎙️ 文本转语音功能
- 🎛️ 可调节的语音参数
- 💾 音频下载功能
- 🎨 现代化的界面设计

## 快速开始

1. 克隆仓库：
```bash
git clone https://github.com/your-username/noise-reduction-ai-broadcast-editor.git
cd noise-reduction-ai-broadcast-editor
```

2. 安装依赖：
```bash
npm install
```

3. 配置 API：
   - 复制 `static/js/config.js.example` 为 `static/js/config.js`
   - 在 `config.js` 中填入你的 MiniMax API 密钥和 Group ID

4. 启动服务：
```bash
npm start
```

5. 访问应用：
   打开浏览器访问 `http://localhost:3000`

## 使用说明

1. 在输入框中粘贴需要转换的 AI 文章内容
2. 点击"生成内容"按钮，等待 AI 改写完成
3. 调整语音参数（可选）
4. 点击"生成语音"按钮将文本转换为语音
5. 使用播放控制按钮试听，或下载生成的音频文件

## 技术栈

- 前端：HTML5, CSS3, JavaScript (ES6+)
- UI 框架：Bootstrap 5
- API：MiniMax AI API
- 开发服务器：http-server

## 配置说明

在 `config.js` 中可以配置以下参数：

- `API_KEY`：MiniMax API 密钥
- `GROUP_ID`：MiniMax Group ID
- `ENDPOINTS`：API 端点配置
- `VOICE_DEFAULTS`：语音参数默认值

## 注意事项

- 请勿将包含 API 密钥的 `config.js` 文件提交到代码仓库
- 音频文件生成可能需要一定时间，请耐心等待
- 建议使用现代浏览器以获得最佳体验

## 许可证

MIT License