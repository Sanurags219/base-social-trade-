// Deploy XPTracker, TraderRegistry, EventRegistry contracts
import { createWalletClient, createPublicClient, http, parseAbi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Existing deployed contracts
const DEPLOYED = {
  ReputationSBT: '0x6f0e6da952ac7e30688024cfac71a760b89495d5',
  BSTN: '0x4a3213e1f9d0372f359ce11d11960218e2e04340',
};

// Load private key
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
  console.error('❌ PRIVATE_KEY environment variable required');
  process.exit(1);
}

const account = privateKeyToAccount(PRIVATE_KEY);

const publicClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org'),
});

const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http('https://mainnet.base.org'),
});

function compileContract(contractName) {
  console.log(`📦 Compiling ${contractName}...`);
  
  const contractPath = path.join(__dirname, '..', 'contracts', `${contractName}.sol`);
  let source = fs.readFileSync(contractPath, 'utf8');
  
  // Remove BOM
  if (source.charCodeAt(0) === 0xFEFF) {
    source = source.slice(1);
  }
  
  const input = {
    language: 'Solidity',
    sources: {
      [`${contractName}.sol`]: { content: source },
    },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: {
        '*': { '*': ['abi', 'evm.bytecode.object'] },
      },
    },
  };
  
  // Write to temp file
  fs.writeFileSync('solc-input.json', JSON.stringify(input, null, 2));
  
  // Compile
  const result = execSync('solc --standard-json < solc-input.json', {
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024,
  });
  
  const output = JSON.parse(result);
  
  if (output.errors) {
    const errors = output.errors.filter(e => e.severity === 'error');
    if (errors.length > 0) {
      console.error('Compilation errors:', errors);
      throw new Error('Compilation failed');
    }
  }
  
  const contract = output.contracts[`${contractName}.sol`][contractName];
  return {
    abi: contract.abi,
    bytecode: `0x${contract.evm.bytecode.object}`,
  };
}

async function deployContract(name, abi, bytecode, args = []) {
  console.log(`🚀 Deploying ${name}...`);
  
  const hash = await walletClient.deployContract({
    abi,
    bytecode,
    args,
  });
  
  console.log(`   Tx: ${hash}`);
  
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const address = receipt.contractAddress;
  
  console.log(`   ✅ ${name} deployed at: ${address}`);
  return address;
}

async function main() {
  console.log('\n🔧 Deploying On-Chain Contracts to Base Mainnet\n');
  console.log(`   Deployer: ${account.address}\n`);
  
  const deployedContracts = { ...DEPLOYED };
  
  // 1. XPTracker
  console.log('\n=== 1. XPTracker ===');
  try {
    const xp = compileContract('XPTracker');
    const xpAddress = await deployContract('XPTracker', xp.abi, xp.bytecode);
    deployedContracts.XPTracker = xpAddress;
  } catch (e) {
    console.error('XPTracker deployment failed:', e.message);
  }
  
  // 2. TraderRegistry
  console.log('\n=== 2. TraderRegistry ===');
  try {
    const trader = compileContract('TraderRegistry');
    const traderAddress = await deployContract('TraderRegistry', trader.abi, trader.bytecode);
    deployedContracts.TraderRegistry = traderAddress;
  } catch (e) {
    console.error('TraderRegistry deployment failed:', e.message);
  }
  
  // 3. EventRegistry (needs ReputationSBT address)
  console.log('\n=== 3. EventRegistry ===');
  try {
    const event = compileContract('EventRegistry');
    const eventAddress = await deployContract('EventRegistry', event.abi, event.bytecode, [
      DEPLOYED.ReputationSBT
    ]);
    deployedContracts.EventRegistry = eventAddress;
  } catch (e) {
    console.error('EventRegistry deployment failed:', e.message);
  }
  
  // Summary
  console.log('\n\n========================================');
  console.log('🎉 DEPLOYMENT COMPLETE');
  console.log('========================================\n');
  
  console.log('Deployed Contracts:');
  for (const [name, addr] of Object.entries(deployedContracts)) {
    console.log(`   ${name}: ${addr}`);
  }
  
  console.log('\n📝 Add to .env.local:');
  console.log('----------------------------------------');
  console.log(`NEXT_PUBLIC_XP_CONTRACT=${deployedContracts.XPTracker || ''}`);
  console.log(`NEXT_PUBLIC_TRADER_CONTRACT=${deployedContracts.TraderRegistry || ''}`);
  console.log(`NEXT_PUBLIC_EVENT_CONTRACT=${deployedContracts.EventRegistry || ''}`);
  console.log('----------------------------------------\n');
  
  // Save to file
  fs.writeFileSync(
    path.join(__dirname, '..', 'deployed-onchain.json'),
    JSON.stringify(deployedContracts, null, 2)
  );
  console.log('✅ Addresses saved to deployed-onchain.json');
}

main().catch(console.error);
