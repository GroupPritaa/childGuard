import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, log } = hre.deployments;

  const badge = await deploy("GuardBadge", { from: deployer, log: true, args: ["https://example.com/metadata/{id}.json"] });
  log(`GuardBadge deployed at ${badge.address}`);

  const d = await deploy("ChildGuard", { from: deployer, log: true });
  log(`ChildGuard deployed at ${d.address}`);

  // optional wire (no abi call here to keep deploy simple if no owner)
};

export default func;
func.id = "deploy_childguard";
func.tags = ["ChildGuard"];


