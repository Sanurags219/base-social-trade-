const hre = require("hardhat");

async function main() {
  const BaselineEvent = await hre.ethers.getContractFactory("BaselineEvent");
  const contract = await BaselineEvent.deploy();
  await contract.deployed();
  console.log("BaselineEvent deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
