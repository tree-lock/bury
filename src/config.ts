import FingerprintJS from "@fingerprintjs/fingerprintjs";

export interface BuryConfig {
  eventId?: string;
  timestamp?: string;
  ua?: string;
  browser?: "MSIE" | "Firefox" | "Safari" | "Chrome" | "Opera";
  referrer?: string;
  width?: string;
  height?: string;
  isPhone?: "phone" | "pc";
  userId?: string;
  apiUrl?: string;
  pageUrl?: string;
  pageStayTime?: string;
  [K: string]: string;
}

let config: BuryConfig = {};

async function initBuryConfig(loadConfig: BuryConfig) {
  const fpPromise = FingerprintJS.load();

  const fp = await fpPromise;
  const result = await fp.get();
  const userId = result.visitorId;
  config.userId = userId;
  config.ua = navigator.userAgent;
  config.referrer = document.referrer;
  config.width = document.documentElement.clientWidth.toString();
  config.height = document.documentElement.clientHeight.toString();
  config.browser = (() => {
    let aKeys: ("MSIE" | "Firefox" | "Safari" | "Chrome" | "Opera")[] = [
        "MSIE",
        "Firefox",
        "Safari",
        "Chrome",
        "Opera",
      ],
      sUsrAg = navigator.userAgent,
      nIdx = aKeys.length - 1;
    for (nIdx; nIdx > -1 && sUsrAg.indexOf(aKeys[nIdx]) === -1; nIdx--);
    return aKeys[nIdx];
  })();
  if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
    config.isPhone = "phone";
  } else {
    config.isPhone = "pc";
  }
  Object.assign(config, loadConfig);
  return config;
}

export default initBuryConfig;
