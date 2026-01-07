/**
 * 必应搜索API模块
 * 负责发起HTTP请求并获取搜索页面
 */

import axios, { AxiosRequestConfig } from 'axios';

// 必应中文搜索基础URL
const BING_SEARCH_URL = 'https://cn.bing.com/search';

// 用户代理，模拟浏览器访问
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * 执行必应搜索请求
 * @param query 搜索关键词
 * @param count 返回结果数量
 * @param offset 偏移量
 * @returns 返回HTML字符串
 */
export async function fetchBingSearch(
  query: string,
  count: number = 10,
  offset: number = 0
): Promise<string> {
  try {
    // 构建请求参数
    const params: Record<string, string | number> = {
      q: query,
      first: offset + 1, // 必应使用first参数表示起始位置
    };

    // 请求配置
    const config: AxiosRequestConfig = {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 15000, // 15秒超时
    };

    // 发起GET请求
    const response = await axios.get(BING_SEARCH_URL, {
      ...config,
      params,
    });

    // 返回HTML内容
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `必应搜索请求失败: ${error.message}` +
        (error.response ? ` (状态码: ${error.response.status})` : '')
      );
    }
    throw error;
  }
}
