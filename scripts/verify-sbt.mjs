// Script to verify SBT contract deployment on Base mainnet
import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

const REP_CONTRACT = '0x6f0e6da952ac7e30688024cfac71a760b89495d5'

const client = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org'),
})

const REP_ABI = [
  {
    name: 'name',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }]
  },
  {
    name: 'symbol',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }]
  },
  {
    name: 'owner',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }]
  },
  {
    name: 'tokenIdCounter',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
]

async function verify() {
  console.log('🔍 Verifying ReputationSBT contract on Base Mainnet...\n')
  console.log(`Contract Address: ${REP_CONTRACT}`)
  console.log(`Explorer: https://basescan.org/address/${REP_CONTRACT}\n`)

  try {
    // Check if contract exists
    const code = await client.getBytecode({ address: REP_CONTRACT })
    
    if (!code || code === '0x') {
      console.log('❌ Contract NOT deployed at this address')
      console.log('\n📝 To deploy:')
      console.log('1. Go to https://remix.ethereum.org')
      console.log('2. Copy contracts/ReputationSBT.sol')
      console.log('3. Compile with Solidity 0.8.20')
      console.log('4. Deploy to Base Mainnet')
      console.log('5. Update NEXT_PUBLIC_REP_CONTRACT in .env.local')
      return false
    }

    console.log('✅ Contract bytecode found!\n')

    // Read contract info
    const [name, symbol, owner, tokenCount] = await Promise.all([
      client.readContract({ address: REP_CONTRACT, abi: REP_ABI, functionName: 'name' }),
      client.readContract({ address: REP_CONTRACT, abi: REP_ABI, functionName: 'symbol' }),
      client.readContract({ address: REP_CONTRACT, abi: REP_ABI, functionName: 'owner' }),
      client.readContract({ address: REP_CONTRACT, abi: REP_ABI, functionName: 'tokenIdCounter' }),
    ])

    console.log('📋 Contract Info:')
    console.log(`   Name: ${name}`)
    console.log(`   Symbol: ${symbol}`)
    console.log(`   Owner: ${owner}`)
    console.log(`   SBTs Minted: ${tokenCount}`)
    console.log('\n✅ ReputationSBT is LIVE on Base Mainnet!')
    
    return true
  } catch (error) {
    console.error('❌ Error verifying contract:', error.message)
    return false
  }
}

verify()
