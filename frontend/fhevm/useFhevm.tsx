"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
import { createFhevmInstance } from "./internal/fhevm";

export type FhevmState = "idle" | "loading" | "ready" | "error";

export function useFhevm(params: {
  provider: string | ethers.Eip1193Provider | undefined;
  chainId: number | undefined;
  initialMockChains?: Readonly<Record<number, string>>;
}) {
  const { provider, chainId, initialMockChains } = params;
  const [instance, setInstance] = useState<any | undefined>(undefined);
  const [status, setStatus] = useState<FhevmState>("idle");
  const [error, setError] = useState<Error | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);

  const refresh = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setInstance(undefined);
    setError(undefined);
    setStatus("idle");
  }, []);

  useEffect(() => { refresh(); }, [refresh, provider, chainId]);

  useEffect(() => {
    if (!provider) return;
    const ac = new AbortController();
    abortRef.current = ac;
    setStatus("loading");
    createFhevmInstance(provider, chainId, initialMockChains as Record<number, string> | undefined)
      .then((i) => { if (!ac.signal.aborted) { setInstance(i); setStatus("ready"); } })
      .catch((e) => { if (!ac.signal.aborted) { setError(e); setStatus("error"); } });
    return () => { ac.abort(); };
  }, [provider, chainId, initialMockChains]);

  return { instance, status, error, refresh };
}



