"use client";

import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";

export function useEvm() {
  const [provider, setProvider] = useState<ethers.Eip1193Provider | undefined>();
  const [chainId, setChainId] = useState<number | undefined>();
  const [accounts, setAccounts] = useState<string[]>([]);

  useEffect(() => {
    const anyWindow = window as any;
    if (!anyWindow?.ethereum) return;
    const eth = anyWindow.ethereum as ethers.Eip1193Provider;
    setProvider(eth);

    eth.request({ method: "eth_chainId" }).then((cid: any) => setChainId(parseInt(cid as string, 16))).catch(() => {});
    eth.request({ method: "eth_accounts" }).then((a: any) => setAccounts(a as string[])).catch(() => {});

    const onChainChanged = (cidHex: string) => setChainId(parseInt(cidHex, 16));
    const onAccountsChanged = (a: string[]) => setAccounts(a);
    (eth as any).on?.("chainChanged", onChainChanged);
    (eth as any).on?.("accountsChanged", onAccountsChanged);
    return () => {
      (eth as any).removeListener?.("chainChanged", onChainChanged);
      (eth as any).removeListener?.("accountsChanged", onAccountsChanged);
    };
  }, []);

  const connect = useMemo(() => async () => {
    if (!provider) throw new Error("provider not found");
    const a = (await provider.request({ method: "eth_requestAccounts" })) as string[];
    setAccounts(a);
    return a;
  }, [provider]);

  return { provider, chainId, accounts, connect };
}



