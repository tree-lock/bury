import FingerprintJS from "@fingerprintjs/fingerprintjs";

export interface BuryConfig {
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
  apiUrl?: string;
  pageUrl?: string;
  pageStayTime?: string;
  project?: string;
  environment?: string;
  dataPointVersion?: string;
  version?: string;
  channelCode?: string;
  sourceCode?: string;
  topCause?: string;
  phone?: string;
  enterTime?: string;
  extraInfo?: string;
  [K: string]: string;
}

declare var returnCitySN: {
  cid: string;
  cip: string;
  cname: string;
};

const info: Promise<{
  cid: string;
  cip: string;
  cname: string;
}> = new Promise((resolve) => {
  const script = document.createElement("script");
  script.src = "http://pv.sohu.com/cityjson?ie=utf-8";
  script.async = true;
  const head = document.getElementsByTagName("head")[0];
  const s =
    head.getElementsByTagName("script")[
      head.getElementsByTagName("script").length - 1
    ];
  s.parentNode?.insertBefore(script, s);
  script.onload = function () {
    resolve(returnCitySN);
  };
});

let config: BuryConfig = {};

async function initBuryConfig(loadConfig: BuryConfig) {
  const fpPromise = FingerprintJS.load();

  const fp = await fpPromise;
  const result = await fp.get();
  const userId = result.visitorId;
  const { cip: ip, cname: cityName } = await info;
  config.ip = ip;
  config.cityName = cityName;
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
