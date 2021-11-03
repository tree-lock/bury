import { Method } from "@xmon/monitor/dist/index.interface";

export const urlMap: {
  path: string;
  enter: string;
  leave: string;
}[] = [];

export function initUrlMap(
  map: {
    path: string;
    enter: string;
    leave: string;
  }[]
) {
  urlMap.push(...map);
}

export const apiMap: {
  url: string;
  eventId: string;
  method?: Method;
}[] = [];

export function initApiMap(
  map: {
    url: string;
    eventId: string;
    method?: Method;
  }[]
) {
  apiMap.push(...map);
}
