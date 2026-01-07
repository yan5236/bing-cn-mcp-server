/**
 * 网页爬虫模块
 * 负责根据UUID抓取搜索结果中的网页内容
 */

import axios, { AxiosRequestConfig } from 'axios';
import * as cheerio from 'cheerio';
import { isUrlBlacklisted } from './blacklist.js';

// 用户代理，模拟浏览器访问
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * 抓取网页内容
 * @param url 要抓取的URL
 * @returns 提取的文本内容
 */
async function fetchWebPage(url: string): Promise<string> {
  // 检查黑名单
  if (isUrlBlacklisted(url)) {
    throw new Error(`该网站在爬虫黑名单中，禁止抓取: ${url}`);
  }

  try {
    // 请求配置
    const config: AxiosRequestConfig = {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
      },
      timeout: 30000, // 30秒超时
      maxRedirects: 5, // 最多5次重定向
    };

    // 发起GET请求
    const response = await axios.get(url, config);

    // 加载HTML
    const $ = cheerio.load(response.data);

    // 移除script、style、nav、footer等不需要的标签
    $('script, style, nav, footer, header, iframe, noscript').remove();

    // 提取主要内容
    // 优先查找文章主体常见的容器
    let content = '';
    const mainSelectors = [
      'article',
      'main',
      '[role="main"]',
      '.article-content',
      '.post-content',
      '.content',
      '.main-content',
      '#content',
      'body'
    ];

    for (const selector of mainSelectors) {
      const $main = $(selector).first();
      if ($main.length > 0) {
        content = $main.text();
        break;
      }
    }

    // 清理内容：移除多余的空白字符
    content = content
      .replace(/\s+/g, ' ')  // 将多个空白字符替换为单个空格
      .replace(/\n+/g, '\n') // 将多个换行符替换为单个换行符
      .trim();

    if (!content || content.length < 50) {
      throw new Error('提取的内容太少或为空');
    }

    return content;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(
          `抓取网页失败: HTTP ${error.response.status} - ${error.response.statusText}`
        );
      } else if (error.request) {
        throw new Error('抓取网页失败: 无法连接到服务器');
      }
    }
    throw error;
  }
}

/**
 * 网页抓取结果接口
 */
export interface CrawlResult {
  uuid: string;
  url: string;
  content?: string;
  error?: string;
  isBlacklisted?: boolean;
}

/**
 * 批量抓取网页内容
 * @param urlMap UUID到URL的映射
 * @returns 抓取结果数组
 */
export async function crawlWebPages(
  urlMap: Record<string, string>
): Promise<CrawlResult[]> {
  const results: CrawlResult[] = [];

  // 并发抓取所有URL
  const promises = Object.entries(urlMap).map(async ([uuid, url]) => {
    try {
      // 检查黑名单
      if (isUrlBlacklisted(url)) {
        return {
          uuid,
          url,
          error: '该网站在爬虫黑名单中，禁止抓取',
          isBlacklisted: true,
        };
      }

      // 抓取网页
      const content = await fetchWebPage(url);
      return {
        uuid,
        url,
        content,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      return {
        uuid,
        url,
        error: errorMessage,
      };
    }
  });

  // 等待所有抓取完成
  const crawlResults = await Promise.all(promises);
  results.push(...crawlResults);

  return results;
}
