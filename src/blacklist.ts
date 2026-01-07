/**
 * 爬虫黑名单配置模块
 * 定义禁止爬取的网站域名列表
 */

/**
 * 爬虫黑名单 - 禁止抓取的网站域名
 *
 * 包括但不限于:
 * - 社交媒体平台 (知乎、小红书、微博等)
 * - 短视频平台 (抖音、TikTok等)
 * - 即时通讯平台 (微信公众号等)
 * - 视频平台 (B站等)
 */
export const CRAWLER_BLACKLIST: string[] = [
  // 知乎
  'zhihu.com',
  'www.zhihu.com',
  'zhuanlan.zhihu.com',

  // 小红书
  'xiaohongshu.com',
  'www.xiaohongshu.com',
  'xhs.com',

  // 微博
  'weibo.com',
  'www.weibo.com',
  'm.weibo.com',

  // 微信
  'weixin.qq.com',
  'mp.weixin.qq.com',

  // 抖音/TikTok
  'douyin.com',
  'www.douyin.com',
  'tiktok.com',
  'www.tiktok.com',

  // B站
  'bilibili.com',
  'www.bilibili.com',
  'm.bilibili.com',

  // CSDN
  'csdn.net',
  'www.csdn.net',
  'blog.csdn.net',
];

/**
 * 检查URL是否在黑名单中
 * @param url 要检查的URL
 * @returns 如果在黑名单中返回true,否则返回false
 */
export function isUrlBlacklisted(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // 检查hostname是否完全匹配或是黑名单域名的子域名
    return CRAWLER_BLACKLIST.some(domain => {
      const lowerDomain = domain.toLowerCase();
      return hostname === lowerDomain || hostname.endsWith('.' + lowerDomain);
    });
  } catch (error) {
    console.error('解析URL失败:', url, error);
    return false;
  }
}
