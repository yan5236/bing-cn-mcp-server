# 必应中文搜索 MCP 服务器

让 AI 助手（如 Claude）能够使用必应搜索引擎实时获取网络信息的工具。

## 什么是 MCP 服务器？

MCP（Model Context Protocol）是一个让 AI 助手能够调用外部工具的协议。这个项目提供了一个必应搜索工具，让 AI 可以帮你搜索网络信息并返回结果。

## 功能特性

- 🔍 **实时搜索**: 使用必应中文搜索引擎获取最新网络信息
- 📄 **网页抓取**: 自动抓取并提取搜索结果中的网页内容
- 🌐 **中文优化**: 专为中文搜索优化，支持简体中文结果
- 🔒 **无需密钥**: 不需要申请 API 密钥，开箱即用
- 🚫 **智能过滤**: 自动过滤无法抓取的网站（知乎、微信公众号等）

## 快速开始

### 在 Claude Desktop 中使用（推荐）

#### 步骤 1: 打开配置文件

根据你的操作系统，找到并打开 Claude Desktop 的配置文件：

**Windows 用户**:
```
%AppData%\Claude\claude_desktop_config.json
```
直接复制上面的路径到文件资源管理器地址栏，然后用记事本打开 `claude_desktop_config.json` 文件。

**macOS 用户**:
```
~/Library/Application Support/Claude/claude_desktop_config.json
```
在访达中按 `Cmd + Shift + G`，粘贴上面的路径，然后用文本编辑器打开。

#### 步骤 2: 添加配置

在配置文件中添加以下内容（如果文件是空的，直接粘贴；如果已有内容，在 `mcpServers` 部分添加）：

```json
{
  "mcpServers": {
    "bing-search": {
      "command": "npx",
      "args": [
        "-y",
        "bing-cn-mcp"
      ]
    }
  }
}
```

注意，windows下，你应该这样配置：

```json
{
  "mcpServers": {
    "bing-search": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "bing-cn-mcp"
      ]
    }
  }
}
```


如果配置文件中已经有其他 MCP 服务器，应该像这样：

```json
{
  "mcpServers": {
    "existing-server": {
      "command": "...",
      "args": ["..."]
    },
    "bing-search": {
      "command": "npx",
      "args": [
        "-y",
        "bing-cn-mcp"
      ]
    }
  }
}
```

#### 步骤 3: 重启 Claude Desktop

完全退出 Claude Desktop（不是最小化，要完全关闭），然后重新打开。

#### 步骤 4: 开始使用

在 Claude 中，你可以这样提问：

> "帮我搜索一下人工智能的最新进展"

> "搜索 Python 异步编程教程"

Claude 会自动调用必应搜索工具并返回结果。

## 工具说明

这个 MCP 服务器提供了两个工具：

### 1. bing_search - 必应搜索

使用必应搜索引擎搜索网络信息。

**参数说明**:
- `query` (必填): 搜索关键词，例如 "人工智能"
- `count` (可选): 返回多少条结果，默认 10 条，最多 50 条
- `offset` (可选): 从第几条结果开始，用于翻页，默认 0

**返回内容**:
搜索结果包括：
- 搜索到的总结果数量
- 每条结果的标题、链接和摘要
- 格式化的易读内容

### 2. crawl_webpage - 网页抓取

抓取并提取网页的文本内容（自动跳过无法访问的网站）。

**参数说明**:
- `url` (必填): 要抓取的网页地址

**返回内容**:
- 网页标题
- 清理后的正文内容（自动去除广告、导航栏等无关内容）

**黑名单网站**（这些网站会被自动跳过）:
- 知乎 (zhihu.com)
- 小红书 (xiaohongshu.com)
- 微博 (weibo.com)
- 微信公众号 (weixin.qq.com)
- 抖音/TikTok (douyin.com, tiktok.com)
- B站 (bilibili.com)
- CSDN (csdn.net)

## 使用示例

