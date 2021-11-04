import { Method } from "@xmon/monitor/dist/index.interface";
import { apiMap, urlMap } from "./map.config";
import { pathToRegexp } from "path-to-regexp";

const filters = {
  clickFilter: (ele: HTMLElement) => !!ele.dataset["bupoint"],
  urlFilter: (path: string) => {
    return urlMap.find((item) => pathToRegexp(item.path).test(path));
  },
  apiFilter: (url: string, method: Method = "GET") => {
    const ans = apiMap.find((item) => {
      if (item.method && method !== item.method) {
        return false;
      }
      if (url.startsWith(item.url + "?")) return true;
      return pathToRegexp(item.url).test(url);
    });
    return ans;
  },
};

export default filters;
