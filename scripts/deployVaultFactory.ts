import { ethers } from "hardhat";

async function main() {

  const vaultFactory__factory = await ethers.getContractFactory("ElastiVaultFactory");

  const vaultFactory = await vaultFactory__factory.deploy(
      "0x0000086e1910D5977302116fC27934DC0254266C",
      "0xCB70efa43300Cd9B7eF4ed2087ceA7f7f6f3c195"
  )

  console.log(
    `ElastiVaultFactory deployed to ${vaultFactory.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
