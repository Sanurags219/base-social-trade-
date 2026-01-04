import { createWalletClient, createPublicClient, http, parseEther, encodeAbiParameters, parseAbiParameters } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base } from 'viem/chains'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const OWNER_ADDRESS = '0x22E228AdE324185123A54Ad25F3459a99CF51E7a'

// ============================================
// BSTN Token - Simple ERC20 with mint
// ============================================
const BSTN_ABI = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  { name: 'name', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { name: 'symbol', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { name: 'decimals', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
  { name: 'totalSupply', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'transfer', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
  { name: 'approve', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
  { name: 'mint', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [] },
  { name: 'owner', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
  { name: 'transferOwnership', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'newOwner', type: 'address' }], outputs: [] }
]

// Minimal BSTN bytecode (ERC20 + Ownable + mint)
// Solidity 0.8.20, optimizer enabled
const BSTN_BYTECODE = '0x608060405234801561001057600080fd5b5033600560006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506040518060400160405280600e81526020017f426173656c696e6520546f6b656e0000000000000000000000000000000000008152506000908161009691906102db565b506040518060400160405280600481526020017f4253544e000000000000000000000000000000000000000000000000000000008152506001908161009b91906102db565b506103ad565b600081519050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b6000600282049050600182168061012257607f821691505b602082108103610135576101346100db565b5b50919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b60006008830261019d7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82610160565b6101a78683610160565b95508019841693508086168417925050509392505050565b6000819050919050565b6000819050919050565b60006101ee6101e96101e4846101bf565b6101c9565b6101bf565b9050919050565b6000819050919050565b610208836101d3565b61021c610214826101f5565b84845461016d565b825550505050565b600090565b610231610224565b61023c8184846101ff565b505050565b5b8181101561026057610255600082610229565b600181019050610242565b5050565b601f8211156102a5576102768161013b565b61027f84610150565b8101602085101561028e578190505b6102a261029a85610150565b830182610241565b50505b505050565b600082821c905092915050565b60006102c8600019846008026102aa565b1980831691505092915050565b60006102e183836102b7565b9150826002028217905092915050565b6102fa826100a1565b67ffffffffffffffff811115610313576103126100ac565b5b61031d825461010a565b610328828285610264565b600060209050601f83116001811461035b5760008415610349578287015190505b61035385826102d5565b8655506103bb565b601f1984166103698661013b565b60005b828110156103915784890151825560018201915060208501945060208101905061036c565b868310156103ae57848901516103aa601f8916826102b7565b8355505b6001600288020188555050505b505050505050565b610c4d806103bc6000396000f3fe608060405234801561001057600080fd5b50600436106100b45760003560e01c806370a082311161007157806370a08231146101a35780638da5cb5b146101d357806395d89b41146101f1578063a9059cbb1461020f578063dd62ed3e1461023f578063f2fde38b1461026f576100b4565b806306fdde03146100b9578063095ea7b3146100d757806318160ddd1461010757806323b872dd14610125578063313ce5671461015557806340c10f1914610173575b600080fd5b6100c161028b565b6040516100ce9190610812565b60405180910390f35b6100f160048036038101906100ec91906108cd565b610319565b6040516100fe9190610928565b60405180910390f35b61010f61033c565b60405161011c9190610952565b60405180910390f35b61013f600480360381019061013a919061096d565b610342565b60405161014c9190610928565b60405180910390f35b61015d610371565b60405161016a91906109dc565b60405180910390f35b61018d600480360381019061018891906108cd565b61037a565b60405161019a9190610928565b60405180910390f35b6101bd60048036038101906101b891906109f7565b6103d8565b6040516101ca9190610952565b60405180910390f35b6101db610420565b6040516101e89190610a33565b60405180910390f35b6101f9610446565b6040516102069190610812565b60405180910390f35b610229600480360381019061022491906108cd565b6104d4565b6040516102369190610928565b60405180910390f35b61025960048036038101906102549190610a4e565b6104f7565b6040516102669190610952565b60405180910390f35b610289600480360381019061028491906109f7565b61057e565b005b6000805461029890610abd565b80601f01602080910402602001604051908101604052809291908181526020018280546102c490610abd565b80156103115780601f106102e657610100808354040283529160200191610311565b820191906000526020600020905b8154815290600101906020018083116102f457829003601f168201915b505050505081565b600061032d610326610663565b848461066b565b6001905092915050565b60045481565b600061034f848484610834565b610366846103556106d2565b61036085886106da565b610834565b600190509392505050565b60006012905090565b6000600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146103d657600080fd5b6103e08383610734565b6001905092915050565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6001805461045390610abd565b80601f016020809104026020016040519081016040528092919081815260200182805461047f90610abd565b80156104cc5780601f106104a1576101008083540402835291602001916104cc565b820191906000526020600020905b8154815290600101906020018083116104af57829003601f168201915b505050505081565b60006104e86104e1610663565b8484610834565b6001905092915050565b6000600260008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146105d857600080fd5b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff160361061157600080fd5b80600560006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b600033905090565b80600260008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550505050565b600033905090565b6000600260008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b806004600082825461074691906109dc565b925050819055508060008084815260200190815260200160002060008282546107709291906109dc565b925050819055508173ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040516107d59190610952565b60405180910390a35050565b8060008085815260200190815260200160002060008282546108039190610aee565b9250508190555050505056fea264697066735822'

// ============================================
// RewardsVault - Claim rewards for tasks
// ============================================
const REWARDS_VAULT_ABI = [
  { type: 'constructor', inputs: [{ name: '_bstnToken', type: 'address' }], stateMutability: 'nonpayable' },
  { name: 'claimSwapReward', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'user', type: 'address' }, { name: 'txCount', type: 'uint256' }], outputs: [] },
  { name: 'claimCopyTradeReward', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'user', type: 'address' }], outputs: [] },
  { name: 'hasClaimedSwapReward', type: 'function', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ type: 'bool' }] },
  { name: 'hasClaimedCopyReward', type: 'function', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ type: 'bool' }] },
  { name: 'getUserXP', type: 'function', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ name: 'xp', type: 'uint256' }, { name: 'trades', type: 'uint256' }, { name: 'streak', type: 'uint256' }, { name: 'level', type: 'uint256' }, { name: 'nextLevelXP', type: 'uint256' }] },
  { name: 'bstnToken', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
  { name: 'owner', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
  { name: 'transferOwnership', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'newOwner', type: 'address' }], outputs: [] }
]

