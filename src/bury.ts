import { Monitor } from "@xmon/monitor";
import initConfig, { BuryConfig } from "./config";
import { AxiosInstance } from "@xmon/monitor/dist/index.interface";
import filters from "./bury.filter";
import { BuryCallBackPayload } from "./index.interface";
import { buryEmit, buryEmitter } from "./common";

export default class Bury {
  on = (callback: (value: BuryCallBackPayload) => void) =>
    buryEmitter.on("bury", callback);

  config: BuryConfig = {};
  private monitor: Monitor;
  private isSpy: boolean = false;
  protected todo: ((config: BuryConfig) => void)[] = [];

  protected ready = false;

  constructor(monitor: Monitor, config: BuryConfig) {
    this.monitor = monitor;
    this.init(monitor, config);
  }

  private init(monitor: Monitor, defaultConfig: BuryConfig) {
    initConfig(defaultConfig).then((res) => {
      Object.assign(this.config, res);
      this.ready = true;
      const to = filters.urlFilter(window.location.pathname);
      if (to?.enter) {
        const eventId = to.enter;
        buryEmit("Enter", this.config, eventId);
      }
      this.todo.map((item) => item(res));
      this.todo.length = 0;
    });
    monitor.monitorPage();
    monitor.monitorClick(filters.clickFilter);
    this.onAction();
    this.onClick();
    this.onApi();
    this.onUnload();
    return buryEmitter;
  }

  private onAction() {
    this.monitor.on("Action", (payload) => {
      const eventId = payload.eventId;
      if (!this.ready) {
        this.todo.push((config: BuryConfig) => {
          buryEmit("Action", config, eventId, payload);
        });
      } else {
        buryEmit("Action", this.config, eventId, payload);
      }
    });
  }

  private onClick() {
    this.monitor.on("Click", (payload) => {
      const eventId = payload.target.dataset["bupoint"] as string;
      if (!this.ready) {
        this.todo.push((config: BuryConfig) => {
          buryEmit("Click", config, eventId, payload);
        });
      } else {
        buryEmit("Click", this.config, eventId, payload);
      }
    });
  }

  private onApi() {
    this.monitor.on("Api", (payload) => {
      const api = filters.apiFilter(payload.url, payload.method);
      if (api) {
        const eventId = api.eventId;
        if (!this.ready) {
          this.todo.push((config: BuryConfig) => {
            buryEmit("Api", config, eventId, payload);
          });
        } else {
          buryEmit("Api", this.config, eventId, payload);
        }
      }
    });
  }

  private onUnload() {
    this.monitor.on("Unload", (payload) => {
      const from = filters.urlFilter(window.location.pathname);
      if (from?.leave) {
        const eventId = from.leave;
        if (!this.ready) {
          this.todo.push((config: BuryConfig) => {
            buryEmit("Leave", config, eventId, payload);
          });
        } else {
          buryEmit("Leave", this.config, eventId, payload);
        }
      }
    });
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

  /**
   * 当运行tracked的时候，会触发一次埋点事件onBury
   * @param eventId 事件ID
   */
  tracked(eventId: string) {
    return this.monitor.emit({ eventId });
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
