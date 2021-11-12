import { MonitorVue } from "@xmon/monitor";
import Bury from "./bury";
import { BuryConfig } from "./config";
import filters from "./bury.filter";
import { buryEmit } from "./common";

export default class BuryVue extends Bury {
  constructor(monitor: MonitorVue, config: BuryConfig) {
    super(monitor, config);
    this.initBuriedVue(monitor);
  }

  private initBuriedVue(monitor: MonitorVue) {
    monitor.monitorRouter();
    monitor.on("Route", (payload) => {
      const from = filters.urlFilter(payload.from.path);
      const to = filters.urlFilter(payload.to.path);
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
      if (to?.enter) {
        const eventId = to.enter;
        if (!this.ready) {
          this.todo.push((config: BuryConfig) => {
            buryEmit("Enter", config, eventId, payload);
          });
        } else {
          buryEmit("Enter", this.config, eventId, payload);
        }
      }
    });
  }
}
