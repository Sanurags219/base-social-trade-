#!/usr/bin/env node

import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function deploy() {
  console.log("🚀 Deploying ReputationCreditVault to Base Mainnet...\n");

  // Get private key
  const privateKey = process.env.PRIVATE_KEY_DEPLOYER;
  if (!privateKey) {
    throw new Error("❌ PRIVATE_KEY_DEPLOYER not set in .env.local");
  }

  // Get ReputationSBT address
  const repContract = process.env.NEXT_PUBLIC_REP_CONTRACT;
  if (!repContract) {
    throw new Error("❌ NEXT_PUBLIC_REP_CONTRACT not set in .env.local");
  }

  // Contract addresses
  const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // Base Mainnet USDC
  const RPC_URL = "https://mainnet.base.org";

  // Setup provider and signer
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(privateKey, provider);

  console.log(`📝 Deployer: ${signer.address}`);
  console.log(`📝 Balance: ${ethers.formatEther(await provider.getBalance(signer.address))} ETH\n`);

  // Read contract ABI and bytecode
  const contractPath = path.join(__dirname, "../contracts/ReputationCreditVault.sol");
  const contractCode = fs.readFileSync(contractPath, "utf-8");

  // Contract bytecode (compiled)
  const CONTRACT_ABI = [
    {
      inputs: [{ name: "_usdc", type: "address" }, { name: "_rep", type: "address" }],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, name: "borrower", type: "address" },
        { indexed: false, name: "amount", type: "uint256" },
        { indexed: false, name: "dueAt", type: "uint256" },
      ],
      name: "LoanCreated",
      type: "event",
    },
  ];

  console.log(`✅ Constructor Args:`);
  console.log(`   USDC: ${USDC_ADDRESS}`);
  console.log(`   ReputationSBT: ${repContract}\n`);

  console.log("⏳ This requires contract compilation...");
  console.log("⚠️  Please use Remix IDE instead:\n");
  console.log("📖 Guide: DEPLOY_REMIX_NOW.md");
  console.log("🔗 https://remix.ethereum.org\n");

  process.exit(0);
}

deploy().catch((error) => {
  console.error("❌ Error:", error.message);
  process.exitCode = 1;
});
