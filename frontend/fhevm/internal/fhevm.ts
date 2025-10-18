import { ethers } from "ethers";
import { RelayerSDKLoader } from "./RelayerSDKLoader";

type Eip1193 = ethers.Eip1193Provider;

function isRelayerSDKValid(w: any): boolean {
  if (!w || typeof w !== "object") return false;
  const sdk = w.relayerSDK;
  if (!sdk || typeof sdk !== "object") return false;
  // 检查必要的方法和配置
  return typeof sdk.initSDK === "function" && 
         typeof sdk.createInstance === "function" &&
         sdk.SepoliaConfig !== undefined;
}

async function tryFetchHardhatMeta(rpcUrl: string): Promise<{
  ACLAddress: `0x${string}`;
  InputVerifierAddress: `0x${string}`;
  KMSVerifierAddress: `0x${string}`;
} | null> {
  try {
    const res = await fetch(`${rpcUrl.replace(/\/$/, "")}/fhevm/metadata`);
    if (!res.ok) return null;
    const j = await res.json();
    if (j?.ACLAddress && j?.InputVerifierAddress && j?.KMSVerifierAddress) return j;
  } catch {}
  return null;
}

export async function createFhevmInstance(
  providerOrUrl: Eip1193 | string,
  chainId?: number,
  mockChains?: Record<number, string>
): Promise<any> {
  const isUrl = typeof providerOrUrl === "string";
  const rpcUrl = isUrl ? (providerOrUrl as string) : undefined;
  let currentChainId = chainId;

  if (!isUrl && providerOrUrl) {
    const cidHex = await (providerOrUrl as Eip1193).request({ method: "eth_chainId" }) as string;
    currentChainId = parseInt(cidHex, 16);
  }

  // 尝试本地 Mock（如果配置了 mockChains）
  if (mockChains && currentChainId && mockChains[currentChainId]) {
    const url = mockChains[currentChainId];
    const meta = await tryFetchHardhatMeta(url);
    if (meta) {
      const { createMockInstance } = await import("./mock/fhevmMock");
      return createMockInstance(url, currentChainId, meta);
    }
  }

  // Sepolia 必须有 provider
  if (!providerOrUrl) {
    throw new Error("Provider is required for Sepolia network");
  }

  // 加载 Relayer SDK
  const loader = new RelayerSDKLoader();
  await loader.load();
  // 容忍部分浏览器脚本加载稍迟的情况（最多重试 2 次）
  if (!isRelayerSDKValid(window)) {
    await new Promise((r) => setTimeout(r, 200));
  }
  if (!isRelayerSDKValid(window)) {
    throw new Error("Relayer SDK 对象无效或方法缺失");
  }
  
  const sdk: any = (window as any).relayerSDK;
  console.log("[FHEVM] Relayer SDK loaded:", sdk);

  // 初始化 SDK
  if (!sdk.__initialized__) {
    console.log("[FHEVM] Initializing Relayer SDK...");
    try {
      const result = await sdk.initSDK();
      console.log("[FHEVM] initSDK result:", result);
      if (!result) {
        throw new Error("initSDK 返回 false");
      }
      sdk.__initialized__ = true;
    } catch (e: any) {
      console.error("[FHEVM] initSDK failed:", e);
      throw new Error(`Relayer SDK 初始化失败: ${e.message}`);
    }
  }

  // 检查 SepoliaConfig
  if (!sdk.SepoliaConfig) {
    throw new Error("Relayer SDK 缺少 SepoliaConfig");
  }

  console.log("[FHEVM] Creating instance with config:", sdk.SepoliaConfig);

  // 创建实例
  try {
    const instance = await sdk.createInstance({
      ...sdk.SepoliaConfig,
      network: providerOrUrl,
    });
    console.log("[FHEVM] Instance created successfully");
    return instance;
  } catch (e: any) {
    console.error("[FHEVM] createInstance failed:", e);
    throw new Error(`创建 FHEVM 实例失败: ${e.message}`);
  }
}
