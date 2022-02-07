import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const WagmiContract = await ethers.getContractFactory("WagmiContract");
  const wagmiContract = await WagmiContract.deploy();
  await wagmiContract.deployed();
  console.log("WagmiContract deployed to:", wagmiContract.address);
  fs.writeFileSync(
    path.join(__dirname, "../../react-app/src/abi/wagmi.json"),
    wagmiContract.interface.format("json") as string
  );

  const SampleToken = await ethers.getContractFactory("SampleToken");
  const sampleToken = await SampleToken.deploy();
  await sampleToken.deployed();
  console.log("SampleToken deployed to:", sampleToken.address);
  fs.writeFileSync(
    path.join(__dirname, "../../react-app/src/abi/SampleToken.json"),
    sampleToken.interface.format("json") as string
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
