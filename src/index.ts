import {
  initMonitor,
  initMonitorVue,
  Monitor,
  MonitorVue,
} from "@xmon/monitor";
import { AxiosInstance } from "@xmon/monitor/dist/index.interface";
import Bury from "./bury";
import BuryVue from "./bury.vue";
import { BuryConfig } from "./config";
import { BuryCallBackPayload } from "./index.interface";
export { initApiMap, initUrlMap } from "./map.config";

const ex: { instance: Bury | null } = {
  instance: null,
};

export const init = (
  config: BuryConfig,
  router?: {
    beforeEach: (guard: any) => () => void;
    push: any;
    afterEach: (guard: any) => () => void;
    [K: string]: any;
  }
) => {
  if (router) {
    const monitor: MonitorVue = initMonitorVue(router);
    return (ex.instance = new BuryVue(monitor, config));
  }
  const monitor: Monitor = initMonitor();
  return (ex.instance = new Bury(monitor, config));
};

export function track<T extends () => any>(fn: T, eventId: string): T {
  if (ex.instance) {
    return ex.instance.track(fn, eventId);
  } else {
    throw new Error("Monitor should be init first | 你可能没有初始化Bury实例");
  }
}

export const trackApi = (axiosInstance: AxiosInstance) => {
  if (ex.instance) {
    return ex.instance.trackApi(axiosInstance);
  } else {
    throw new Error("Monitor should be init first | 你可能没有初始化Bury实例");
  }
};

/**
 * 当运行tracked的时候，会触发一次埋点事件onBury
 * @param eventId 事件ID
 */
export const tracked = (eventId: string) => {
  if (ex.instance) {
    return ex.instance.tracked(eventId);
  } else {
    throw new Error("Monitor should be init first | 你可能没有初始化Bury实例");
  }
};

export const onBury = (callback: (value: BuryCallBackPayload) => void) => {
  if (ex.instance) {
    return ex.instance.on(callback);
  } else {
    throw new Error("Monitor should be init first | 你可能没有初始化Bury实例");
  }
};
