# 必应中文搜索 MCP 服务器

这是一个基于 Model Context Protocol (MCP) 的必应中文搜索服务器,可以让 AI 助手通过必应搜索引擎获取实时网络信息。

## 功能特性

- 🔍 使用必应中文搜索引擎进行网络搜索
- 📝 返回结构化的搜索结果(标题、链接、摘要)
- 🌐 支持中文搜索优化
- ⚙️ 支持自定义结果数量和分页
- 🔒 无需 API 密钥

## 安装

### 前置要求

- Node.js 16 或更高版本
- npm 或其他包管理器

### 步骤

1. 克隆或下载此项目

2. 安装依赖:
```bash
npm install
```

3. 构建项目:
```bash
npm run build
```

## 使用方法

### 在 Claude Desktop 中使用

1. 打开 Claude Desktop 配置文件:
   - **Windows**: `%AppData%\Claude\claude_desktop_config.json`
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

2. 添加以下配置:

```json
{
  "mcpServers": {
    "bing-search": {
      "command": "node",
      "args": [
        "E:\\xiangmu\\bingcnmcp\\build\\index.js"
      ]
    }
  }
}
```

**注意**: 请将路径替换为你的实际项目路径。

3. 重启 Claude Desktop

### 在其他 MCP 客户端中使用

你可以使用任何支持 MCP 的客户端连接到此服务器。服务器通过 stdio 传输进行通信。

## 工具说明

### bing_search

使用必应中文搜索引擎搜索信息。

**参数**:
- `query` (string, 必需): 搜索关键词或查询语句
- `count` (number, 可选): 返回结果数量,默认 10,最多 50
- `offset` (number, 可选): 结果偏移量,用于分页,默认 0

**示例**:
```typescript
{
  "query": "人工智能最新进展",
  "count": 10,
  "offset": 0
}
```

**返回格式**:
```
搜索关键词: 人工智能最新进展
找到约 1,234,567 条结果

返回前 10 条结果:
================================================================================

[1] 标题...
    链接: https://...
    摘要: ...

[2] 标题...
    链接: https://...
    摘要: ...
...
```

## 开发

### 项目结构

```
bingcnmcp/
├── src/
│   ├── index.ts        # MCP 服务器主文件
│   ├── bingSearch.ts   # 必应搜索 API 调用
│   ├── parser.ts       # HTML 解析和数据提取
│   └── types.ts        # TypeScript 类型定义
├── build/              # 编译输出目录
├── package.json
├── tsconfig.json
└── README.md
```

### 可用脚本

- `npm run build` - 编译 TypeScript 代码
- `npm run dev` - 构建并运行服务器
- `npm start` - 运行已构建的服务器

### 技术栈

- **MCP SDK**: `@modelcontextprotocol/sdk` - Model Context Protocol 实现
- **HTTP 客户端**: `axios` - 发起必应搜索请求
- **HTML 解析**: `cheerio` - 解析搜索结果页面
- **参数验证**: `zod` - 运行时类型验证
- **语言**: TypeScript - 类型安全的 JavaScript

## 注意事项

1. **网络要求**: 需要能够访问 `cn.bing.com`
2. **频率限制**: 请勿过于频繁地发起请求,以免被必应限制
3. **日志输出**: 服务器日志输出到 stderr,不影响 MCP 通信
4. **错误处理**: 网络错误或解析错误会返回友好的错误信息

## 故障排查

### 服务器无法启动

1. 确保已运行 `npm run build`
2. 检查 Node.js 版本是否 >= 16
3. 查看 stderr 输出的错误信息

### Claude Desktop 无法识别服务器

1. 检查配置文件路径是否正确
2. 确保使用绝对路径
3. Windows 用户注意使用双反斜杠 `\\` 或正斜杠 `/`
4. 完全重启 Claude Desktop (退出后重新打开)

### 搜索返回空结果

1. 检查网络连接
2. 确认能否访问 cn.bing.com
3. 尝试更换搜索关键词
4. 查看 stderr 日志了解详细错误

## 许可证

ISC

## 贡献

欢迎提交 Issue 和 Pull Request!
