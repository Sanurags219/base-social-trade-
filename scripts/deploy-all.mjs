#!/usr/bin/env node
/**
 * Deploy ALL contracts to Base Mainnet
 */

import { createWalletClient, createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Config
const PRIVATE_KEY = process.env.PRIVATE_KEY_DEPLOYER || '0x6bb581423aa82df4a5f25b40d938b24ce746a32b58adaba0615c2f4462e5c1e2';
const OWNER_ADDRESS = '0x22E228AdE324185123A54Ad25F3459a99CF51E7a';
const RPC_URL = 'https://mainnet.base.org';

// Already deployed contracts
const DEPLOYED = {
  ReputationSBT: '0x6f0e6da952ac7e30688024cfac71a760b89495d5',
};

// Base Mainnet USDC
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

// Setup clients
const account = privateKeyToAccount(PRIVATE_KEY);
const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http(RPC_URL),
});

const publicClient = createPublicClient({
  chain: base,
  transport: http(RPC_URL),
});

console.log('🚀 Base Mainnet Contract Deployer');
console.log('==================================');
console.log(`Deployer: ${account.address}`);
console.log(`Owner: ${OWNER_ADDRESS}`);
console.log(`Network: Base Mainnet (${base.id})`);
console.log('');

/**
 * Get all OpenZeppelin sources needed
 */
function getOzSources(contractSource) {
  const ozBasePath = path.join(__dirname, '..', 'node_modules', '@openzeppelin', 'contracts');
  const sources = {};
  const processed = new Set();

  function processFile(importPath) {
    if (processed.has(importPath)) return;
    processed.add(importPath);

    let filePath;
    if (importPath.startsWith('@openzeppelin/contracts/')) {
      const relPath = importPath.replace('@openzeppelin/contracts/', '');
      filePath = path.join(ozBasePath, relPath);
    } else {
      return;
    }

    if (!fs.existsSync(filePath)) {
      console.warn(`Warning: ${filePath} not found`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    // Remove BOM
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }

    sources[importPath] = { content };

    // Find nested imports
    const importRegex = /import\s+(?:{[^}]+}\s+from\s+)?["']([^"']+)["']/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const nestedImport = match[1];
      if (nestedImport.startsWith('@openzeppelin')) {
        processFile(nestedImport);
      } else if (nestedImport.startsWith('./') || nestedImport.startsWith('../')) {
        // Resolve relative path
        const currentDir = path.dirname(importPath.replace('@openzeppelin/contracts/', ''));
        const resolved = path.normalize(path.join(currentDir, nestedImport)).replace(/\\/g, '/');
        const fullPath = `@openzeppelin/contracts/${resolved}`;
        processFile(fullPath);
      }
    }
  }

  // Find imports in contract source
  const importRegex = /import\s+(?:{[^}]+}\s+from\s+)?["']([^"']+)["']/g;
  let match;
  while ((match = importRegex.exec(contractSource)) !== null) {
    processFile(match[1]);
  }

  return sources;
}

/**
 * Run solc with input file (avoids stdin issues on Windows)
 */
function runSolc(input) {
  // Use a simple filename in the current working directory
  const projectRoot = path.join(__dirname, '..');
  const tempInputPath = path.join(projectRoot, 'solc-input.json');
  
  // Write input to temp file
  const jsonStr = JSON.stringify(input);
  fs.writeFileSync(tempInputPath, jsonStr, 'utf8');
  
  console.log(`  Written ${jsonStr.length} bytes to solc-input.json`);
  
  // Run solc using cmd /c with type pipe - use relative path
  const result = spawnSync(
    'cmd.exe',
    ['/c', 'type solc-input.json | npx solc --standard-json'],
    {
      encoding: 'utf8',
      maxBuffer: 50 * 1024 * 1024,
      cwd: projectRoot,
      windowsHide: true,
    }
  );
  
  // Clean up
  try { fs.unlinkSync(tempInputPath); } catch {}
  
  if (result.error) {
    console.error('Spawn error:', result.error);
    throw result.error;
  }
  
  // Find JSON in output
  let stdout = result.stdout || '';
  let stderr = result.stderr || '';
  
  console.log(`  Solc stdout length: ${stdout.length}, stderr length: ${stderr.length}`);
  
  if (stderr && !stderr.includes('SMT')) {
    console.error('Solc stderr:', stderr);
  }
  
  const jsonStart = stdout.indexOf('{');
  if (jsonStart === -1) {
    console.error('Solc stdout:', stdout.slice(0, 500));
    throw new Error('No JSON in solc output');
  }
  
  return JSON.parse(stdout.slice(jsonStart));
}

