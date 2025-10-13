import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();

  const badge = await deployments.get("GuardBadge");
  const child = await deployments.get("ChildGuard");

  const signer = await ethers.getSigner(deployer);
  const childContract = await ethers.getContractAt("ChildGuard", child.address, signer);
  const badgeContract = await ethers.getContractAt("GuardBadge", badge.address, signer);

  const cur = await childContract.badgeContract();
  if (cur.toLowerCase() === badge.address.toLowerCase()) {
    console.log(`ChildGuard.badgeContract already set to ${cur}`);
  } else {
    const tx = await childContract.setBadgeContract(badge.address);
    console.log(`Setting badgeContract... tx:${tx.hash}`);
    await tx.wait();
    console.log(`ChildGuard.badgeContract set to ${badge.address}`);
  }

  // ensure GuardBadge owner is ChildGuard so it can mint on claim
  try {
    const owner = await badgeContract.owner();
    if (owner.toLowerCase() !== child.address.toLowerCase()) {
      const tx2 = await badgeContract.transferOwnership(child.address);
      console.log(`Transferring GuardBadge ownership to ChildGuard... tx:${tx2.hash}`);
      await tx2.wait();
      console.log(`GuardBadge owner set to ${child.address}`);
    } else {
      console.log(`GuardBadge owner already ${owner}`);
    }
  } catch (e) {
    console.log('Ownership check/transfer skipped:', e);
  }
};

export default func;
func.id = "wire_badge_childguard";
func.tags = ["WireBadge"];

