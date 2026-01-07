#!/usr/bin/env node

/**
 * 必应中文搜索MCP服务器
 * 提供必应搜索工具给MCP客户端使用
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { fetchBingSearch } from './bingSearch.js';
import { parseBingSearchResults } from './parser.js';
import { crawlWebPages } from './crawler.js';

// 创建MCP服务器实例
const server = new McpServer({
  name: 'bing-cn-search',
  version: '1.0.0',
});

/**
 * 注册必应搜索工具
 *
 * 该工具允许用户通过必应中文搜索引擎搜索信息
 */
server.registerTool(
  'bing_search',
  {
    description: '使用必应中文搜索引擎搜索信息。返回搜索结果包括标题、链接和摘要。',
    inputSchema: {
      query: z
        .string()
        .min(1)
        .describe('搜索关键词或查询语句'),
      count: z
        .number()
        .min(1)
        .max(50)
        .optional()
        .default(10)
        .describe('返回结果数量，默认10条，最多50条'),
      offset: z
        .number()
        .min(0)
        .optional()
        .default(0)
        .describe('结果偏移量，用于分页，默认0'),
    },
  },
  async ({ query, count = 10, offset = 0 }) => {
    try {
      // 记录搜索请求
      console.error(`执行必应搜索: "${query}", count=${count}, offset=${offset}`);

      // 获取搜索结果HTML
      const html = await fetchBingSearch(query, count, offset);

      // 解析HTML提取结果
      const searchResponse = parseBingSearchResults(html, query);

      // 返回 JSON 结构化数据
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(searchResponse, null, 2),
          },
        ],
      };
    } catch (error) {
      // 错误处理
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      console.error('必应搜索出错:', errorMessage);

      return {
        content: [
          {
            type: 'text',
            text: `搜索失败: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  }
);

/**
 * 注册网页抓取工具
 *
 * 该工具根据搜索结果中的UUID抓取对应的网页内容
 * 会自动过滤黑名单中的网站
 */
server.registerTool(
  'crawl_webpage',
  {
    description: '根据搜索结果的UUID抓取网页内容。支持批量抓取多个网页。会自动过滤黑名单中的网站(如知乎、小红书等)。',
    inputSchema: {
      uuids: z
        .array(z.string())
        .min(1)
        .describe('搜索结果的UUID列表，可以是单个或多个UUID'),
      urlMap: z
        .record(z.string())
        .describe('UUID到URL的映射对象，格式: {"uuid1": "url1", "uuid2": "url2"}'),
    },
  },
  async ({ uuids, urlMap }) => {
    try {
      console.error(`开始抓取网页，UUID数量: ${uuids.length}`);

      // 验证所有UUID都在urlMap中
      const missingUuids = uuids.filter(uuid => !urlMap[uuid]);
      if (missingUuids.length > 0) {
        return {
          content: [
            {
              type: 'text',
              text: `错误: 以下UUID在urlMap中不存在: ${missingUuids.join(', ')}`,
            },
          ],
          isError: true,
        };
      }

      // 构建要抓取的URL映射
      const targetUrlMap: Record<string, string> = {};
      uuids.forEach(uuid => {
        targetUrlMap[uuid] = urlMap[uuid];
      });

      // 抓取网页
      const results = await crawlWebPages(targetUrlMap);

      // 返回结果
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      console.error('网页抓取出错:', errorMessage);

      return {
        content: [
          {
            type: 'text',
            text: `抓取失败: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  }
);

/**
 * 主函数 - 启动MCP服务器
 */
async function main() {
  try {
    // 创建stdio传输层
    const transport = new StdioServerTransport();

    // 连接服务器和传输层
    await server.connect(transport);

    // 输出启动信息到stderr（不能用stdout，会破坏MCP通信）
    console.error('必应中文搜索MCP服务器已启动');
    console.error('等待来自MCP客户端的请求...');
  } catch (error) {
    console.error('启动MCP服务器失败:', error);
    process.exit(1);
  }
}

// 运行主函数
main().catch((error) => {
  console.error('服务器运行出错:', error);
  process.exit(1);
});
