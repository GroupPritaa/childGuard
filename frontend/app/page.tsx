"use client";

import Link from "next/link";
import Navbar from "../components/Navbar";
import { useEvm } from "../hooks/useEvm";
import { useFhevm } from "../fhevm/useFhevm";

export default function HomePage() {
  const { chainId, provider } = useEvm();
  const { instance, status: fhevmStatus, error: fhevmError } = useFhevm({
    provider,
    chainId,
    initialMockChains: undefined
  });

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ fontSize: 80, marginBottom: 24 }}>🛡️</div>
          <h1 style={{ fontSize: 48, fontWeight: 700, color: '#1e40af', marginBottom: 16, lineHeight: 1.2 }}>
            守护每个孩子的安全足迹
          </h1>
          <p style={{ fontSize: 20, color: '#6b7280', marginBottom: 32, maxWidth: 600, margin: '0 auto 32px' }}>
            基于区块链的儿童保护行动上链存证平台<br/>
            真实、可验证、不可篡改
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Link href="/submit">
              <button className="btn-primary" style={{ fontSize: 18, padding: '16px 32px' }}>
                📝 提交行动
              </button>
            </Link>
            <Link href="/wall">
              <button className="btn-secondary" style={{ fontSize: 18, padding: '16px 32px' }}>
                🏛️ 查看行动墙
              </button>
            </Link>
            <Link href="/leaderboard">
              <button className="btn-secondary" style={{ fontSize: 18, padding: '16px 32px' }}>
                🏆 排行榜
              </button>
            </Link>
            <Link href="/profile">
              <button className="btn-secondary" style={{ fontSize: 18, padding: '16px 32px' }}>
                👤 个人中心
              </button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 64 }}>
          <div className="card" style={{ padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💾</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1e40af', marginBottom: 12 }}>事件上链存证</h3>
            <p style={{ color: '#6b7280', lineHeight: 1.6 }}>链上不可篡改的儿童保护行动记录</p>
          </div>
          <div className="card" style={{ padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1e40af', marginBottom: 12 }}>隐私保护</h3>
            <p style={{ color: '#6b7280', lineHeight: 1.6 }}>使用 FHE 加密技术保护敏感信息</p>
          </div>
          <div className="card" style={{ padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🤝</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1e40af', marginBottom: 12 }}>社区共建</h3>
            <p style={{ color: '#6b7280', lineHeight: 1.6 }}>公众可查看、点赞支持行动</p>
          </div>
          <div className="card" style={{ padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1e40af', marginBottom: 12 }}>可信记录</h3>
            <p style={{ color: '#6b7280', lineHeight: 1.6 }}>便于社会组织验证事件真实性</p>
          </div>
        </div>

        {/* FHEVM Status */}
        <div className="card" style={{ padding: 32, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1e40af', marginBottom: 8 }}>
                🔐 FHEVM 实例状态
              </h3>
              <p style={{ fontSize: 14, color: '#6b7280' }}>
                全同态加密虚拟机连接状态
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              {fhevmStatus === 'idle' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#9ca3af' }}></div>
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#6b7280' }}>空闲</span>
                </div>
              )}
              {fhevmStatus === 'loading' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fbbf24', animation: 'pulse 2s infinite' }}></div>
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#f59e0b' }}>加载中...</span>
                </div>
              )}
              {fhevmStatus === 'ready' && instance && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }}></div>
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#059669' }}>已连接 ✓</span>
                </div>
              )}
              {fhevmStatus === 'error' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }}></div>
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#dc2626' }}>连接失败</span>
                </div>
              )}
            </div>
          </div>
          {fhevmError && (
            <div style={{ marginTop: 16, padding: 12, background: '#fee2e2', borderRadius: 8, fontSize: 14, color: '#991b1b' }}>
              错误: {fhevmError.message}
            </div>
          )}
          {fhevmStatus === 'ready' && instance && (
            <div style={{ marginTop: 16, padding: 12, background: '#d1fae5', borderRadius: 8, fontSize: 14, color: '#065f46' }}>
              ✅ Relayer SDK 已就绪，可以进行加密操作
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="card" style={{ padding: 48, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: 42, fontWeight: 700, marginBottom: 8 }}>-</div>
              <div style={{ fontSize: 16, opacity: 0.9 }}>总行动数</div>
            </div>
            <div>
              <div style={{ fontSize: 42, fontWeight: 700, marginBottom: 8 }}>
                {chainId === 11155111 ? 'Sepolia' : chainId ? `Chain ${chainId}` : '-'}
              </div>
              <div style={{ fontSize: 16, opacity: 0.9 }}>当前网络</div>
            </div>
            <div>
              <div style={{ fontSize: 42, fontWeight: 700, marginBottom: 8 }}>
                {fhevmStatus === 'ready' ? '✓' : fhevmStatus === 'loading' ? '...' : '✗'}
              </div>
              <div style={{ fontSize: 16, opacity: 0.9 }}>FHE 状态</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 64, padding: 32, color: '#9ca3af' }}>
          <p>合约地址: 0x149F2822Fa38B898F737072122a5E7ad897db11F</p>
          <p style={{ marginTop: 8 }}>网络: {chainId === 11155111 ? 'Sepolia Testnet' : `Chain ID ${chainId || '-'}`}</p>
        </div>
      </main>
    </>
  );
}
