import hre from "hardhat";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("🚀 Deploying ReputationCreditVault to Base Mainnet...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`📝 Deployer: ${deployer.address}\n`);

  // Contract addresses
  const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // Base Mainnet USDC
  const REP_CONTRACT = process.env.NEXT_PUBLIC_REP_CONTRACT;

  if (!REP_CONTRACT) {
    throw new Error("❌ NEXT_PUBLIC_REP_CONTRACT not set in .env.local");
  }

  console.log(`✅ Constructor Args:`);
  console.log(`   USDC: ${USDC_ADDRESS}`);
  console.log(`   ReputationSBT: ${REP_CONTRACT}\n`);

  // Get contract factory
  const ReputationCreditVault = await hre.ethers.getContractFactory("ReputationCreditVault");

  // Deploy contract
  console.log("⏳ Deploying contract...");
  const creditVault = await ReputationCreditVault.deploy(USDC_ADDRESS, REP_CONTRACT);
  await creditVault.waitForDeployment();

  const deployedAddress = await creditVault.getAddress();
  console.log(`✅ ReputationCreditVault deployed to: ${deployedAddress}\n`);

  // Display next steps
  console.log("📋 NEXT STEPS:");
  console.log(`\n1. Add this to .env.local:\n`);
  console.log(`   NEXT_PUBLIC_CREDIT_CONTRACT=${deployedAddress}`);
  console.log(`\n2. Rebuild frontend:\n`);
  console.log(`   npm run build\n`);
  console.log(`3. Test locally:\n`);
  console.log(`   npm start\n`);
  console.log(`4. Verify on Basescan:\n`);
  console.log(`   https://basescan.org/address/${deployedAddress}\n`);

  // Try to save to .env.local automatically
  try {
    const envLocalPath = path.join(__dirname, "../.env.local");

    let envContent = fs.readFileSync(envLocalPath, "utf-8");
    
    // Update or add NEXT_PUBLIC_CREDIT_CONTRACT
    if (envContent.includes("NEXT_PUBLIC_CREDIT_CONTRACT=")) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_CREDIT_CONTRACT=.*/,
        `NEXT_PUBLIC_CREDIT_CONTRACT=${deployedAddress}`
      );
    } else {
      envContent += `\nNEXT_PUBLIC_CREDIT_CONTRACT=${deployedAddress}`;
    }

    fs.writeFileSync(envLocalPath, envContent);
    console.log("✅ .env.local updated automatically!\n");
  } catch (error) {
    console.log("⚠️  Could not auto-update .env.local. Please add manually.\n");
  }
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
