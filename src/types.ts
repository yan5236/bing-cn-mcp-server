/**
 * 类型定义模块
 * 定义必应搜索相关的TypeScript类型
 */

// 搜索结果项
export interface SearchResult {
  uuid: string;         // 唯一标识符
  title: string;        // 标题
  url: string;          // 链接
  snippet: string;      // 摘要/描述
  displayUrl?: string;  // 显示的URL
}

// 搜索响应
export interface BingSearchResponse {
  query: string;           // 搜索查询词
  results: SearchResult[]; // 搜索结果列表
  totalResults?: number;   // 结果总数（估算）
}

// 搜索选项
export interface SearchOptions {
  count?: number;      // 返回结果数量，默认10
  offset?: number;     // 偏移量，用于分页
  market?: string;     // 市场/语言，默认zh-CN
}