/**
 * Compile a Solidity contract using solc
 */
function compileContract(contractName, extraSources = {}) {
  const contractPath = path.join(__dirname, '..', 'contracts', `${contractName}.sol`);
  let source = fs.readFileSync(contractPath, 'utf8');
  
  // Remove BOM if present
  if (source.charCodeAt(0) === 0xFEFF) {
    source = source.slice(1);
  }

  // Get all OZ sources
  const ozSources = getOzSources(source);

  const sources = {
    [`${contractName}.sol`]: { content: source },
    ...ozSources,
    ...extraSources,
  };

  const input = {
    language: 'Solidity',
    sources,
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode.object']
        }
      }
    }
  };

  console.log(`Compiling ${contractName}...`);
  
  const output = runSolc(input);

  if (output.errors) {
    const errors = output.errors.filter(e => e.severity === 'error');
    if (errors.length > 0) {
      console.error('Compilation errors:');
      errors.forEach(e => console.error(e.formattedMessage));
      throw new Error('Compilation failed');
    }
  }

  const contract = output.contracts[`${contractName}.sol`][contractName];
  if (!contract) {
    console.error('Available contracts:', Object.keys(output.contracts || {}));
    throw new Error(`Contract ${contractName} not found in output`);
  }
  
  return {
    abi: contract.abi,
    bytecode: '0x' + contract.evm.bytecode.object,
  };
}

/**
 * Deploy a contract
 */
async function deployContract(name, abi, bytecode, args = []) {
  console.log(`\n📦 Deploying ${name}...`);
  
  const hash = await walletClient.deployContract({
    abi,
    bytecode,
    args,
  });

  console.log(`   Tx: ${hash}`);
  
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log(`   ✅ Deployed at: ${receipt.contractAddress}`);
  console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
  
  return receipt.contractAddress;
}

/**
 * Transfer ownership of a contract
 */
async function transferOwnership(name, address, abi, newOwner) {
  console.log(`   Transferring ownership to ${newOwner}...`);
  
  const hash = await walletClient.writeContract({
    address,
    abi,
    functionName: 'transferOwnership',
    args: [newOwner],
  });
  
  await publicClient.waitForTransactionReceipt({ hash });
  console.log(`   ✅ Ownership transferred`);
}

async function main() {
  const deployedContracts = { ...DEPLOYED };

  // Check balance
  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`Balance: ${(Number(balance) / 1e18).toFixed(4)} ETH\n`);

  if (Number(balance) < 0.001e18) {
    console.error('❌ Insufficient balance! Need at least 0.001 ETH');
    process.exit(1);
  }

  // 1. BSTN Token
  console.log('\n=== 1. BSTN Token ===');
  const bstn = compileContract('BSTN');
  const bstnAddress = await deployContract('BSTN', bstn.abi, bstn.bytecode, []);
  deployedContracts.BSTN = bstnAddress;
  await transferOwnership('BSTN', bstnAddress, bstn.abi, OWNER_ADDRESS);

  // 2. BSTNClaim (needs BSTN address)
  console.log('\n=== 2. BSTNClaim ===');
  const claim = compileContract('BSTNClaim');
  const claimAddress = await deployContract('BSTNClaim', claim.abi, claim.bytecode, [bstnAddress]);
  deployedContracts.BSTNClaim = claimAddress;

  // 3. ReputationCreditVault (needs USDC and ReputationSBT)
  console.log('\n=== 3. ReputationCreditVault ===');
  const credit = compileContract('ReputationCreditVault');
  const creditAddress = await deployContract('ReputationCreditVault', credit.abi, credit.bytecode, [
    USDC_ADDRESS,
    DEPLOYED.ReputationSBT
  ]);
  deployedContracts.ReputationCreditVault = creditAddress;

  // 4. CopyVaultFactory
  console.log('\n=== 4. CopyVaultFactory ===');
  
  // Read CopyTradingVault source
  const copyVaultPath = path.join(__dirname, '..', 'contracts', 'CopyTradingVault.sol');
  let copyVaultSource = fs.readFileSync(copyVaultPath, 'utf8');
  if (copyVaultSource.charCodeAt(0) === 0xFEFF) {
    copyVaultSource = copyVaultSource.slice(1);
  }

  // Create factory contract
  const factorySource = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CopyTradingVault.sol";

