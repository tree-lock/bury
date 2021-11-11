import { Method } from "@xmon/monitor/dist/index.interface";
import { apiMap, urlMap } from "./map.config";
import { pathToRegexp } from "path-to-regexp";

const filters = {
  clickFilter: (ele: HTMLElement) => !!ele.dataset["bupoint"],
  /**
   * 判断路径是否在需要监听
   * @param path 要判断的路径
   * @returns 如果在监听的列表中，对应 path + enter + leave 对象，否则返回为undefined
   */
  urlFilter: (path: string) => {
    return urlMap.find((item) => pathToRegexp(item.path).test(path));
  },
  /**
   * 判断api是否在需要监听
   * @param url 要判断的apiUrl
   * @param method 要判断的请求的Method，默认为 GET ，如果没有设置该api的Method限制，则该参数无意义
   * @returns 如果在监听的列表中，对应 url + eventId 对象，否则返回为undefined
   */
  apiFilter: (url: string, method: Method = "GET") => {
    const ans = apiMap.find((item) => {
      if (item.method && method !== item.method) {
        return false;
      }
      return (
        pathToRegexp(item.url).test(url) ||
        pathToRegexp(item.url).test(url.split("?")[0])
      );
    });
    return ans;
  },
};

export default filters;
