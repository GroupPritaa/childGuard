"use client";

import { useCallback, useMemo } from "react";
import { ethers } from "ethers";
import { ChildGuardABI } from "../abi/ChildGuardABI";

export type ChildGuardRecord = {
  id: bigint;
  submitter: string;
  title: string;
  descriptionHash: string;
  region: string;
  date: string;
  timestamp: bigint;
  supportCountEnc: string; // bytes32 handle
};

export function useChildGuard(params: {
  instance: any | undefined;
  eip1193Provider: ethers.Eip1193Provider | string | undefined;
  chainId: number | undefined;
  contractAddress?: string; // 外部可注入 Sepolia 地址
}) {
  const { instance, eip1193Provider, contractAddress } = params;

  const signer = useMemo(() => {
    if (!eip1193Provider || typeof eip1193Provider === "string") return undefined;
    const p = new ethers.BrowserProvider(eip1193Provider);
    return p;
  }, [eip1193Provider]);

  const contract = useMemo(() => {
    if (!contractAddress) return undefined;
    if (!signer) return undefined;
    return new ethers.Contract(contractAddress, ChildGuardABI, signer);
  }, [signer, contractAddress]);

  const submitAction = useCallback(async (args: {
    title: string; descriptionHash: string; region: string; date: string;
  }) => {
    if (!contract) throw new Error("contract not ready");
    const s = await signer!.getSigner();
    const tx = await contract.connect(s).submitAction(args.title, args.descriptionHash, args.region, args.date);
    return await tx.wait();
  }, [contract, signer]);

  const supportAction = useCallback(async (recordId: bigint, inc: number = 1) => {
    if (!contract) throw new Error("contract not ready");
    if (!instance) throw new Error("fhevm instance not ready");
    const s = await signer!.getSigner();
    // 预检查：避免二次点赞导致估算失败
    let already = false;
    try {
      already = await contract.supported(recordId, await s.getAddress());
    } catch {
      // 如果 ABI 版本或合约版本不一致导致方法不存在，忽略预检查
      already = false;
    }
    if (already) {
      throw new Error("Already supported");
    }

    // 使用实例创建加密输入（与模板一致思路）
    const encrypted = await instance
      .createEncryptedInput(contract.target as string, await s.getAddress())
      .add32(inc)
      .encrypt();

    const tx = await contract.connect(s).supportAction(recordId, encrypted.handles[0], encrypted.inputProof);
    return await tx.wait();
  }, [contract, instance, signer]);

  const hasSupported = useCallback(async (recordId: bigint): Promise<boolean> => {
    if (!contract) return false;
    const s = await signer!.getSigner();
    try {
      return await contract.supported(recordId, await s.getAddress());
    } catch {
      return false;
    }
  }, [contract, signer]);

  const getActions = useCallback(async (offset: bigint, limit: bigint): Promise<ChildGuardRecord[]> => {
    if (!contract) throw new Error("contract not ready");
    const page = await contract.getActions(offset, limit);
    return page.map((r: any) => ({
      id: r.id,
      submitter: r.submitter,
      title: r.title,
      descriptionHash: r.descriptionHash,
      region: r.region,
      date: r.date,
      timestamp: r.timestamp,
      supportCountEnc: r.supportCountEnc,
    }));
  }, [contract]);

  const decryptSupportCount = useCallback(async (record: ChildGuardRecord): Promise<number> => {
    if (!instance) throw new Error("fhevm instance not ready");
    if (!contract) throw new Error("contract not ready");
    const s = await signer!.getSigner();

    // 生成解密签名并调用 userDecrypt（与模板保持一致）
    const publicParams = instance.generateKeypair();
    const startTimestamp = Math.floor(Date.now() / 1000);
    const durationDays = 365;
    const contractAddr = contract.target as string;

    const eip712 = instance.createEIP712(
      publicParams.publicKey,
      [contractAddr],
      startTimestamp,
      durationDays
    );

    const signature = await s.signTypedData(
      eip712.domain,
      { UserDecryptRequestVerification: (eip712 as any).types.UserDecryptRequestVerification },
      eip712.message
    );

    const result = await instance.userDecrypt(
      [{ handle: record.supportCountEnc, contractAddress: contractAddr }],
      publicParams.privateKey,
      publicParams.publicKey,
      signature,
      [contractAddr],
      await s.getAddress(),
      startTimestamp,
      durationDays
    );

    const clear = result[record.supportCountEnc];
    return Number(clear);
  }, [instance, signer, contract]);

  return { submitAction, supportAction, getActions, decryptSupportCount, hasSupported };
}


