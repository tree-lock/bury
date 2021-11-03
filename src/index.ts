import { Monitor, MonitorVue } from "@xmon/monitor";
import initConfig, { BuryConfig } from "./config";
import mitt from "mitt";
import { urlMap, apiMap } from "./map.config";
import { Payload } from "@xmon/monitor/dist/index.interface";
import { initMonitorVue, initMonitor } from "@xmon/monitor";
import filters from "./bury.filter";
export { initApiMap, initUrlMap } from "./map.config";
// bupoint 修改为变量，可定制成任何自定义属性
export const buryEmitter = mitt<{
  bury: {
    type: "Action" | "Click" | "Leave" | "Enter" | "Api";
    payload: BuryConfig;
    extra?:
      | Payload.ActionPayload
      | Payload.ApiPayload
      | Payload.ClickPayload
      | Payload.LoadPayload
      | Payload.RoutePayload;
  };
}>();
const ex: { instance: Bury | null } = {
  instance: null,
};

class Bury {
  on = buryEmitter.on;

  config: BuryConfig = {};
  private monitor: Monitor;
  private isSpy: boolean = false;

  constructor(monitor: Monitor, config: BuryConfig) {
    this.monitor = monitor;
    this.init(monitor, config);
  }

  private async initBuriedVue(monitor: MonitorVue, defaultConfig: BuryConfig) {
    this.initBuried(monitor, defaultConfig);
    monitor.monitorRouter();
    monitor.on("Route", (payload) => {
      if (payload.duration < 50) return;
      if (filters.urlFilter(payload.from.path)) {
        buryEmitter.emit("bury", {
          type: "Leave",
          payload: {
            ...this.config,
            eventId: urlMap[payload.from.path],
            pageUrl: payload.from.path,
            pageStayTime: payload.duration.toString(),
          },
          extra: payload,
        });
      }
      if (filters.urlFilter(payload.to.path)) {
        buryEmitter.emit("bury", {
          type: "Enter",
          payload: {
            ...this.config,
            eventId: urlMap[payload.to.path],
            pageUrl: payload.to.path,
          },
          extra: payload,
        });
      }
    });

    return buryEmitter;
  }

  private async initBuried(monitor: Monitor, defaultConfig: BuryConfig) {
    Object.assign(this.config, await initConfig(defaultConfig));
    if (filters.urlFilter(window.location.pathname)) {
      buryEmitter.emit("bury", {
        type: "Enter",
        payload: {
          ...this.config,
          eventId: urlMap[window.location.pathname],
          pageUrl: window.location.pathname,
        },
      });
    }
    monitor.monitorPage();
    monitor.monitorClick(filters.clickFilter);
    monitor.on("Action", (payload) => {
      buryEmitter.emit("bury", {
        type: "Click",
        payload: {
          ...this.config,
          eventId: payload.eventId,
        },
        extra: payload,
      });
    });
    monitor.on("Click", (payload) => {
      const eventId = payload.target.dataset["bupoint"] as string;
      buryEmitter.emit("bury", {
        type: "Click",
        payload: {
          ...this.config,
          eventId,
        },
        extra: payload,
      });
    });
    monitor.on("Api", (payload) => {
      if (filters.apiFilter(payload.url, payload.method)) {
        buryEmitter.emit("bury", {
          type: "Api",
          payload: {
            ...this.config,
            eventId: apiMap[payload.url],
            apiUrl: payload.url,
          },
          extra: payload,
        });
      }
    });

    monitor.on("Unload", (payload) => {
      if (filters.urlFilter(window.location.pathname)) {
        buryEmitter.emit("bury", {
          type: "Leave",
          payload: {
            ...this.config,
            eventId: urlMap[window.location.pathname],
            pageUrl: window.location.pathname,
            pageStayTime: payload.duration.toString(),
          },
          extra: payload,
        });
      }
    });
    return buryEmitter;
  }

  private async init(monitor: Monitor, config: BuryConfig, spy = false) {
    if (monitor instanceof MonitorVue) {
      return await this.initBuriedVue(monitor, config);
    } else {
      return await this.initBuried(monitor, config);
    }
  }

  spy() {
    if (this.isSpy) return;
    buryEmitter.on("bury", (payload) => {
      console.log(
        "%c" + payload.type,
        "color: blue; background: #bfcf5f;",
        "|payload =>",
        payload.payload,
        "|extra =>",
        payload.extra,
        "|"
      );
    });
    this.isSpy = true;
  }

  track(fn: () => any, eventId: string): () => any {
    return this.monitor.monitorEvent(fn, {
      eventId,
    });
  }
}

export const init = (
  config: BuryConfig,
  router?: {
    beforeEach: (guard: any) => () => void;
    push: any;
    afterEach: (guard: any) => () => void;
    [K: string]: any;
  }
) => {
  const monitor: Monitor = router ? initMonitorVue(router) : initMonitor();
  return (ex.instance = new Bury(monitor, config));
};

export const track = (fn: () => any, eventId: string) => {
  if (ex.instance) {
    return ex.instance.track(fn, eventId);
  } else {
    throw new Error("Monitor should be init first | 你可能没有初始化Bury实例");
  }
};

export default ex;
