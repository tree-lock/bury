import { Monitor, MonitorVue } from "@xmon/monitor";
import initConfig, { BuryConfig } from "./config";
import mitt from "mitt";
import { AxiosInstance, Payload } from "@xmon/monitor/dist/index.interface";
import { initMonitorVue, initMonitor } from "@xmon/monitor";
import filters from "./bury.filter";
import { BuryCallBackPayload } from "./index.interface";

export { initApiMap, initUrlMap } from "./map.config";
// bupoint 修改为变量，可定制成任何自定义属性

export const buryEmitter = mitt<{
  bury: BuryCallBackPayload;
}>();
const ex: { instance: Bury | null } = {
  instance: null,
};
const defaultConfig: BuryConfig = {};

class Bury {
  on = (callback: (value: BuryCallBackPayload) => void) =>
    buryEmitter.on("bury", callback);

  config: BuryConfig = {};
  private monitor: Monitor;
  private isSpy: boolean = false;
  private todo: ((config: BuryConfig) => void)[] = [];

  private ready = false;

  constructor(monitor: Monitor, config: BuryConfig) {
    this.monitor = monitor;
    this.init(monitor, config);
  }

  private initBuriedVue(monitor: MonitorVue, defaultConfig: BuryConfig) {
    this.initBuried(monitor, defaultConfig);
    monitor.monitorRouter();
    monitor.on("Route", (payload) => {
      const from = filters.urlFilter(payload.from.path);
      const to = filters.urlFilter(payload.to.path);
      if (from?.leave) {
        // 如果config已经尚未加载好，则将该事件推入等待队列。
        const buryCallback = (
          config: BuryConfig = this.config
        ): BuryCallBackPayload => {
          return {
            type: "Leave",
            payload: {
              ...config,
              eventId: from.leave,
              pageUrl: payload.from.path,
              pageStayTime: payload.duration.toString(),
              timestamp: payload.time.getTime().toString(),
            },
            extra: payload,
          };
        };
        if (!this.ready) {
          this.todo.push((config: BuryConfig) => {
            buryEmitter.emit("bury", buryCallback(config));
          });
        } else {
          buryEmitter.emit("bury", buryCallback());
        }
      }
      if (to?.enter) {
        const buryCallback = (
          config: BuryConfig = this.config
        ): BuryCallBackPayload => {
          return {
            type: "Enter",
            payload: {
              ...config,
              eventId: to.enter,
              pageUrl: payload.to.path,
              timestamp: payload.time.getTime().toString(),
            },
            extra: payload,
          };
        };
        if (!this.ready) {
          this.todo.push((config: BuryConfig) => {
            buryEmitter.emit("bury", buryCallback(config));
          });
        } else {
          buryEmitter.emit("bury", buryCallback());
        }
      }
    });

    return buryEmitter;
  }

  private initBuried(monitor: Monitor, defaultConfig: BuryConfig) {
    initConfig(defaultConfig).then((res) => {
      this.ready = true;
      Object.assign(this.config, res);
      const to = filters.urlFilter(window.location.pathname);
      if (to?.enter) {
        buryEmitter.emit("bury", {
          type: "Enter",
          payload: {
            ...this.config,
            eventId: to.enter,
            pageUrl: window.location.pathname,
            timestamp: new Date().getTime().toString(),
          },
        });
      }
      this.todo.map((item) => item(res));
      this.todo.length = 0;
    });
    monitor.monitorPage();
    monitor.monitorClick(filters.clickFilter);
    monitor.on("Action", (payload) => {
      if (Object.keys(this.config).length === 0) {
        this.todo.push((config: BuryConfig) => {
          buryEmitter.emit("bury", {
            type: "Action",
            payload: {
              ...config,
              eventId: payload.eventId,
              timestamp: payload.time.getTime().toString(),
            },
            extra: payload,
          });
        });
      } else {
        buryEmitter.emit("bury", {
          type: "Action",
          payload: {
            ...this.config,
            eventId: payload.eventId,
            timestamp: payload.time.getTime().toString(),
          },
          extra: payload,
        });
      }
    });
    monitor.on("Click", (payload) => {
      const eventId = payload.target.dataset["bupoint"] as string;
      if (Object.keys(this.config).length === 0) {
        this.todo.push((config: BuryConfig) => {
          buryEmitter.emit("bury", {
            type: "Click",
            payload: {
              ...config,
              eventId,
              timestamp: payload.time.getTime().toString(),
            },
            extra: payload,
          });
        });
      } else {
        buryEmitter.emit("bury", {
          type: "Click",
          payload: {
            ...this.config,
            eventId,
            timestamp: payload.time.getTime().toString(),
          },
          extra: payload,
        });
      }
    });
    monitor.on("Api", (payload) => {
      const api = filters.apiFilter(payload.url, payload.method);
      if (api) {
        if (Object.keys(this.config).length === 0) {
          this.todo.push((config: BuryConfig) => {
            buryEmitter.emit("bury", {
              type: "Api",
              payload: {
                ...config,
                eventId: api.eventId,
                apiUrl: payload.url,
                timestamp: payload.time.getTime().toString(),
              },
              extra: payload,
            });
          });
        } else {
          buryEmitter.emit("bury", {
            type: "Api",
            payload: {
              ...this.config,
              eventId: api.eventId,
              apiUrl: payload.url,
              timestamp: payload.time.getTime().toString(),
            },
            extra: payload,
          });
        }
      }
    });

    monitor.on("Unload", (payload) => {
      const form = filters.urlFilter(window.location.pathname);
      if (form?.leave) {
        if (Object.keys(this.config).length === 0) {
          console.log("unload");
          this.todo.push((config: BuryConfig) => {
            buryEmitter.emit("bury", {
              type: "Leave",
              payload: {
                ...config,
                eventId: form.leave,
                pageUrl: window.location.pathname,
                pageStayTime: payload.duration.toString(),
                timestamp: payload.time.getTime().toString(),
              },
              extra: payload,
            });
          });
        } else {
          buryEmitter.emit("bury", {
            type: "Leave",
            payload: {
              ...this.config,
              eventId: form.leave,
              pageUrl: window.location.pathname,
              pageStayTime: payload.duration.toString(),
              timestamp: payload.time.getTime().toString(),
            },
            extra: payload,
          });
        }
      }
    });

    return buryEmitter;
  }

  private init(monitor: Monitor, config: BuryConfig, spy = false) {
    if (monitor instanceof MonitorVue) {
      return this.initBuriedVue(monitor, config);
    } else {
      return this.initBuried(monitor, config);
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

  track<T extends () => any>(fn: T, eventId: string): T {
    return this.monitor.monitorEvent(fn, {
      eventId,
    }) as T;
  }

  trackApi(axiosInstance: AxiosInstance) {
    this.monitor.monitorAxios(axiosInstance);
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

export const onBury = (callback: (value: BuryCallBackPayload) => void) => {
  if (ex.instance) {
    return ex.instance.on(callback);
  } else {
    throw new Error("Monitor should be init first | 你可能没有初始化Bury实例");
  }
};

// TODO: 添加性能监控
// TODO: 添加错误捕获埋点

export default ex;
