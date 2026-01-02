import { ethers } from 'ethers';
import solc from 'solc';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load env
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && !key.startsWith('#')) env[key.trim()] = val.join('=').trim();
});

const PRIVATE_KEY = env.PRIVATE_KEY_DEPLOYER;
const ADMIN_ADDRESS = env.NEXT_PUBLIC_ADMIN_ADDRESS;

if (!PRIVATE_KEY) throw new Error('PRIVATE_KEY_DEPLOYER not set');
if (!ADMIN_ADDRESS) throw new Error('NEXT_PUBLIC_ADMIN_ADDRESS not set');

// CopyTradingVault Factory - deploys individual vaults
const contractSource = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract CopyTradingVault {
    address public owner;
    address public trader;
    address public admin;
    uint256 public copyPercent;
    uint256 public totalDeposited;
    uint256 public totalExecuted;
    bool public active;

    event Deposit(address indexed token, uint256 amount, uint256 timestamp);
    event Trade(address indexed token, uint256 amount, uint256 timestamp);
    event Withdrawal(address indexed token, uint256 amount, uint256 timestamp);
    event SettingsUpdated(uint256 newCopyPercent, uint256 timestamp);
    event Deactivated(uint256 timestamp);

    constructor(address _owner, address _trader, address _admin, uint256 _copyPercent) {
        require(_owner != address(0), "Invalid owner");
        require(_trader != address(0), "Invalid trader");
        require(_admin != address(0), "Invalid admin");
        require(_copyPercent >= 5 && _copyPercent <= 50, "Copy percent 5-50");
        owner = _owner;
        trader = _trader;
        admin = _admin;
        copyPercent = _copyPercent;
        active = true;
    }

    modifier onlyOwner() { require(msg.sender == owner, "Not owner"); _; }
    modifier onlyAdmin() { require(msg.sender == admin, "Not admin"); _; }
    modifier isActive() { require(active, "Vault not active"); _; }

    function deposit(address token, uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be > 0");
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        totalDeposited += amount;
        emit Deposit(token, amount, block.timestamp);
    }

    function executeTrade(address token, address to, uint256 amount) external onlyAdmin isActive {
        require(amount > 0, "Amount must be > 0");
        uint256 bal = IERC20(token).balanceOf(address(this));
        require(amount <= bal, "Insufficient balance");
        require(IERC20(token).transfer(to, amount), "Transfer failed");
        totalExecuted += amount;
        emit Trade(token, amount, block.timestamp);
    }

    function withdraw(address token, uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be > 0");
        require(IERC20(token).balanceOf(address(this)) >= amount, "Insufficient balance");
        require(IERC20(token).transfer(owner, amount), "Transfer failed");
        emit Withdrawal(token, amount, block.timestamp);
    }

    function updateCopyPercent(uint256 newPercent) external onlyOwner {
        require(newPercent >= 5 && newPercent <= 50, "Copy percent 5-50");
        copyPercent = newPercent;
        emit SettingsUpdated(newPercent, block.timestamp);
    }

    function deactivate() external onlyOwner {
        active = false;
        emit Deactivated(block.timestamp);
    }

    function balance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    function getStatus() external view returns (address, address, uint256, uint256, uint256, bool) {
        return (owner, trader, copyPercent, totalDeposited, totalExecuted, active);
    }
}

contract CopyVaultFactory {
    address public admin;
    mapping(address => address[]) public userVaults;
    address[] public allVaults;

    event VaultCreated(address indexed owner, address indexed trader, address vault, uint256 copyPercent);

    constructor(address _admin) {
        admin = _admin;
    }

    function createVault(address trader, uint256 copyPercent) external returns (address) {
        CopyTradingVault vault = new CopyTradingVault(msg.sender, trader, admin, copyPercent);
        address vaultAddr = address(vault);
        userVaults[msg.sender].push(vaultAddr);
        allVaults.push(vaultAddr);
        emit VaultCreated(msg.sender, trader, vaultAddr, copyPercent);
        return vaultAddr;
    }

    function getUserVaults(address user) external view returns (address[] memory) {
        return userVaults[user];
    }

    function totalVaults() external view returns (uint256) {
        return allVaults.length;
    }
}
`;

async function main() {
  console.log('\n🚀 Deploying CopyVaultFactory to Base Mainnet...\n');

  // Compile
  console.log('📦 Compiling contract...');
  const input = {
    language: 'Solidity',
    sources: { 'CopyVaultFactory.sol': { content: contractSource } },
    settings: { outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } }, optimizer: { enabled: true, runs: 200 } }
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  
  if (output.errors) {
    const errors = output.errors.filter(e => e.severity === 'error');
    if (errors.length > 0) {
      console.error('Compilation errors:', errors);
      process.exit(1);
    }
  }

  const contract = output.contracts['CopyVaultFactory.sol']['CopyVaultFactory'];
  const abi = contract.abi;
  const bytecode = contract.evm.bytecode.object;

  console.log('✅ Compiled successfully\n');

  // Connect
  const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  const balance = await provider.getBalance(wallet.address);
  console.log(`🔑 Deployer: ${wallet.address}`);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH\n`);

  // Deploy
  console.log('⏳ Deploying CopyVaultFactory...');
  console.log(`   Admin: ${ADMIN_ADDRESS}\n`);

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const deployed = await factory.deploy(ADMIN_ADDRESS);
  
  console.log(`📝 Tx hash: ${deployed.deploymentTransaction().hash}`);
  console.log('⏳ Waiting for confirmation...');
  
  await deployed.waitForDeployment();
  const address = await deployed.getAddress();

  console.log(`\n✅ CopyVaultFactory deployed to: ${address}\n`);

  // Update .env.local
  let newEnv = envContent;
  if (newEnv.includes('NEXT_PUBLIC_COPY_VAULT_CONTRACT=')) {
    newEnv = newEnv.replace(/NEXT_PUBLIC_COPY_VAULT_CONTRACT=.*/, `NEXT_PUBLIC_COPY_VAULT_CONTRACT=${address}`);
  } else {
    newEnv += `\nNEXT_PUBLIC_COPY_VAULT_CONTRACT=${address}`;
  }
  fs.writeFileSync(envPath, newEnv);
  console.log('✅ .env.local updated\n');

  console.log('🎉 DEPLOYMENT COMPLETE');
  console.log(`\nVerify on Basescan: https://basescan.org/address/${address}`);
}

main().catch(err => {
  console.error('❌ Deployment failed:', err.message);
  process.exit(1);
});
