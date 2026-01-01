import hre from "hardhat";
import { ethers } from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log('\n🚀 Deploying BSTN Token & Claims System...\n');

  const [signer] = await ethers.getSigners();
  const signerAddress = signer.address;
  const balance = await ethers.provider.getBalance(signerAddress);

  console.log(`📝 Deployer: ${signerAddress}`);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH\n`);

  if (ethers.parseEther('0.01') > balance) {
    throw new Error('Not enough ETH for gas. Need at least 0.01 ETH');
  }

  // Step 1: Deploy BSTN Token
  console.log('📦 Step 1: Deploying BSTN Token...');
  const BSTN = await ethers.getContractFactory('BSTN');
  const bstn = await BSTN.deploy();
  await bstn.waitForDeployment();
  const bstnAddress = await bstn.getAddress();
  console.log(`✅ BSTN deployed to: ${bstnAddress}\n`);

  // Step 2: Deploy BSTNClaim
  console.log('📦 Step 2: Deploying BSTNClaim...');
  const BSTNClaim = await ethers.getContractFactory('BSTNClaim');
  const claim = await BSTNClaim.deploy(bstnAddress);
  await claim.waitForDeployment();
  const claimAddress = await claim.getAddress();
  console.log(`✅ BSTNClaim deployed to: ${claimAddress}\n`);

  // Step 3: Grant minting permissions
  console.log('📦 Step 3: Granting mint permissions to BSTNClaim...');
  const tx = await bstn.transferOwnership(claimAddress);
  await tx.wait();
  console.log(`✅ BSTNClaim can now mint BSTN\n`);

  // Step 4: Update .env.local
  console.log('📝 Step 4: Updating .env.local...');
  const envPath = path.join(__dirname, '..', '.env.local');
  let envContent = fs.readFileSync(envPath, 'utf-8');

  if (envContent.includes('NEXT_PUBLIC_BSTN_TOKEN=')) {
    envContent = envContent.replace(/NEXT_PUBLIC_BSTN_TOKEN=.*/, `NEXT_PUBLIC_BSTN_TOKEN=${bstnAddress}`);
  } else {
    envContent += `\nNEXT_PUBLIC_BSTN_TOKEN=${bstnAddress}`;
  }

  if (envContent.includes('NEXT_PUBLIC_BSTN_CLAIM=')) {
    envContent = envContent.replace(/NEXT_PUBLIC_BSTN_CLAIM=.*/, `NEXT_PUBLIC_BSTN_CLAIM=${claimAddress}`);
  } else {
    envContent += `\nNEXT_PUBLIC_BSTN_CLAIM=${claimAddress}`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local updated\n');

  console.log('🎉 DEPLOYMENT COMPLETE\n');
  console.log('📋 Contract Addresses:');
  console.log(`   BSTN Token:  ${bstnAddress}`);
  console.log(`   BSTNClaim:   ${claimAddress}\n`);
  console.log('Next steps:');
  console.log('1. Deploy ReputationCreditVault via Remix');
  console.log('2. Deploy CopyTradingVault via Remix');
  console.log('3. Fund vault with $1,000 USDC');
  console.log('4. npm run build && npm start\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
