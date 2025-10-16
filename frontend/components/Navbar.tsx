"use client";

import Link from "next/link";
import { useEvm } from "../hooks/useEvm";

export default function Navbar() {
  const { accounts, connect, chainId } = useEvm();

  return (
    <nav style={{
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(229, 231, 235, 0.5)',
      padding: '16px 0',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <span style={{ fontSize: 32 }}>🛡️</span>
          <span style={{ fontSize: 24, fontWeight: 700, color: '#1e40af' }}>ChildGuard</span>
        </Link>
        
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none', color: '#4b5563', fontWeight: 600 }}>首页</Link>
          <Link href="/submit" style={{ textDecoration: 'none', color: '#4b5563', fontWeight: 600 }}>提交行动</Link>
          <Link href="/wall" style={{ textDecoration: 'none', color: '#4b5563', fontWeight: 600 }}>行动墙</Link>
          <Link href="/leaderboard" style={{ textDecoration: 'none', color: '#4b5563', fontWeight: 600 }}>排行榜</Link>
          <Link href="/profile" style={{ textDecoration: 'none', color: '#4b5563', fontWeight: 600 }}>个人中心</Link>
          
          {accounts.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="badge badge-region">{chainId === 11155111 ? 'Sepolia' : `Chain ${chainId}`}</span>
              <span style={{ padding: '8px 16px', background: '#dbeafe', borderRadius: 12, fontSize: 14, fontWeight: 600, color: '#1e40af' }}>
                {accounts[0].slice(0, 6)}...{accounts[0].slice(-4)}
              </span>
            </div>
          ) : (
            <button onClick={connect} className="btn-primary" style={{ fontSize: 14 }}>
              连接钱包
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

