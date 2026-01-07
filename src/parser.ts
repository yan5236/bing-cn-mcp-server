/**
 * HTML解析模块
 * 使用cheerio解析必应搜索结果页面
 */

import * as cheerio from 'cheerio';
import { randomUUID } from 'crypto';
import { SearchResult, BingSearchResponse } from './types.js';

/**
 * 解析必应搜索结果HTML
 * @param html 必应搜索结果页面的HTML字符串
 * @param query 搜索查询词
 * @returns 解析后的搜索结果
 */
export function parseBingSearchResults(
  html: string,
  query: string
): BingSearchResponse {
  const $ = cheerio.load(html);
  const results: SearchResult[] = [];

  // 必应搜索结果主要在 .b_algo 类中
  // 遍历每个搜索结果项
  $('.b_algo').each((index, element) => {
    try {
      const $element = $(element);

      // 提取标题和链接
      const $titleLink = $element.find('h2 a');
      const title = $titleLink.text().trim();
      const url = $titleLink.attr('href') || '';

      // 提取摘要/描述
      // 摘要通常在 .b_caption p 中
      const snippet = $element.find('.b_caption p').first().text().trim();

      // 提取显示URL
      const displayUrl = $element.find('.b_attribution cite').text().trim();

      // 只添加有效的结果
      if (title && url) {
        results.push({
          uuid: randomUUID(),
          title,
          url,
          snippet: snippet || '',
          displayUrl: displayUrl || url,
        });
      }
    } catch (error) {
      // 忽略单个结果解析错误，继续处理下一个
      console.error('解析搜索结果项时出错:', error);
    }
  });

  // 尝试获取结果总数（这个值可能不准确）
  let totalResults: number | undefined;
  const countText = $('.sb_count').text();
  const countMatch = countText.match(/[\d,]+/);
  if (countMatch) {
    totalResults = parseInt(countMatch[0].replace(/,/g, ''), 10);
  }

  return {
    query,
    results,
    totalResults,
  };
}