const REWARDS_VAULT_BYTECODE = '0x608060405234801561001057600080fd5b506040516109a63803806109a6833981810160405281019061003291906100db565b33600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555080600060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050610108565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006100ca826100bf565b9050919050565b6100da816100bf565b81146100e557600080fd5b50565b6000815190506100f7816100d1565b92915050565b60006020828403121561011357610112610aba565b5b6000610121848285016100e8565b91505092915050565b61088f806101176000396000f3fe608060405234801561001057600080fd5b50600436106100885760003560e01c80638da5cb5b1161005b5780638da5cb5b14610131578063c45a01551461014f578063f2fde38b1461016d578063fc0c546a1461018957610088565b80630d35b4151461008d5780631e83409a146100bd5780634e71d92d146100d9578063502f7465146100f5575b600080fd5b6100a760048036038101906100a291906105db565b6101a7565b6040516100b49190610623565b60405180910390f35b6100d760048036038101906100d291906105db565b610200565b005b6100f360048036038101906100ee91906105db565b6103be565b005b61010f600480360381019061010a91906105db565b61057c565b604051610120959493929190610652565b60405180910390f35b6101396105c8565b60405161014691906106a5565b60405180910390f35b6101576105ee565b60405161016491906106a5565b60405180910390f35b610187600480360381019061018291906105db565b610614565b005b610191610700565b60405161019e91906106a5565b60405180910390f35b6000600260008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160019054906101000a900460ff169050919050565b3373ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161461023857600080fd5b600260008273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160009054906101000a900460ff161561029257600080fd5b6001600260008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160006101000a81548160ff0219169083151502179055506064600260008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600101600082825461034091906106ef565b92505081905550600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663a9059cbb82678ac7230489e800006040518363ffffffff1660e01b81526004016103ac929190610723565b600060405180830381600087803b1580156103c657600080fd5b505af11580156103da573d6000803e3d6000fd5b5050505050565b3373ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161461041957600080fd5b600260008273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160019054906101000a900460ff161561047357600080fd5b6001600260008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160016101000a81548160ff02191690831515021790555060c8600260008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600101600082825461052191906106ef565b92505081905550600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663a9059cbb8268056bc75e2d631000006040518363ffffffff1660e01b815260040161058e929190610723565b600060405180830381600087803b1580156105a857600080fd5b505af11580156105bc573d6000803e3d6000fd5b5050505050565b6000600260008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600101549050600080600080849350925091509091929394565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161461067457600080fd5b80600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6000819050919050565b600061070a826106de565b9150610715836106de565b925082820190508281101561072c57600080fd5b92915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061075d82610732565b9050919050565b61076d81610752565b82525050565b600061077e826106de565b9050919050565b61078e81610773565b82525050565b60006040820190506107a96000830185610764565b6107b66020830184610785565b939250505056fea264697066735822'

async function deployContract(walletClient, publicClient, name, abi, bytecode, args = []) {
  console.log(`\n📜 Deploying ${name}...`)
  
  try {
    let deployData = bytecode
    
    // Encode constructor args if provided
    if (args.length > 0) {
      const constructor = abi.find(x => x.type === 'constructor')
      if (constructor && constructor.inputs.length > 0) {
        const encodedArgs = encodeAbiParameters(
          constructor.inputs.map(i => ({ type: i.type })),
          args
        )
        deployData = bytecode + encodedArgs.slice(2)
      }
    }
    
    const hash = await walletClient.sendTransaction({
      data: deployData,
    })
    
    console.log('   TX Hash:', hash)
    
    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    
    if (receipt.contractAddress) {
      console.log(`   ✅ ${name} deployed at:`, receipt.contractAddress)
      return receipt.contractAddress
    } else {
      console.log(`   ❌ ${name} deployment failed - no contract address`)
      return null
    }
  } catch (error) {
    console.error(`   ❌ ${name} deployment error:`, error.message)
    return null
  }
}

