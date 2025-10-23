"use client";

import { useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import { useEvm } from "../../hooks/useEvm";
import { ethers } from "ethers";
import { ChildGuardABI } from "../../abi/ChildGuardABI";
import { ChildGuardAddresses } from "../../abi/ChildGuardAddresses";
import { useFhevm } from "../../fhevm/useFhevm";

type Stat = { key: string; value: string };

export default function LeaderboardPage() {
  const { provider, chainId } = useEvm();
  const { instance, status: fhevmStatus, refresh } = useFhevm({ provider, chainId, initialMockChains: undefined });
  const [decStatus, setDecStatus] = useState<string>("");
  const [stats, setStats] = useState<Stat[]>([]);
  const contractAddress = useMemo(() => (chainId ? ChildGuardAddresses[chainId] : undefined), [chainId]);

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1e40af', marginBottom: 24 }}>排行榜 & 全局统计</h1>
        {stats.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 16, marginBottom: 16 }}>
            {stats.map((s) => (
              <div key={s.key} className="card" style={{ padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: '#6b7280' }}>{s.key}</div>
                <div style={{ fontSize: 36, fontWeight: 800 }}>{s.value}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: 24, marginBottom: 16, textAlign: 'center', color: '#6b7280' }}>
            点击下方“解密总支持数”后显示统计
          </div>
        )}
        <div className="card" style={{ padding: 24, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ color: '#6b7280' }}>
              FHE 解密汇总：点击“解密总支持数”，我们会从合约批量读取加密计数句柄，经 Relayer SDK 生成签名并在本地解密后聚合展示。
            </div>
            <button
              className="btn-primary"
              onClick={async () => {
                try {
                  if (!provider || !chainId || !contractAddress) {
                    setDecStatus("请先连接钱包，并切换到 Sepolia 网络");
                    return;
                  }
                  if (fhevmStatus !== 'ready' || !instance) {
                    setDecStatus(`FHEVM 未就绪（状态：${fhevmStatus}），正在尝试初始化...`);
                    // 触发重新创建实例
                    refresh?.();
                    return;
                  }
                  setDecStatus("读取数据中...");
                  const rpc = new ethers.BrowserProvider(provider);
                  const signer = await rpc.getSigner();
                  const c = new ethers.Contract(contractAddress, ChildGuardABI, signer);

                  // 取前 100 条作为示例
                  const page = await c.getActions(0n, 100n);
                  const handles: { handle: string; contractAddress: string }[] = [];
                  for (const r of page) {
                    const h = r.supportCountEnc as string;
                    if (h && h !== ethers.ZeroHash) handles.push({ handle: h, contractAddress });
                  }
                  if (handles.length === 0) {
                    setDecStatus("暂无可解密的数据");
                    return;
                  }

                  setDecStatus(`准备解密 ${handles.length} 个句柄...`);

                  const kp = instance.generateKeypair();
                  const start = Math.floor(Date.now() / 1000);
                  const days = 365;
                  const eip712 = instance.createEIP712(kp.publicKey, [contractAddress], start, days);
                  const sig = await signer.signTypedData(
                    eip712.domain,
                    { UserDecryptRequestVerification: (eip712 as any).types.UserDecryptRequestVerification },
                    eip712.message
                  );

                  const map = await instance.userDecrypt(
                    handles,
                    kp.privateKey,
                    kp.publicKey,
                    sig,
                    [contractAddress],
                    await signer.getAddress(),
                    start,
                    days
                  );

                  let sum = 0n;
                  for (const h of handles) {
                    const v = map[h.handle] as bigint;
                    if (typeof v === 'bigint') sum += v;
                  }
                  setStats((prev) => {
                    const others = prev.filter((x) => x.key !== "解密汇总支持数");
                    return [...others, { key: "解密汇总支持数", value: String(sum) }];
                  });
                  setDecStatus("解密完成 ✅");
                } catch (e: any) {
                  setDecStatus(`解密失败: ${e.message || e}`);
                }
              }}
            >
              🔓 解密总支持数
            </button>
          </div>
          {decStatus && (
            <div style={{ marginTop: 12, color: decStatus.includes('失败') ? '#991b1b' : '#065f46' }}>{decStatus}</div>
          )}
        </div>
        <div className="card" style={{ padding: 24, marginTop: 24 }}>
          <div style={{ color: '#6b7280' }}>更多排行榜（按地区、按支持数）可基于事件聚合实现，如需我可继续完成。</div>
        </div>
      </main>
    </>
  );
}


