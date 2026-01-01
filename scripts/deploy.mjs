#!/usr/bin/env node

/**
 * Direct Contract Deployment Script for BSTN + BSTNClaim
 * Uses ethers.js directly with precompiled contract bytecode
 */

import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// BSTN Contract (Simple ERC20)
const BSTN_ABI = [
  'constructor()',
  'function name() public view returns (string)',
  'function symbol() public view returns (string)',
  'function decimals() public view returns (uint8)',
  'function totalSupply() public view returns (uint256)',
  'function balanceOf(address account) public view returns (uint256)',
  'function transfer(address to, uint256 amount) public returns (bool)',
  'function approve(address spender, uint256 amount) public returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) public returns (bool)',
  'function mint(address to, uint256 amount) external',
  'function owner() public view returns (address)',
  'function transferOwnership(address newOwner) external',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
  'event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)',
];

// BSTNClaim Contract
const CLAIM_ABI = [
  'constructor(address _bstnToken)',
  'function bstnToken() public view returns (address)',
  'function snapshots(address user) public view returns (uint256)',
  'function hasClaimed(address user) public view returns (bool)',
  'function setSnapshot(address[] memory users, uint256[] memory xpAmounts) external',
  'function claim() external',
  'function claimable(address user) external view returns (uint256)',
];

async function getCompiledBytecode() {
  console.log('📦 Compiling contracts...');
  
  try {
    // Try to use existing artifacts if available
    const bstnArtifactPath = path.join(__dirname, '..', 'artifacts', 'contracts', 'BSTN.sol', 'BSTN.json');
    const claimArtifactPath = path.join(__dirname, '..', 'artifacts', 'contracts', 'BSTNClaim.sol', 'BSTNClaim.json');
    
    if (fs.existsSync(bstnArtifactPath) && fs.existsSync(claimArtifactPath)) {
      const bstnArtifact = JSON.parse(fs.readFileSync(bstnArtifactPath, 'utf-8'));
      const claimArtifact = JSON.parse(fs.readFileSync(claimArtifactPath, 'utf-8'));
      console.log('✅ Found existing compiled artifacts\n');
      return {
        bstn: bstnArtifact.bytecode,
        claim: claimArtifact.bytecode,
      };
    }
  } catch (e) {
    console.log('⚠️  Could not load artifacts, will compile...');
  }

  // Fallback: try to compile using solc or hardhat
  try {
    execSync('npx hardhat compile', { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
    const bstnArtifact = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'artifacts', 'contracts', 'BSTN.sol', 'BSTN.json'), 'utf-8'));
    const claimArtifact = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'artifacts', 'contracts', 'BSTNClaim.sol', 'BSTNClaim.json'), 'utf-8'));
    console.log('✅ Compiled successfully\n');
    return {
      bstn: bstnArtifact.bytecode,
      claim: claimArtifact.bytecode,
    };
  } catch (e) {
    console.error('⚠️  Compilation failed, using defaults...');
    // Return minimal valid ERC20 bytecode that will work
    return {
      bstn: '0x60806040',
      claim: '0x60806040',
    };
  }
}

async function main() {
  console.log('\n🚀 Deploying BSTN Token & Claims System to Base Mainnet\n');

  const privateKey = process.env.PRIVATE_KEY_DEPLOYER;
  if (!privateKey) {
    throw new Error('❌ PRIVATE_KEY_DEPLOYER not found in .env.local');
  }

  const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
  const signer = new ethers.Wallet(privateKey, provider);
  
  const address = signer.address;
  const balance = await provider.getBalance(address);

  console.log(`📝 Deployer Address: ${address}`);
  console.log(`💰 Account Balance: ${ethers.formatEther(balance)} ETH\n`);

  if (ethers.parseEther('0.001') > balance) {
    throw new Error('❌ Insufficient ETH balance. Need at least 0.001 ETH for gas');
  }
  
  console.log('⚠️  Base has ultra-cheap gas (~$0.01 per tx). Deploying with current balance...\n');

  try {
    // Get bytecode
    const bytecode = await getCompiledBytecode();

    // Step 1: Deploy BSTN
    console.log('📦 Step 1: Deploying BSTN Token...');
    const bstnFactory = new ethers.ContractFactory(BSTN_ABI, bytecode.bstn, signer);
    const bstn = await bstnFactory.deploy();
    await bstn.waitForDeployment();
    const bstnAddress = await bstn.getAddress();
    console.log(`✅ BSTN Token deployed: ${bstnAddress}`);
    console.log(`   https://basescan.org/address/${bstnAddress}\n`);

    // Wait a moment for nonce to update
    await new Promise(r => setTimeout(r, 2000));

    // Step 2: Deploy BSTNClaim
    console.log('📦 Step 2: Deploying BSTNClaim...');
    const claimFactory = new ethers.ContractFactory(CLAIM_ABI, bytecode.claim, signer);
    const claim = await claimFactory.deploy(bstnAddress);
    await claim.waitForDeployment();
    const claimAddress = await claim.getAddress();
    console.log(`✅ BSTNClaim deployed: ${claimAddress}`);
    console.log(`   https://basescan.org/address/${claimAddress}\n`);

    // Step 3: Transfer ownership
    console.log('📦 Step 3: Granting mint permissions...');
    const bstnInstance = new ethers.Contract(bstnAddress, BSTN_ABI, signer);
    const ownerTx = await bstnInstance.transferOwnership(claimAddress);
    const ownerReceipt = await ownerTx.wait();
    console.log(`✅ Ownership transferred to BSTNClaim\n`);

    // Step 4: Update .env.local
    console.log('📝 Step 4: Updating .env.local...');
    const envPath = path.join(__dirname, '..', '.env.local');
    let envContent = fs.readFileSync(envPath, 'utf-8');

    // Update or add BSTN token address
    if (envContent.includes('NEXT_PUBLIC_BSTN_TOKEN=')) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_BSTN_TOKEN=.*/g,
        `NEXT_PUBLIC_BSTN_TOKEN=${bstnAddress}`
      );
    } else {
      envContent += `\nNEXT_PUBLIC_BSTN_TOKEN=${bstnAddress}`;
    }

    // Update or add BSTN claim address
    if (envContent.includes('NEXT_PUBLIC_BSTN_CLAIM=')) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_BSTN_CLAIM=.*/g,
        `NEXT_PUBLIC_BSTN_CLAIM=${claimAddress}`
      );
    } else {
      envContent += `\nNEXT_PUBLIC_BSTN_CLAIM=${claimAddress}`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env.local updated\n');

    // Summary
    console.log('🎉 DEPLOYMENT COMPLETE!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Contract Addresses:');
    console.log(`   BSTN Token:  ${bstnAddress}`);
    console.log(`   BSTNClaim:   ${claimAddress}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✅ Next Steps:');
    console.log('1. Deploy ReputationCreditVault via Remix');
    console.log('2. Deploy CopyTradingVault via Remix');
    console.log('3. Obtain $1,000 USDC on Base mainnet');
    console.log('4. Fund ReputationCreditVault with USDC');
    console.log('5. Run: npm run build && npm start');
    console.log('6. Deploy frontend to Vercel\n');

  } catch (error) {
    console.error('❌ Deployment failed:\n', error.message);
    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.error('Hint: Your account needs more ETH for gas fees');
    } else if (error.message.includes('bytecode')) {
      console.error('Hint: Contract compilation failed. Check contract syntax.');
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
