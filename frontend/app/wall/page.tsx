"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useEvm } from "../../hooks/useEvm";
import { useFhevm } from "../../fhevm/useFhevm";
import { ChildGuardAddresses } from "../../abi/ChildGuardAddresses";
import { useChildGuard, ChildGuardRecord } from "../../hooks/useChildGuard";
import Navbar from "../../components/Navbar";

export default function WallPage() {
  const { provider, chainId } = useEvm();
  const { instance } = useFhevm({ provider, chainId, initialMockChains: undefined });
  const address = chainId ? ChildGuardAddresses[chainId] : undefined;
  const cg = useChildGuard({ instance, eip1193Provider: provider!, chainId, contractAddress: address });
  const [records, setRecords] = useState<ChildGuardRecord[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!address) {
        setLoading(false);
        return;
      }
      try {
        setStatus("加载中...");
        setLoading(true);
        const page = await cg.getActions(0n, 20n);
        setRecords(page.reverse()); // 最新在前
        setStatus("");
        setLoading(false);
      } catch (e: any) {
        setStatus("加载失败: " + e.message);
        setLoading(false);
      }
    })();
  }, [address]);

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🏛️</div>
          <h1 style={{ fontSize: 36, fontWeight: 700, color: '#1e40af', marginBottom: 12 }}>守护行动墙</h1>
          <p style={{ fontSize: 18, color: '#6b7280' }}>所有上链的儿童保护行动记录</p>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <p style={{ color: '#6b7280' }}>{status || "加载中..."}</p>
          </div>
        )}

        {!loading && records.length === 0 && (
          <div className="card" style={{ padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📭</div>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#6b7280', marginBottom: 16 }}>暂无行动记录</h3>
            <Link href="/submit">
              <button className="btn-primary">提交第一条记录</button>
            </Link>
          </div>
        )}

        {!loading && records.length > 0 && (
          <div style={{ display: 'grid', gap: 20 }}>
            {records.map((r) => (
              <div key={String(r.id)} className="card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1e40af', marginBottom: 8 }}>
                      {r.title}
                    </h3>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                      <span className="badge badge-region">📍 {r.region}</span>
                      <span className="badge" style={{ background: '#fef3c7', color: '#92400e' }}>📅 {r.date}</span>
                      <span className="badge badge-support">❤️ 支持数(加密)</span>
                    </div>
                    <div style={{ fontSize: 14, color: '#9ca3af' }}>
                      提交者: {r.submitter.slice(0, 6)}...{r.submitter.slice(-4)} · 
                      时间: {new Date(Number(r.timestamp) * 1000).toLocaleString('zh-CN')}
                    </div>
                  </div>
                  <div style={{ fontSize: 48 }}>🛡️</div>
                </div>
                
                <div style={{ display: 'flex', gap: 12 }}>
                  <Link href={`/detail/${String(r.id)}`} style={{ flex: 1 }}>
                    <button className="btn-primary" style={{ width: '100%' }}>
                      查看详情
                    </button>
                  </Link>
                  <Link href={`/detail/${String(r.id)}`}>
                    <button className="btn-secondary">
                      👍 点赞支持
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {status && !loading && (
          <div style={{ marginTop: 24, padding: 16, background: '#fee2e2', color: '#991b1b', borderRadius: 12, textAlign: 'center' }}>
            {status}
          </div>
        )}

        <div style={{ marginTop: 48, textAlign: 'center' }}>
          <Link href="/">
            <button className="btn-secondary">← 返回首页</button>
          </Link>
        </div>
      </main>
    </>
  );
}
