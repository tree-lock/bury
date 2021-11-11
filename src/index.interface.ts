import { Payload } from "@xmon/monitor/dist/index.interface";
import { BuryConfig } from "./config";

export interface BuryCallBackPayload {
  type: "Action" | "Click" | "Leave" | "Enter" | "Api";
  payload: BuryConfig;
  extra?:
    | Payload.ActionPayload
    | Payload.ApiPayload
    | Payload.ClickPayload
    | Payload.LoadPayload
    | Payload.RoutePayload;
}
