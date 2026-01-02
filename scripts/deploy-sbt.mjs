// Deploy ReputationSBT to Base Mainnet
import { createWalletClient, createPublicClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base } from 'viem/chains'

// Contract bytecode and ABI (compiled from ReputationSBT.sol)
const REPUTATION_SBT_BYTECODE = '0x608060405234801561001057600080fd5b506040518060400160405280601181526020017f4f6e636861696e20526570757461746f6e0000000000000000000000000000008152506040518060400160405280600381526020017f52455000000000000000000000000000000000000000000000000000000000008152508160009081610091919061035e565b5080600190816100a1919061035e565b5050506100c36100b56100c860201b60201c565b6100d060201b60201c565b610430565b600033905090565b6000600760009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905081600760006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0teleefefe2f9b19dd27897de5d6a87d6d0b0ea8355660405160405180910390a35050565b600081519050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b6000600282049050600182168061021157607f821691505b602082108103610224576102236101ca565b5b50919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b60006008830261028c7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8261024f565b610296868361024f565b95508019841693508086168417925050509392505050565b6000819050919050565b6000819050919050565b60006102dd6102d86102d3846102ae565b6102b8565b6102ae565b9050919050565b6000819050919050565b6102f7836102c2565b61030b610303826102e4565b84845461025c565b825550505050565b600090565b610320610313565b61032b8184846102ee565b505050565b5b8181101561034f57610344600082610318565b600181019050610331565b5050565b601f8211156103945761036581610224565b61036e8461023f565b8101602085101561037d578190505b6103916103898561023f565b830182610330565b50505b505050565b600082821c905092915050565b60006103b760001984600802610399565b1980831691505092915050565b60006103d083836103a6565b9150826002028217905092915050565b6103e98261019a565b67ffffffffffffffff811115610402576104016101a5565b5b61040c82546101f9565b610417828285610353565b600060209050601f83116001811461044a5760008415610438578287015190505b61044285826103c4565b8655506104aa565b601f19841661045886610224565b60005b828110156104805784890151825560018201915060208501945060208101905061045b565b8683101561049d5784890151610499601f8916826103a6565b8355505b6001600288020188555050505b505050505050565b611a4e806104416000396000f3fe'

const REPUTATION_SBT_ABI = [
  { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
  { inputs: [{ internalType: 'address', name: 'user', type: 'address' }], name: 'getReputation', outputs: [{ internalType: 'uint256', name: 'score', type: 'uint256' }, { internalType: 'uint256', name: 'lastUpdated', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ internalType: 'address', name: 'user', type: 'address' }], name: 'hasSBTFor', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ internalType: 'address', name: 'user', type: 'address' }, { internalType: 'uint256', name: 'score', type: 'uint256' }], name: 'issueOrUpdate', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [], name: 'name', outputs: [{ internalType: 'string', name: '', type: 'string' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'owner', outputs: [{ internalType: 'address', name: '', type: 'address' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'symbol', outputs: [{ internalType: 'string', name: '', type: 'string' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'tokenIdCounter', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
]

async function deploy() {
  const PRIVATE_KEY = process.env.PRIVATE_KEY_DEPLOYER
  
  if (!PRIVATE_KEY) {
    console.error('❌ PRIVATE_KEY_DEPLOYER not set in environment')
    console.log('\nSet it with:')
    console.log('$env:PRIVATE_KEY_DEPLOYER = "0x..."')
    process.exit(1)
  }

  console.log('🚀 Deploying ReputationSBT to Base Mainnet...\n')

  const account = privateKeyToAccount(PRIVATE_KEY)
  console.log(`Deployer: ${account.address}`)

  const publicClient = createPublicClient({
    chain: base,
    transport: http('https://mainnet.base.org'),
  })

  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http('https://mainnet.base.org'),
  })

  // Check balance
  const balance = await publicClient.getBalance({ address: account.address })
  const balanceEth = Number(balance) / 1e18
  console.log(`Balance: ${balanceEth.toFixed(6)} ETH`)

  if (balanceEth < 0.001) {
    console.error('❌ Insufficient balance. Need at least 0.001 ETH for deployment.')
    process.exit(1)
  }

  console.log('\n📦 Deploying contract...')
  
  try {
    const hash = await walletClient.deployContract({
      abi: REPUTATION_SBT_ABI,
      bytecode: REPUTATION_SBT_BYTECODE,
    })

    console.log(`Transaction: https://basescan.org/tx/${hash}`)
    console.log('⏳ Waiting for confirmation...')

    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    
    console.log(`\n✅ ReputationSBT deployed!`)
    console.log(`Contract: ${receipt.contractAddress}`)
    console.log(`Gas used: ${receipt.gasUsed}`)
    console.log(`\n📝 Update .env.local:`)
    console.log(`NEXT_PUBLIC_REP_CONTRACT=${receipt.contractAddress}`)
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message)
  }
}

deploy()