### 示例 1: 基础搜索

**提问**: "搜索一下 TypeScript 教程"

**AI 会调用**: `bing_search`，参数为 `{ "query": "TypeScript 教程" }`

**返回结果**:
```
搜索关键词: TypeScript 教程
找到约 1,234,567 条结果

返回前 10 条结果:
================================================================================

[1] TypeScript 中文手册 - 官方文档
    链接: https://www.tslang.cn/docs/handbook/basic-types.html
    摘要: TypeScript 是 JavaScript 的超集，为其添加了类型系统...

[2] TypeScript 入门教程 - 阮一峰
    链接: https://ts.xcatliu.com/
    摘要: 从 JavaScript 程序员的角度总结思考，循序渐进讲解 TypeScript...

...
```

### 示例 2: 自定义结果数量

**提问**: "搜索 Node.js 性能优化，给我 20 条结果"

**AI 会调用**: `bing_search`，参数为 `{ "query": "Node.js 性能优化", "count": 20 }`

### 示例 3: 翻页搜索

**提问**: "搜索 React Hooks 教程，从第 11 条结果开始显示"

**AI 会调用**: `bing_search`，参数为 `{ "query": "React Hooks 教程", "offset": 10 }`

### 示例 4: 抓取网页内容

**提问**: "帮我抓取这个网页的内容 https://example.com/article"

**AI 会调用**: `crawl_webpage`，参数为 `{ "url": "https://example.com/article" }`

## 技术实现

本项目使用以下技术栈构建：

- **MCP SDK** (`@modelcontextprotocol/sdk`): 实现 MCP 协议
- **Axios**: 发送 HTTP 请求
- **Cheerio**: 解析 HTML 页面
- **Zod**: 参数验证
- **TypeScript**: 类型安全开发

### 项目结构

```
bingcnmcp/
├── src/
│   ├── index.ts         # MCP 服务器入口
│   ├── bingSearch.ts    # 必应搜索实现
│   ├── crawler.ts       # 网页抓取实现
│   ├── parser.ts        # HTML 解析器
│   ├── blacklist.ts     # 黑名单配置
│   └── types.ts         # 类型定义
├── build/               # 编译输出
├── package.json
└── tsconfig.json
```

## 常见问题

### 为什么搜索结果是空的？

1. **网络问题**: 检查是否能正常访问 cn.bing.com
2. **关键词问题**: 尝试换个关键词或更具体的搜索词
3. **被限制**: 短时间内搜索太多次可能被必应限制，等待几分钟再试

### Claude 没有调用搜索工具怎么办？

1. 确保配置文件格式正确（JSON 格式）
2. 确保完全重启了 Claude Desktop
3. 尝试明确要求 Claude 使用搜索："使用必应搜索工具查找..."

### 某些网站无法抓取内容

这是正常的，部分网站（如知乎、小红书等）因为访问限制或反爬虫机制被加入了黑名单。搜索结果中会显示这些网站的链接，但不会自动抓取内容。

### Windows 系统提示找不到 npx 命令

确保已经安装了 Node.js（推荐 18 或更高版本）。安装后重启电脑或命令行窗口。

下载 Node.js: https://nodejs.org/

## 注意事项

1. **网络要求**: 需要能够访问 `cn.bing.com`
2. **使用频率**: 请勿过于频繁搜索，建议每次搜索间隔至少 1-2 秒
3. **隐私保护**: 搜索请求直接发送到必应，本服务器不存储任何搜索记录
4. **无状态设计**: 每次请求都是独立的，不保存 Cookie 或会话信息
5. **仅供参考**：本项目仅供学习参考，请勿用于非法用途。
6. **结果不对**：搜索结果出现不对时，可能触发了反爬，如有更稳定需要，更推荐[tavily-mcp](https://github.com/tavily-ai/tavily-mcp)

## 许可证

[MIT](LICENSE)

## 贡献

欢迎提交问题报告和改进建议！



