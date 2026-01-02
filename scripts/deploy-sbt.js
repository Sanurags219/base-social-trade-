// Deploy ReputationSBT to Base Mainnet
import hre from "hardhat";

async function main() {
  console.log("🚀 Deploying ReputationSBT to Base Mainnet...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH\n");

  if (balance < hre.ethers.parseEther("0.001")) {
    console.error("❌ Insufficient balance. Need at least 0.001 ETH");
    process.exit(1);
  }

  // Deploy ReputationSBT
  console.log("📦 Deploying ReputationSBT...");
  const ReputationSBT = await hre.ethers.getContractFactory("ReputationSBT");
  const sbt = await ReputationSBT.deploy();
  await sbt.waitForDeployment();

  const sbtAddress = await sbt.getAddress();
  console.log("✅ ReputationSBT deployed to:", sbtAddress);
  console.log("   Explorer: https://basescan.org/address/" + sbtAddress);

  // Verify deployment
  const name = await sbt.name();
  const symbol = await sbt.symbol();
  const owner = await sbt.owner();
  
  console.log("\n📋 Contract Info:");
  console.log("   Name:", name);
  console.log("   Symbol:", symbol);
  console.log("   Owner:", owner);

  console.log("\n📝 Update .env.local:");
  console.log(`NEXT_PUBLIC_REP_CONTRACT=${sbtAddress}`);
  
  console.log("\n📝 Update Vercel:");
  console.log(`npx vercel env rm NEXT_PUBLIC_REP_CONTRACT production -y`);
  console.log(`echo "${sbtAddress}" | npx vercel env add NEXT_PUBLIC_REP_CONTRACT production`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
