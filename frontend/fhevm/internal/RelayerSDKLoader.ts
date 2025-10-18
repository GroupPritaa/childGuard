const SDK_CDN_URLS = [
  // 官方推荐（参考模板）
  "https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.umd.cjs",
  // 备选镜像（仓库直链，若可访问）
  "https://cdn.jsdelivr.net/gh/zama-ai/relayer-sdk-js@0.2.0/relayer-sdk-js.umd.cjs",
  // 备用公共 npm CDN
  "https://unpkg.com/@zama-fhe/relayer-sdk@0.2.0/dist/relayer-sdk-js.umd.cjs"
];

type Trace = (msg: string) => void;

function isWindowOk(w: any, trace?: Trace): boolean {
  if (!w || typeof w !== "object") {
    if (trace) trace("window is not an object");
    return false;
  }
  if (!("relayerSDK" in w)) {
    if (trace) trace("window.relayerSDK not found");
    return false;
  }
  const sdk = w.relayerSDK;
  if (!sdk || typeof sdk !== "object") {
    if (trace) trace("window.relayerSDK is not an object");
    return false;
  }
  // 检查关键方法
  if (typeof sdk.initSDK !== "function") {
    if (trace) trace("window.relayerSDK.initSDK is not a function");
    return false;
  }
  if (typeof sdk.createInstance !== "function") {
    if (trace) trace("window.relayerSDK.createInstance is not a function");
    return false;
  }
  return true;
}

export class RelayerSDKLoader {
  private _trace?: Trace;
  constructor(trace?: Trace) { 
    this._trace = trace || console.log;
  }

  public async load(): Promise<void> {
    if (typeof window === "undefined") {
      throw new Error("RelayerSDKLoader: browser only");
    }

    // 如果已经加载且有效，直接返回
    if (isWindowOk(window, this._trace)) {
      console.log("[RelayerSDKLoader] SDK already loaded and valid");
      return;
    }

    return new Promise<void>((resolve, reject) => {
      const tryNext = (idx: number) => {
        if (idx >= SDK_CDN_URLS.length) {
          reject(new Error("所有 CDN 加载失败，请检查网络或使用可访问的镜像"));
          return;
        }

        const url = SDK_CDN_URLS[idx];
        const existing = document.querySelector(`script[src="${url}"]`);
        if (existing) {
          console.log(`[RelayerSDKLoader] Script exists for ${url}, validating...`);
          setTimeout(() => {
            if (!isWindowOk(window, this._trace)) {
              console.warn(`[RelayerSDKLoader] SDK object invalid after ${url}, trying next...`);
              tryNext(idx + 1);
            } else {
              resolve();
            }
          }, 300);
          return;
        }

        console.log(`[RelayerSDKLoader] Loading SDK from ${url} ...`);
        const s = document.createElement("script");
        s.src = url;
        s.type = "text/javascript";
        s.async = true;
        s.crossOrigin = 'anonymous';
        s.onload = () => {
          console.log(`[RelayerSDKLoader] Script loaded from ${url}, validating...`);
          setTimeout(() => {
            if (!isWindowOk(window, this._trace)) {
              console.warn(`[RelayerSDKLoader] SDK object invalid after ${url}, trying next...`);
              tryNext(idx + 1);
            } else {
              console.log("[RelayerSDKLoader] SDK loaded successfully");
              resolve();
            }
          }, 150);
        };
        s.onerror = () => {
          console.warn(`[RelayerSDKLoader] Failed to load ${url}, trying next...`);
          tryNext(idx + 1);
        };
        document.head.appendChild(s);
      };

      tryNext(0);
    });
  }
}
