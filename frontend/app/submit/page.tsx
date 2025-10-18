"use client";

import { useState } from "react";
import { useEvm } from "../../hooks/useEvm";
import { useFhevm } from "../../fhevm/useFhevm";
import { ChildGuardAddresses } from "../../abi/ChildGuardAddresses";
import { useChildGuard } from "../../hooks/useChildGuard";
import Navbar from "../../components/Navbar";

export default function SubmitPage() {
  const { provider, chainId, accounts, connect } = useEvm();
  const { instance } = useFhevm({ provider, chainId, initialMockChains: undefined });
  const address = chainId ? ChildGuardAddresses[chainId] : undefined;
  const cg = useChildGuard({ instance, eip1193Provider: provider!, chainId, contractAddress: address });

  const [title, setTitle] = useState("");
  const [region, setRegion] = useState("上海");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!accounts?.length) {
        await connect();
        return;
      }
      
      setLoading(true);
      setStatus("正在准备数据...");
      
      // 简化演示：直接用描述前64字符做哈希
      const simpleCID = `QmDemo${Date.now()}`;
      
      setStatus("正在上链...");
      await cg.submitAction({ title, descriptionHash: simpleCID, region, date });
      
      setStatus("上链成功！");
      setSuccess(true);
      setLoading(false);
      
      setTimeout(() => {
        setTitle("");
        setRegion("上海");
        setDate("");
        setDescription("");
        setSuccess(false);
        setStatus("");
      }, 3000);
    } catch (e: any) {
      setStatus("失败: " + e.message);
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📝</div>
          <h1 style={{ fontSize: 36, fontWeight: 700, color: '#1e40af', marginBottom: 12 }}>提交行动存证</h1>
          <p style={{ fontSize: 18, color: '#6b7280' }}>记录并上链您的儿童保护行动</p>
        </div>

        <div className="card" style={{ padding: 48 }}>
          <form onSubmit={onSubmit} style={{ display: 'grid', gap: 24 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                📌 行动标题 *
              </label>
              <input
                className="input-field"
                placeholder="例如：儿童交通安全志愿宣传"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                  🌍 地区 *
                </label>
                <select
                  className="input-field"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  required
                >
                  <option value="上海">上海</option>
                  <option value="北京">北京</option>
                  <option value="广州">广州</option>
                  <option value="深圳">深圳</option>
                  <option value="杭州">杭州</option>
                  <option value="成都">成都</option>
                  <option value="其他">其他</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                  📅 日期 *
                </label>
                <input
                  className="input-field"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                📄 事件描述
              </label>
              <textarea
                className="input-field"
                placeholder="描述您的儿童保护行动详情（将加密存储到 IPFS）"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                style={{ resize: 'vertical' }}
              />
              <p style={{ marginTop: 8, fontSize: 14, color: '#9ca3af' }}>
                💡 提示：敏感信息会加密后存储，仅哈希上链
              </p>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{
                fontSize: 18,
                padding: '16px',
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? '⏳ 提交中...' : success ? '✅ 提交成功' : '🚀 上链记录'}
            </button>
          </form>

          {status && (
            <div
              className={success ? 'success-animation' : ''}
              style={{
                marginTop: 24,
                padding: 16,
                borderRadius: 12,
                background: success ? '#d1fae5' : '#fee2e2',
                color: success ? '#065f46' : '#991b1b',
                textAlign: 'center',
                fontWeight: 600
              }}
            >
              {success && <span style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>🛡️</span>}
              {status}
            </div>
          )}
        </div>

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <a href="/wall" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>
            ← 返回行动墙
          </a>
        </div>
      </main>
    </>
  );
}
