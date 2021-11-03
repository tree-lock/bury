import { Monitor, MonitorVue } from "@xmon/monitor";
import initConfig, { BuryConfig } from "./config";
import mitt from "mitt";
import { apiMap } from "./map.config";
import { AxiosInstance, Payload } from "@xmon/monitor/dist/index.interface";
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
  todo: ((config: BuryConfig) => void)[] = [];

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
      if (from) {
        if (Object.keys(this.config).length === 0) {
          this.todo.push((config: BuryConfig) => {
            buryEmitter.emit("bury", {
              type: "Leave",
              payload: {
                ...config,
                eventId: from.leave,
                pageUrl: payload.from.path,
                pageStayTime: payload.duration.toString(),
              },
              extra: payload,
            });
          });
        } else {
          buryEmitter.emit("bury", {
            type: "Leave",
            payload: {
              ...this.config,
              eventId: from.leave,
              pageUrl: payload.from.path,
              pageStayTime: payload.duration.toString(),
            },
            extra: payload,
          });
        }
      }
      if (to) {
        if (Object.keys(this.config).length === 0) {
          this.todo.push((config: BuryConfig) => {
            buryEmitter.emit("bury", {
              type: "Enter",
              payload: {
                ...config,
                eventId: to.enter,
                pageUrl: payload.to.path,
              },
              extra: payload,
            });
          });
        } else {
          buryEmitter.emit("bury", {
            type: "Enter",
            payload: {
              ...this.config,
              eventId: to.enter,
              pageUrl: payload.to.path,
            },
            extra: payload,
          });
        }
      }
    });

    return buryEmitter;
  }

  private initBuried(monitor: Monitor, defaultConfig: BuryConfig) {
    initConfig(defaultConfig).then((res) => {
      Object.assign(this.config, res);
      const to = filters.urlFilter(window.location.pathname);
      if (to) {
        buryEmitter.emit("bury", {
          type: "Enter",
          payload: {
            ...this.config,
            eventId: to.enter,
            pageUrl: window.location.pathname,
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
            type: "Click",
            payload: {
              ...config,
              eventId: payload.eventId,
            },
            extra: payload,
          });
        });
      } else {
        buryEmitter.emit("bury", {
          type: "Click",
          payload: {
            ...this.config,
            eventId: payload.eventId,
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
            },
            extra: payload,
          });
        }
      }
    });

    monitor.on("Unload", (payload) => {
      const form = filters.urlFilter(window.location.pathname);
      if (form) {
        if (Object.keys(this.config).length === 0) {
          this.todo.push((config: BuryConfig) => {
            buryEmitter.emit("bury", {
              type: "Leave",
              payload: {
                ...config,
                eventId: form.leave,
                pageUrl: window.location.pathname,
                pageStayTime: payload.duration.toString(),
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

  track(fn: () => any, eventId: string): () => any {
    return this.monitor.monitorEvent(fn, {
      eventId,
    });
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

export const track = (fn: () => any, eventId: string) => {
  if (ex.instance) {
    return ex.instance.track(fn, eventId);
  } else {
    throw new Error("Monitor should be init first | 你可能没有初始化Bury实例");
  }
};

export const trackApi = (axiosInstance: AxiosInstance) => {
  if (ex.instance) {
    return ex.instance.trackApi(axiosInstance);
  } else {
    throw new Error("Monitor should be init first | 你可能没有初始化Bury实例");
  }
};

export default ex;
