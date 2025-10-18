"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import { useEvm } from "../../hooks/useEvm";
import { ethers } from "ethers";
import { GuardBadgeABI } from "../../abi/GuardBadgeABI";
import { GuardBadgeAddresses } from "../../abi/GuardBadgeAddresses";
import { ChildGuardABI } from "../../abi/ChildGuardABI";
import { ChildGuardAddresses } from "../../abi/ChildGuardAddresses";

export default function ProfilePage() {
  const { provider, chainId, accounts, connect } = useEvm();
  const [balances, setBalances] = useState<{ id: number; amount: string }[]>([]);
  const [status, setStatus] = useState<string>("");
  const badgeAddr = useMemo(() => (chainId ? GuardBadgeAddresses[chainId] : undefined), [chainId]);
  const childGuardAddr = useMemo(() => (chainId ? ChildGuardAddresses[chainId] : undefined), [chainId]);

  useEffect(() => {
    (async () => {
      if (!provider || !chainId || accounts.length === 0) return;
      const addr = badgeAddr;
      if (!addr) return;
      const rpc = new ethers.BrowserProvider(provider);
      const c = new ethers.Contract(addr, GuardBadgeABI, await rpc.getSigner());
      const ids = [1, 2, 3];
      const out: { id: number; amount: string }[] = [];
      for (const id of ids) {
        const v: bigint = await c.balanceOf(accounts[0], id);
        out.push({ id, amount: String(v) });
      }
      setBalances(out);
    })();
  }, [provider, chainId, accounts, badgeAddr]);

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1e40af', marginBottom: 16 }}>个人中心</h1>
        {accounts.length === 0 && (
          <button onClick={connect} className="btn-primary">连接钱包</button>
        )}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>我的勋章</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 16 }}>
            {balances.map((b) => (
              <div key={b.id} className="card" style={{ padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 48 }}>🏅</div>
                <div style={{ fontWeight: 700 }}>Badge #{b.id}</div>
                <div style={{ color: '#6b7280' }}>数量：{b.amount}</div>
                <button
                  className="btn-primary"
                  style={{ marginTop: 12 }}
                  onClick={async () => {
                    try {
                      if (!provider || !chainId || !childGuardAddr) return;
                      const rpc = new ethers.BrowserProvider(provider);
                      const signer = await rpc.getSigner();
                      const cg = new ethers.Contract(childGuardAddr, ChildGuardABI, signer);
                      const claimed: boolean = await cg.badgeClaimed(b.id, await signer.getAddress());
                      if (claimed) {
                        setStatus(`Badge #${b.id} 已领取`);
                        return;
                      }
                      const [eligible, progress, target] = await cg.isEligible(await signer.getAddress(), b.id);
                      if (!eligible) {
                        setStatus(`暂不可领取：进度 ${progress}/${target}`);
                        return;
                      }
                      const tx = await cg.claimBadge(b.id);
                      setStatus(`领取中... tx:${tx.hash}`);
                      await tx.wait();
                      setStatus(`领取成功！`);
                      // refresh balances
                      const nb: bigint = await new ethers.Contract(badgeAddr!, GuardBadgeABI, signer).balanceOf(await signer.getAddress(), b.id);
                      setBalances((prev) => prev.map((x) => x.id === b.id ? { ...x, amount: String(nb) } : x));
                    } catch (e: any) {
                      setStatus(`领取失败: ${e.message || e}`);
                    }
                  }}
                >
                  领取
                </button>
              </div>
            ))}
          </div>
          {status && (
            <div style={{ marginTop: 12, color: status.includes('失败') ? '#991b1b' : '#065f46' }}>{status}</div>
          )}
        </div>
      </main>
    </>
  );
}


