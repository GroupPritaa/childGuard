"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useEvm } from "../../../hooks/useEvm";
import { useFhevm } from "../../../fhevm/useFhevm";
import { ChildGuardAddresses } from "../../../abi/ChildGuardAddresses";
import { useChildGuard, ChildGuardRecord } from "../../../hooks/useChildGuard";
import Navbar from "../../../components/Navbar";

export default function DetailPage() {
  const params = useParams();
  const id = useMemo(() => BigInt(params?.id as string), [params]);
  const { provider, chainId, accounts, connect } = useEvm();
  const { instance } = useFhevm({ provider, chainId, initialMockChains: undefined });
  const address = chainId ? ChildGuardAddresses[chainId] : undefined;
  const cg = useChildGuard({ instance, eip1193Provider: provider!, chainId, contractAddress: address });
  const [record, setRecord] = useState<ChildGuardRecord | null>(null);
  const [support, setSupport] = useState<number | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [decrypting, setDecrypting] = useState(false);
  const [alreadySupported, setAlreadySupported] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      if (!address) return;
      try {
        setStatus("加载详情...");
        const list = await cg.getActions(id - 1n, 1n);
        if (list.length > 0) {
          setRecord(list[0]);
        }
        setStatus("");
        setLoading(false);
      } catch (e: any) {
        setStatus("加载失败: " + e.message);
        setLoading(false);
      }
    })();
  }, [address, id]);

  const onSupport = async () => {
    if (!accounts.length) {
      await connect();
      return;
    }
    try {
      // 预检测是否已经点赞
      const hs = await cg.hasSupported(id);
      setAlreadySupported(hs);
      if (hs) {
        setStatus("您已支持过该行动");
        setTimeout(() => setStatus(""), 1500);
        return;
      }
      setStatus("正在点赞...");
      await cg.supportAction(id, 1);
      setStatus("点赞成功！正在刷新解密数...");
      if (record) {
        const v = await cg.decryptSupportCount(record);
        setSupport(v);
      }
      setStatus("点赞成功 ✅");
      setTimeout(() => setStatus(""), 2000);
    } catch (e: any) {
      setStatus("失败: " + e.message);
    }
  };

  const onDecrypt = async () => {
    if (!record) return;
    if (!accounts.length) {
      await connect();
      return;
    }
    try {
      setDecrypting(true);
      setStatus("正在解密支持数...");
      const v = await cg.decryptSupportCount(record);
      setSupport(v);
      setStatus("解密成功 ✅");
      setDecrypting(false);
      setTimeout(() => setStatus(""), 2000);
    } catch (e: any) {
      setStatus("解密失败: " + e.message);
      setDecrypting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 64 }}>⏳</div>
          <p style={{ marginTop: 16, color: '#6b7280' }}>加载中...</p>
        </main>
      </>
    );
  }

  if (!record) {
    return (
      <>
        <Navbar />
        <main style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 64 }}>❌</div>
          <h2 style={{ marginTop: 16, color: '#6b7280' }}>记录不存在</h2>
          <Link href="/wall">
            <button className="btn-primary" style={{ marginTop: 24 }}>返回行动墙</button>
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🛡️</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1e40af', marginBottom: 8 }}>行动详情</h1>
          <p style={{ fontSize: 16, color: '#9ca3af' }}>ID: {String(record.id)}</p>
        </div>

        <div className="card" style={{ padding: 40, marginBottom: 24 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1f2937', marginBottom: 24 }}>
            {record.title}
          </h2>

          <div style={{ display: 'grid', gap: 20, marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>📍</span>
              <div>
                <div style={{ fontSize: 14, color: '#9ca3af', marginBottom: 4 }}>地区</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#374151' }}>{record.region}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>📅</span>
              <div>
                <div style={{ fontSize: 14, color: '#9ca3af', marginBottom: 4 }}>日期</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#374151' }}>{record.date}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>👤</span>
              <div>
                <div style={{ fontSize: 14, color: '#9ca3af', marginBottom: 4 }}>提交者</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#374151', fontFamily: 'monospace' }}>
                  {record.submitter}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>⏰</span>
              <div>
                <div style={{ fontSize: 14, color: '#9ca3af', marginBottom: 4 }}>提交时间</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#374151' }}>
                  {new Date(Number(record.timestamp) * 1000).toLocaleString('zh-CN')}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>🔐</span>
              <div>
                <div style={{ fontSize: 14, color: '#9ca3af', marginBottom: 4 }}>描述哈希 (IPFS CID)</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {record.descriptionHash}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>❤️</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: '#9ca3af', marginBottom: 4 }}>支持数 (FHE 加密)</div>
                {support !== null ? (
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#be185d' }}>{support}</div>
                ) : (
                  <div style={{ fontSize: 16, color: '#9ca3af' }}>点击下方按钮解密查看</div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <button
              onClick={onSupport}
              className="btn-primary"
              style={{ fontSize: 16, padding: '14px', opacity: alreadySupported ? 0.6 : 1, cursor: alreadySupported ? 'not-allowed' : 'pointer' }}
              disabled={alreadySupported}
            >
              {alreadySupported ? '✅ 已支持' : '👍 点赞支持'}
            </button>
            <button
              onClick={onDecrypt}
              className="btn-secondary"
              disabled={decrypting}
              style={{
                fontSize: 16,
                padding: '14px',
                opacity: decrypting ? 0.6 : 1,
                cursor: decrypting ? 'not-allowed' : 'pointer'
              }}
            >
              {decrypting ? '⏳ 解密中...' : '🔓 解密支持数'}
            </button>
          </div>

          {status && (
            <div
              style={{
                marginTop: 20,
                padding: 16,
                borderRadius: 12,
                background: status.includes('成功') ? '#d1fae5' : '#fee2e2',
                color: status.includes('成功') ? '#065f46' : '#991b1b',
                textAlign: 'center',
                fontWeight: 600
              }}
            >
              {status}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 24, background: '#f9fafb' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#374151', marginBottom: 12 }}>💡 关于 FHE 加密</h3>
          <p style={{ color: '#6b7280', lineHeight: 1.6, marginBottom: 8 }}>
            支持计数使用全同态加密（FHE）技术存储在链上，只有授权用户才能解密查看真实数值。
          </p>
          <p style={{ color: '#6b7280', lineHeight: 1.6 }}>
            点赞时会将加密的增量（通常为 1）通过 Relayer SDK 加密后提交到合约，合约在密文状态下执行加法运算。
          </p>
        </div>

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <Link href="/wall">
            <button className="btn-secondary">← 返回行动墙</button>
          </Link>
        </div>
      </main>
    </>
  );
}
