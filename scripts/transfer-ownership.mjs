// Transfer ownership of all contracts to new owner
import { createWalletClient, createPublicClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base } from 'viem/chains'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const PRIVATE_KEY = process.env.PRIVATE_KEY_DEPLOYER
const NEW_OWNER = '0x22E228AdE324185123A54Ad25F3459a99CF51E7a'

const CONTRACTS = {
  ReputationSBT: '0x6f0e6da952ac7e30688024cfac71a760b89495d5',
  ReputationCreditVault: '0xE0ae4de04B9Fa02e4a187601B7CF502CF55A0a2a',
  CopyVaultFactory: '0x71a89FDa4e2101855a35394a713Fe54e9a17c77c',
  BSTNToken: '0x52B11d41a013CdcFEF71231aF61D7b8DDCf757F2',
  BSTNClaim: '0xC822EFcF4DD0f84FF7718266F79A65DEbE418538',
}

const OWNABLE_ABI = [
  {
    name: 'owner',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }]
  },
  {
    name: 'transferOwnership',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'newOwner', type: 'address' }],
    outputs: []
  }
]

async function main() {
  if (!PRIVATE_KEY) {
    console.error('❌ PRIVATE_KEY_DEPLOYER not found')
    process.exit(1)
  }

  const account = privateKeyToAccount(PRIVATE_KEY)
  console.log('🔑 Current deployer:', account.address)
  console.log('👤 New owner:', NEW_OWNER)
  console.log('')

  const publicClient = createPublicClient({
    chain: base,
    transport: http('https://mainnet.base.org'),
  })

  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http('https://mainnet.base.org'),
  })

  for (const [name, address] of Object.entries(CONTRACTS)) {
    console.log(`\n📋 ${name}: ${address}`)
    
    try {
      // Check if contract exists
      const code = await publicClient.getBytecode({ address })
      if (!code || code === '0x') {
        console.log('   ⚠️  Contract not deployed, skipping')
        continue
      }

      // Check current owner
      let currentOwner
      try {
        currentOwner = await publicClient.readContract({
          address,
          abi: OWNABLE_ABI,
          functionName: 'owner',
        })
        console.log('   Current owner:', currentOwner)
      } catch (e) {
        console.log('   ⚠️  No owner() function, skipping')
        continue
      }

      // Check if already owned by target
      if (currentOwner.toLowerCase() === NEW_OWNER.toLowerCase()) {
        console.log('   ✅ Already owned by target')
        continue
      }

      // Check if we can transfer (we must be current owner)
      if (currentOwner.toLowerCase() !== account.address.toLowerCase()) {
        console.log('   ❌ Not owned by deployer, cannot transfer')
        continue
      }

      // Transfer ownership
      console.log('   📤 Transferring ownership...')
      const hash = await walletClient.writeContract({
        address,
        abi: OWNABLE_ABI,
        functionName: 'transferOwnership',
        args: [NEW_OWNER],
      })

      console.log('   TX:', hash)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log('   ✅ Ownership transferred!')

    } catch (error) {
      console.log('   ❌ Error:', error.message)
    }
  }

  console.log('\n✅ Done!')
}

main().catch(console.error)
