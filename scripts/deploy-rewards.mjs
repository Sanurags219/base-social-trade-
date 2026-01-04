import { createWalletClient, createPublicClient, http, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base } from 'viem/chains'
import 'dotenv/config'

// BSTN Token ABI (minimal)
const BSTN_ABI = [
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }],
    outputs: []
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  }
]

// RewardsVault bytecode - compiled from RewardsVault.sol
const REWARDS_VAULT_BYTECODE = '0x' // Will be filled after compilation

const REWARDS_VAULT_ABI = [
  {
    type: 'constructor',
    inputs: [{ name: '_bstnToken', type: 'address' }],
    stateMutability: 'nonpayable'
  },
  {
    name: 'claimSwapReward',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'user', type: 'address' }, { name: 'txCount', type: 'uint256' }],
    outputs: []
  },
  {
    name: 'claimCopyTradeReward',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: []
  },
  {
    name: 'hasClaimedSwapReward',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'hasClaimedCopyReward',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'getUserXP',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: 'xp', type: 'uint256' },
      { name: 'trades', type: 'uint256' },
      { name: 'streak', type: 'uint256' },
      { name: 'level', type: 'uint256' },
      { name: 'nextLevelXP', type: 'uint256' }
    ]
  },
  {
    name: 'depositTokens',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: []
  },
  {
    name: 'getVaultBalance',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  }
]

async function main() {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY
  if (!privateKey) {
    console.error('Missing DEPLOYER_PRIVATE_KEY in .env')
    process.exit(1)
  }

  const account = privateKeyToAccount(privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`)
  
  const publicClient = createPublicClient({
    chain: base,
    transport: http()
  })

  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http()
  })

  console.log('Deployer address:', account.address)
  
  const balance = await publicClient.getBalance({ address: account.address })
  console.log('Balance:', (Number(balance) / 1e18).toFixed(4), 'ETH')

  // Check if we need to deploy BSTN first
  let bstnAddress = process.env.BSTN_TOKEN_ADDRESS
  
  if (!bstnAddress) {
    console.log('\n⚠️  No BSTN_TOKEN_ADDRESS in .env')
    console.log('Please deploy BSTN token first using: npm run deploy:bstn')
    console.log('Then add BSTN_TOKEN_ADDRESS to .env and run this script again')
    process.exit(1)
  }

  console.log('\n📜 BSTN Token:', bstnAddress)

  // For now, output instructions since we need to compile the contract
  console.log('\n🔧 To deploy RewardsVault:')
  console.log('1. Compile the contract with Hardhat:')
  console.log('   npx hardhat compile')
  console.log('\n2. Get the bytecode from artifacts/contracts/RewardsVault.sol/RewardsVault.json')
  console.log('\n3. Deploy using the compiled bytecode')
  
  console.log('\n📋 Contract Details:')
  console.log('- claimSwapReward(user, txCount): 200 XP + 50 BSTN for 5+ transactions')
  console.log('- claimCopyTradeReward(user): 100 XP + 10 BSTN for copy trading')
  console.log('- No fees - only Base gas')
  
  console.log('\n✅ After deployment:')
  console.log('1. Update XP_CONTRACT in app/events/page.tsx')
  console.log('2. Mint BSTN tokens to the RewardsVault')
  console.log('3. Deploy and push to Vercel')
}

main().catch(console.error)