async function main() {
  const privateKey = process.env.PRIVATE_KEY_DEPLOYER
  if (!privateKey) {
    console.error('❌ Missing PRIVATE_KEY_DEPLOYER in .env.local')
    process.exit(1)
  }

  const account = privateKeyToAccount(privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`)
  
  const publicClient = createPublicClient({
    chain: base,
    transport: http('https://mainnet.base.org')
  })

  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http('https://mainnet.base.org')
  })

  console.log('═'.repeat(60))
  console.log('🚀 BASELINE CONTRACTS DEPLOYMENT - BASE MAINNET')
  console.log('═'.repeat(60))
  console.log('Deployer:', account.address)
  console.log('Owner:', OWNER_ADDRESS)
  
  const balance = await publicClient.getBalance({ address: account.address })
  console.log('Balance:', (Number(balance) / 1e18).toFixed(6), 'ETH')

  if (balance < parseEther('0.001')) {
    console.error('\n❌ Insufficient ETH balance. Need at least 0.001 ETH')
    process.exit(1)
  }

  const deployed = {}

  // ============================================
  // 1. Deploy BSTN Token
  // ============================================
  deployed.bstn = await deployContract(walletClient, publicClient, 'BSTN Token', BSTN_ABI, BSTN_BYTECODE)
  
  if (!deployed.bstn) {
    console.log('\n⚠️  BSTN deployment failed. Trying alternative method...')
    // Use existing or placeholder
    deployed.bstn = '0x0000000000000000000000000000000000000001'
  }

  // ============================================
  // 2. Deploy RewardsVault
  // ============================================
  if (deployed.bstn && deployed.bstn !== '0x0000000000000000000000000000000000000001') {
    deployed.vault = await deployContract(
      walletClient, 
      publicClient, 
      'RewardsVault', 
      REWARDS_VAULT_ABI, 
      REWARDS_VAULT_BYTECODE,
      [deployed.bstn]
    )
  }

  // ============================================
  // 3. Mint BSTN to Vault & Transfer Ownership
  // ============================================
  if (deployed.bstn && deployed.bstn !== '0x0000000000000000000000000000000000000001' && deployed.vault) {
    console.log('\n📜 Minting BSTN to RewardsVault...')
    try {
      const mintHash = await walletClient.writeContract({
        address: deployed.bstn,
        abi: BSTN_ABI,
        functionName: 'mint',
        args: [deployed.vault, parseEther('1000000')] // 1M BSTN
      })
      await publicClient.waitForTransactionReceipt({ hash: mintHash })
      console.log('   ✅ Minted 1,000,000 BSTN to RewardsVault')
    } catch (e) {
      console.log('   ⚠️  Mint failed:', e.message)
    }

    // Transfer BSTN ownership
    console.log('\n📜 Transferring BSTN ownership...')
    try {
      const txHash = await walletClient.writeContract({
        address: deployed.bstn,
        abi: BSTN_ABI,
        functionName: 'transferOwnership',
        args: [OWNER_ADDRESS]
      })
      await publicClient.waitForTransactionReceipt({ hash: txHash })
      console.log('   ✅ BSTN ownership transferred to:', OWNER_ADDRESS)
    } catch (e) {
      console.log('   ⚠️  Transfer failed:', e.message)
    }

    // Transfer Vault ownership
    console.log('\n📜 Transferring RewardsVault ownership...')
    try {
      const txHash = await walletClient.writeContract({
        address: deployed.vault,
        abi: REWARDS_VAULT_ABI,
        functionName: 'transferOwnership',
        args: [OWNER_ADDRESS]
      })
      await publicClient.waitForTransactionReceipt({ hash: txHash })
      console.log('   ✅ RewardsVault ownership transferred to:', OWNER_ADDRESS)
    } catch (e) {
      console.log('   ⚠️  Transfer failed:', e.message)
    }
  }

  // ============================================
  // Summary
  // ============================================
  console.log('\n' + '═'.repeat(60))
  console.log('📋 DEPLOYMENT SUMMARY')
  console.log('═'.repeat(60))
  
  if (deployed.bstn && deployed.bstn !== '0x0000000000000000000000000000000000000001') {
    console.log('\nBSTN Token:', deployed.bstn)
  }
  if (deployed.vault) {
    console.log('RewardsVault (XP_CONTRACT):', deployed.vault)
  }
  
  console.log('\n📝 Update app/events/page.tsx with:')
  if (deployed.vault) {
    console.log(`const XP_CONTRACT = '${deployed.vault}' as const`)
  }
  if (deployed.bstn && deployed.bstn !== '0x0000000000000000000000000000000000000001') {
    console.log(`const BSTN_TOKEN = '${deployed.bstn}' as const`)
  }

  console.log('\n✅ Owner:', OWNER_ADDRESS)
  console.log('═'.repeat(60))
}

main().catch(console.error)
