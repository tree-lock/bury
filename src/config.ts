import FingerprintJS from "@fingerprintjs/fingerprintjs";

export interface BuryConfig {
  ua?: string;
  project?: string;
  channelCode?: string;
  sourceCode?: string;
  topCause?: string;
  phone?: string;
  unionId?: string;
  openId?: string;
  enterTime?: string;
  time?: string;
  dataPointVersion?: string;
  environment?: string;
  version?: string;
  ip?: string;
  cityName?: string;
  extraInfo?: string;
  pageUrl?: string;
  pageStayTime?: string;
  apiUrl?: string;
  eventId?: string;
  userId?: string;
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
  Object.assign(config, loadConfig);
  return config;
}

export default initBuryConfig;
