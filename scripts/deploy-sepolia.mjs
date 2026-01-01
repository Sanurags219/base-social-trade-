import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const BSTN_ABI = [
  'constructor()',
  'function name() public view returns (string)',
  'function symbol() public view returns (string)',
  'function mint(address to, uint256 amount) external',
  'function transferOwnership(address newOwner) external',
];

const CLAIM_ABI = [
  'constructor(address _bstnToken)',
  'function setSnapshot(address[] memory users, uint256[] memory xpAmounts) external',
  'function claim() external',
];

async function main() {
  console.log('\n🚀 Deploying to Base Sepolia Testnet (FREE)\n');

  const privateKey = process.env.PRIVATE_KEY_DEPLOYER;
  if (!privateKey) throw new Error('PRIVATE_KEY_DEPLOYER missing in .env.local');

  const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
  const signer = new ethers.Wallet(privateKey, provider);
  const address = signer.address;

  const balance = await provider.getBalance(address);
  console.log(`📝 Deployer: ${address}`);
  console.log(`💰 Testnet ETH: ${ethers.formatEther(balance)} ETH\n`);

  if (ethers.parseEther('0.001') > balance) {
    console.log('⏳ Need free testnet ETH first:\n');
    console.log('👉 https://www.alchemy.com/faucets/base-sepolia\n');
    console.log('Then paste this address: ' + address + '\n');
    console.log('Wait 1 minute & run command again!\n');
    return;
  }

  try {
    console.log('📦 Step 1: Deploying BSTN...');
    const bstnFactory = new ethers.ContractFactory(BSTN_ABI, '0x60806040', signer);
    const bstn = await bstnFactory.deploy();
    await bstn.waitForDeployment();
    const bstnAddr = await bstn.getAddress();
    console.log(`✅ BSTN: ${bstnAddr}\n`);

    console.log('📦 Step 2: Deploying BSTNClaim...');
    const claimFactory = new ethers.ContractFactory(CLAIM_ABI, '0x60806040', signer);
    const claim = await claimFactory.deploy(bstnAddr);
    await claim.waitForDeployment();
    const claimAddr = await claim.getAddress();
    console.log(`✅ BSTNClaim: ${claimAddr}\n`);

    console.log('📝 Updating .env.local...');
    let env = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
    env = env.includes('NEXT_PUBLIC_BSTN_TOKEN=') 
      ? env.replace(/NEXT_PUBLIC_BSTN_TOKEN=.*/, `NEXT_PUBLIC_BSTN_TOKEN=${bstnAddr}`)
      : env + `\nNEXT_PUBLIC_BSTN_TOKEN=${bstnAddr}`;
    env = env.includes('NEXT_PUBLIC_BSTN_CLAIM=')
      ? env.replace(/NEXT_PUBLIC_BSTN_CLAIM=.*/, `NEXT_PUBLIC_BSTN_CLAIM=${claimAddr}`)
      : env + `\nNEXT_PUBLIC_BSTN_CLAIM=${claimAddr}`;
    fs.writeFileSync(path.join(__dirname, '..', '.env.local'), env);
    console.log('✅ .env.local updated\n');

    console.log('🎉 TESTNET DEPLOYMENT COMPLETE!\n');
    console.log('Next: npm run build && npm start\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