contract CopyVaultFactory {
    address public admin;
    mapping(address => address[]) public userVaults;
    address[] public allVaults;
    
    event VaultCreated(address indexed owner, address indexed trader, address vault);
    
    constructor() {
        admin = msg.sender;
    }
    
    function createVault(address trader, uint256 copyPercent) external returns (address) {
        CopyTradingVault vault = new CopyTradingVault(
            msg.sender,
            trader,
            admin,
            copyPercent
        );
        
        address vaultAddress = address(vault);
        userVaults[msg.sender].push(vaultAddress);
        allVaults.push(vaultAddress);
        
        emit VaultCreated(msg.sender, trader, vaultAddress);
        return vaultAddress;
    }
    
    function getUserVaults(address user) external view returns (address[] memory) {
        return userVaults[user];
    }
    
    function getVaultCount() external view returns (uint256) {
        return allVaults.length;
    }
    
    function setAdmin(address newAdmin) external {
        require(msg.sender == admin, "Not admin");
        admin = newAdmin;
    }
}`;

  // Write factory contract
  const factoryPath = path.join(__dirname, '..', 'contracts', 'CopyVaultFactory.sol');
  fs.writeFileSync(factoryPath, factorySource);

  // Compile factory with CopyTradingVault
  const factoryInput = {
    language: 'Solidity',
    sources: {
      'CopyVaultFactory.sol': { content: factorySource },
      'CopyTradingVault.sol': { content: copyVaultSource },
    },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode.object']
        }
      }
    }
  };

  console.log('Compiling CopyVaultFactory...');
  const factoryOutput = runSolc(factoryInput);
  
  if (factoryOutput.errors) {
    const errors = factoryOutput.errors.filter(e => e.severity === 'error');
    if (errors.length > 0) {
      errors.forEach(e => console.error(e.formattedMessage));
      throw new Error('Factory compilation failed');
    }
  }

  const factory = factoryOutput.contracts['CopyVaultFactory.sol']['CopyVaultFactory'];
  const factoryAddress = await deployContract(
    'CopyVaultFactory',
    factory.abi,
    '0x' + factory.evm.bytecode.object,
    []
  );
  deployedContracts.CopyVaultFactory = factoryAddress;

  // Update factory admin
  console.log(`   Setting admin to ${OWNER_ADDRESS}...`);
  const setAdminHash = await walletClient.writeContract({
    address: factoryAddress,
    abi: factory.abi,
    functionName: 'setAdmin',
    args: [OWNER_ADDRESS],
  });
  await publicClient.waitForTransactionReceipt({ hash: setAdminHash });
  console.log(`   ✅ Admin set`);

  // Summary
  console.log('\n');
  console.log('='.repeat(60));
  console.log('🎉 ALL CONTRACTS DEPLOYED SUCCESSFULLY!');
  console.log('='.repeat(60));
  console.log('\nContract Addresses:');
  console.log('-------------------');
  Object.entries(deployedContracts).forEach(([name, addr]) => {
    console.log(`${name}: ${addr}`);
  });

  // Generate .env update
  console.log('\n\n📝 Update your .env.local with:');
  console.log('--------------------------------');
  console.log(`NEXT_PUBLIC_REP_CONTRACT=${deployedContracts.ReputationSBT}`);
  console.log(`NEXT_PUBLIC_CREDIT_CONTRACT=${deployedContracts.ReputationCreditVault}`);
  console.log(`NEXT_PUBLIC_COPY_VAULT_CONTRACT=${deployedContracts.CopyVaultFactory}`);
  console.log(`NEXT_PUBLIC_BSTN_TOKEN=${deployedContracts.BSTN}`);
  console.log(`NEXT_PUBLIC_BSTN_CLAIM=${deployedContracts.BSTNClaim}`);

  // Write addresses to file
  const addressesPath = path.join(__dirname, '..', 'deployed-addresses.json');
  fs.writeFileSync(addressesPath, JSON.stringify(deployedContracts, null, 2));
  console.log(`\n✅ Addresses saved to deployed-addresses.json`);

  return deployedContracts;
}

main().catch(console.error);
