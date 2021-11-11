import { Payload as monitorPayload } from "@xmon/monitor/dist/index.interface";
import { BuryConfig } from "./config";
import { BuryCallBackPayload } from "./index.interface";
type Payload =
  | monitorPayload.ActionPayload
  | monitorPayload.ApiPayload
  | monitorPayload.ClickPayload
  | monitorPayload.LoadPayload
  | monitorPayload.RoutePayload;
interface MinBuryPayload {
  eventId?: string;
  timestamp?: string;
  ua?: string;
  browser?: "MSIE" | "Firefox" | "Safari" | "Chrome" | "Opera";
  referrer?: string;
  width?: string;
  height?: string;
  ip?: string;
  cityName?: string;
  isPhone?: "phone" | "pc";
  userId?: string;
  [K: string]: string;
}
interface ActionPayload extends MinBuryPayload {}

interface ActionCallBackPayload {
  type: "Action";
  payload: ActionPayload;
  extra: monitorPayload.ActionPayload;
}

// const initBuryCallbackPayload = (
//   type: "Action" | "Click" | "Leave" | "Enter" | "Api",
//   config: BuryConfig,
//   eventId: string,
//   payload: Payload
// ): BuryCallBackPayload => {
//   if (type === "Action") {
//   } else if (type === "Click") {
//   } else if (type === "Api") {
//   } else if (type === "Enter") {
//   } else if (type === "Leave") {
//   }
// };
