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
const REP_CONTRACT = env.NEXT_PUBLIC_REP_CONTRACT;
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // Base USDC

if (!PRIVATE_KEY) throw new Error('PRIVATE_KEY_DEPLOYER not set');
if (!REP_CONTRACT) throw new Error('NEXT_PUBLIC_REP_CONTRACT not set');

// Contract source
const contractSource = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IReputation {
    function reputation(address user) external view returns (uint256 score, uint256);
}

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract ReputationCreditVault {
    IERC20 public usdc;
    IReputation public rep;
    address public admin;

    struct Loan {
        uint256 amount;
        uint256 borrowedAt;
        uint256 dueAt;
        bool repaid;
        bool defaulted;
    }

    mapping(address => Loan) public loans;
    uint256 public totalLoaned;
    uint256 public totalRepaid;

    event LoanCreated(address indexed borrower, uint256 amount, uint256 dueAt);
    event LoanRepaid(address indexed borrower, uint256 amount);
    event LoanDefaulted(address indexed borrower, uint256 amount);

    constructor(address _usdc, address _rep) {
        usdc = IERC20(_usdc);
        rep = IReputation(_rep);
        admin = msg.sender;
    }

    function creditLimit(address user) public view returns (uint256) {
        (uint256 score, ) = rep.reputation(user);
        if (score >= 850) return 5_000e6;
        if (score >= 650) return 1_500e6;
        if (score >= 400) return 300e6;
        return 0;
    }

    function creditTier(address user) public view returns (string memory) {
        (uint256 score, ) = rep.reputation(user);
        if (score >= 850) return "Elite";
        if (score >= 650) return "Trusted";
        if (score >= 400) return "Regular";
        return "New";
    }

    function borrow(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(usdc.balanceOf(address(this)) >= amount, "Insufficient vault balance");
        Loan storage loan = loans[msg.sender];
        require(loan.amount == 0 || loan.repaid || loan.defaulted, "Active loan exists");
        uint256 limit = creditLimit(msg.sender);
        require(limit > 0, "No credit available");
        require(amount <= limit, "Exceeds credit limit");
        uint256 dueAt = block.timestamp + 14 days;
        loans[msg.sender] = Loan({ amount: amount, borrowedAt: block.timestamp, dueAt: dueAt, repaid: false, defaulted: false });
        totalLoaned += amount;
        require(usdc.transfer(msg.sender, amount), "Transfer failed");
        emit LoanCreated(msg.sender, amount, dueAt);
    }

    function repay() external {
        Loan storage loan = loans[msg.sender];
        require(loan.amount > 0, "No active loan");
        require(!loan.repaid && !loan.defaulted, "Loan already settled");
        require(usdc.transferFrom(msg.sender, address(this), loan.amount), "Transfer failed");
        loan.repaid = true;
        totalRepaid += loan.amount;
        emit LoanRepaid(msg.sender, loan.amount);
    }

    function markDefaulted(address borrower) external {
        require(msg.sender == admin, "Admin only");
        Loan storage loan = loans[borrower];
        require(loan.amount > 0, "No active loan");
        require(!loan.repaid && !loan.defaulted, "Loan already settled");
        require(block.timestamp > loan.dueAt, "Loan not yet due");
        loan.defaulted = true;
        emit LoanDefaulted(borrower, loan.amount);
    }

    function getLoan(address user) external view returns (uint256 amount, uint256 borrowedAt, uint256 dueAt, bool repaid, bool defaulted, bool isOverdue) {
        Loan storage loan = loans[user];
        return (loan.amount, loan.borrowedAt, loan.dueAt, loan.repaid, loan.defaulted, block.timestamp > loan.dueAt && !loan.repaid && !loan.defaulted);
    }

    function deposit(uint256 amount) external {
        require(msg.sender == admin, "Admin only");
        require(usdc.transferFrom(msg.sender, address(this), amount), "Transfer failed");
    }

    function withdraw(uint256 amount) external {
        require(msg.sender == admin, "Admin only");
        require(usdc.transfer(msg.sender, amount), "Transfer failed");
    }
}
`;

async function main() {
  console.log('\n🚀 Deploying ReputationCreditVault to Base Mainnet...\n');

  // Compile
  console.log('📦 Compiling contract...');
  const input = {
    language: 'Solidity',
    sources: { 'ReputationCreditVault.sol': { content: contractSource } },
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

  const contract = output.contracts['ReputationCreditVault.sol']['ReputationCreditVault'];
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
  console.log('⏳ Deploying contract...');
  console.log(`   USDC: ${USDC_ADDRESS}`);
  console.log(`   ReputationSBT: ${REP_CONTRACT}\n`);

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const deployed = await factory.deploy(USDC_ADDRESS, REP_CONTRACT);
  
  console.log(`📝 Tx hash: ${deployed.deploymentTransaction().hash}`);
  console.log('⏳ Waiting for confirmation...');
  
  await deployed.waitForDeployment();
  const address = await deployed.getAddress();

  console.log(`\n✅ ReputationCreditVault deployed to: ${address}\n`);

  // Update .env.local
  let newEnv = envContent;
  if (newEnv.includes('NEXT_PUBLIC_CREDIT_CONTRACT=')) {
    newEnv = newEnv.replace(/NEXT_PUBLIC_CREDIT_CONTRACT=.*/, `NEXT_PUBLIC_CREDIT_CONTRACT=${address}`);
  } else {
    newEnv += `\nNEXT_PUBLIC_CREDIT_CONTRACT=${address}`;
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
