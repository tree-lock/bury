import { Method } from "@xmon/monitor/dist/index.interface";
import { apiMap, urlMap } from "./map.config";
import { pathToRegexp, match } from "path-to-regexp";

const filters = {
  clickFilter: (ele: HTMLElement) => !!ele.dataset["bupoint"],
  urlFilter: (path: string) => {
    return urlMap.some((item) => pathToRegexp(item.path).test(path));
  },
  apiFilter: (url: string, method: Method = "GET") => {
    return apiMap.some((item) => {
      if (item.method && method !== item.method) {
        return false;
      }
      pathToRegexp(item.url).test(url);
    });
  },
};

export default filters;
