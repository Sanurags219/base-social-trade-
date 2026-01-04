// Mint additional BSTN tokens for foundation, airdrop, liquidity
import { createWalletClient, createPublicClient, http, parseEther, formatEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base } from 'viem/chains'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Use PRIVATE_KEY_ADMIN (owner key) if available, otherwise PRIVATE_KEY_DEPLOYER
const PRIVATE_KEY = process.env.PRIVATE_KEY_ADMIN || process.env.PRIVATE_KEY_OWNER || process.env.PRIVATE_KEY_DEPLOYER
const OWNER_ADDRESS = '0x22E228AdE324185123A54Ad25F3459a99CF51E7a'
const BSTN_TOKEN = '0xa6cd42c89fec11a1fd78c2f23d000db25b3f2f4c'

const BSTN_ABI = [
  { name: 'mint', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [] },
  { name: 'totalSupply', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'owner', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
]

async function main() {
  if (!PRIVATE_KEY) {
    console.error('❌ PRIVATE_KEY_DEPLOYER not found')
    process.exit(1)
  }

  const account = privateKeyToAccount(PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : `0x${PRIVATE_KEY}`)

  const publicClient = createPublicClient({
    chain: base,
    transport: http('https://mainnet.base.org'),
  })

  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http('https://mainnet.base.org'),
  })

  console.log('═'.repeat(60))
  console.log('🪙  MINTING BSTN TOKENS - 100M TOTAL SUPPLY')
  console.log('═'.repeat(60))
  console.log('\nBSTN Token:', BSTN_TOKEN)
  console.log('Minter:', account.address)

  // Check current supply
  const currentSupply = await publicClient.readContract({
    address: BSTN_TOKEN,
    abi: BSTN_ABI,
    functionName: 'totalSupply'
  })

  console.log('\nCurrent Supply:', formatEther(currentSupply), 'BSTN')

  // Target: 100,000,000 BSTN
  const targetSupply = parseEther('100000000')
  const toMint = targetSupply - currentSupply

  if (toMint <= 0n) {
    console.log('✅ Already at or above 100M supply')
    return
  }

  console.log('To Mint:', formatEther(toMint), 'BSTN')
  console.log('Target:', '100,000,000 BSTN')

  // Distribution plan:
  // - RewardsVault: 1M (already done)
  // - Foundation: 40M
  // - Airdrop: 20M  
  // - Liquidity: 20M
  // - Team/Reserve: 19M
  
  // All to owner address for now (owner can distribute later)
  console.log('\n📜 Minting', formatEther(toMint), 'BSTN to owner...')
  
  try {
    const hash = await walletClient.writeContract({
      address: BSTN_TOKEN,
      abi: BSTN_ABI,
      functionName: 'mint',
      args: [OWNER_ADDRESS, toMint]
    })
    
    console.log('TX:', hash)
    await publicClient.waitForTransactionReceipt({ hash })
    console.log('✅ Minted successfully!')

    // Verify new supply
    const newSupply = await publicClient.readContract({
      address: BSTN_TOKEN,
      abi: BSTN_ABI,
      functionName: 'totalSupply'
    })

    const ownerBalance = await publicClient.readContract({
      address: BSTN_TOKEN,
      abi: BSTN_ABI,
      functionName: 'balanceOf',
      args: [OWNER_ADDRESS]
    })

    console.log('\n' + '═'.repeat(60))
    console.log('📋 FINAL DISTRIBUTION')
    console.log('═'.repeat(60))
    console.log('\nTotal Supply:', formatEther(newSupply), 'BSTN')
    console.log('Owner Balance:', formatEther(ownerBalance), 'BSTN')
    console.log('\n✅ Owner can now distribute to:')
    console.log('   - Foundation wallet')
    console.log('   - Airdrop contract')
    console.log('   - DEX liquidity pools')
    console.log('   - Team vesting')
    console.log('═'.repeat(60))

  } catch (e) {
    console.error('❌ Mint failed:', e.message)
  }
}

main().catch(console.error)
