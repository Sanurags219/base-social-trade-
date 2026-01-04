// Deploy BSTN + RewardsVault to Base Mainnet using viem + solc
import { createWalletClient, createPublicClient, http, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base } from 'viem/chains'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import solc from 'solc'
import dotenv from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: '.env.local' })

const PRIVATE_KEY = process.env.PRIVATE_KEY_DEPLOYER
const OWNER_ADDRESS = '0x22E228AdE324185123A54Ad25F3459a99CF51E7a'

if (!PRIVATE_KEY) {
  console.error('❌ PRIVATE_KEY_DEPLOYER not found in .env.local')
  process.exit(1)
}

// Import callback for OpenZeppelin
function findImports(importPath) {
  try {
    let fullPath
    if (importPath.startsWith('@openzeppelin')) {
      fullPath = join(__dirname, '..', 'node_modules', importPath)
    } else {
      fullPath = join(__dirname, '..', 'contracts', importPath)
    }
    return { contents: readFileSync(fullPath, 'utf8') }
  } catch (e) {
    return { error: `File not found: ${importPath}` }
  }
}

function compileContract(contractName, fileName) {
  console.log(`📦 Compiling ${contractName}...`)

  const contractPath = join(__dirname, '..', 'contracts', fileName)
  let source = readFileSync(contractPath, 'utf8')
  
  // Remove BOM if present
  if (source.charCodeAt(0) === 0xFEFF) {
    source = source.slice(1)
  }
  // Also handle UTF-8 BOM bytes
  source = source.replace(/^\uFEFF/, '').replace(/^\xEF\xBB\xBF/, '')

  const input = {
    language: 'Solidity',
    sources: {
      [fileName]: { content: source }
    },
    settings: {
      outputSelection: {
        '*': { '*': ['abi', 'evm.bytecode.object'] }
      },
      optimizer: { enabled: true, runs: 200 }
    }
  }

  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }))

  if (output.errors) {
    const errors = output.errors.filter(e => e.severity === 'error')
    if (errors.length > 0) {
      console.error('Compilation errors:', errors.map(e => e.formattedMessage).join('\n'))
      return null
    }
    // Show warnings
    output.errors.filter(e => e.severity === 'warning').forEach(w => {
      console.log('⚠️ ', w.message)
    })
  }

  const contract = output.contracts[fileName][contractName]
  if (!contract) {
    console.error(`Contract ${contractName} not found in output`)
    return null
  }
  
  return {
    abi: contract.abi,
    bytecode: '0x' + contract.evm.bytecode.object
  }
}

async function deploy() {
  console.log('═'.repeat(60))
  console.log('🚀 DEPLOYING BSTN + REWARDS CONTRACTS TO BASE MAINNET')
  console.log('═'.repeat(60))

  const account = privateKeyToAccount(PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : `0x${PRIVATE_KEY}`)
  console.log('\nDeployer:', account.address)
  console.log('Target Owner:', OWNER_ADDRESS)

  const publicClient = createPublicClient({
    chain: base,
    transport: http('https://mainnet.base.org'),
  })

  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http('https://mainnet.base.org'),
  })

  const balance = await publicClient.getBalance({ address: account.address })
  const balanceEth = Number(balance) / 1e18
  console.log('Balance:', balanceEth.toFixed(6), 'ETH\n')

  if (balanceEth < 0.0005) {
    console.error('❌ Insufficient balance. Need at least 0.0005 ETH')
    process.exit(1)
  }

  const deployed = {}

  // ============================================
  // 1. Deploy BSTN Token
  // ============================================
  console.log('\n' + '─'.repeat(60))
  const bstn = compileContract('BSTN', 'BSTN.sol')
  if (!bstn) {
    console.error('❌ BSTN compilation failed')
    process.exit(1)
  }

  try {
    console.log('📜 Deploying BSTN Token...')
    const hash = await walletClient.deployContract({
      abi: bstn.abi,
      bytecode: bstn.bytecode,
    })
    console.log('   TX:', hash)
    
    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    deployed.bstn = receipt.contractAddress
    console.log('   ✅ BSTN deployed:', deployed.bstn)
  } catch (e) {
    console.error('   ❌ BSTN deployment failed:', e.message)
    process.exit(1)
  }

  // ============================================
  // 2. Deploy RewardsVault
  // ============================================
  console.log('\n' + '─'.repeat(60))
  const vault = compileContract('RewardsVault', 'RewardsVault.sol')
  if (!vault) {
    console.error('❌ RewardsVault compilation failed')
    process.exit(1)
  }

  try {
    console.log('📜 Deploying RewardsVault...')
    const hash = await walletClient.deployContract({
      abi: vault.abi,
      bytecode: vault.bytecode,
      args: [deployed.bstn]
    })
    console.log('   TX:', hash)
    
    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    deployed.vault = receipt.contractAddress
    console.log('   ✅ RewardsVault deployed:', deployed.vault)
  } catch (e) {
    console.error('   ❌ RewardsVault deployment failed:', e.message)
    process.exit(1)
  }

  // ============================================
  // 3. Mint BSTN to Vault
  // ============================================
  console.log('\n' + '─'.repeat(60))
  console.log('📜 Minting 1,000,000 BSTN to RewardsVault...')
  try {
    const hash = await walletClient.writeContract({
      address: deployed.bstn,
      abi: bstn.abi,
      functionName: 'mint',
      args: [deployed.vault, parseEther('1000000')]
    })
    await publicClient.waitForTransactionReceipt({ hash })
    console.log('   ✅ Minted 1,000,000 BSTN to vault')
  } catch (e) {
    console.log('   ⚠️  Mint failed:', e.message)
  }

  // ============================================
  // 4. Transfer Ownership
  // ============================================
  console.log('\n' + '─'.repeat(60))
  
  // Transfer BSTN ownership
  console.log('📜 Transferring BSTN ownership to', OWNER_ADDRESS)
  try {
    const hash = await walletClient.writeContract({
      address: deployed.bstn,
      abi: bstn.abi,
      functionName: 'transferOwnership',
      args: [OWNER_ADDRESS]
    })
    await publicClient.waitForTransactionReceipt({ hash })
    console.log('   ✅ BSTN ownership transferred')
  } catch (e) {
    console.log('   ⚠️  Transfer failed:', e.message)
  }

  // Transfer Vault ownership
  console.log('📜 Transferring RewardsVault ownership to', OWNER_ADDRESS)
  try {
    const hash = await walletClient.writeContract({
      address: deployed.vault,
      abi: vault.abi,
      functionName: 'transferOwnership',
      args: [OWNER_ADDRESS]
    })
    await publicClient.waitForTransactionReceipt({ hash })
    console.log('   ✅ RewardsVault ownership transferred')
  } catch (e) {
    console.log('   ⚠️  Transfer failed:', e.message)
  }

  // ============================================
  // Summary
  // ============================================
  console.log('\n' + '═'.repeat(60))
  console.log('📋 DEPLOYMENT COMPLETE!')
  console.log('═'.repeat(60))
  console.log('\n🎯 Contract Addresses:')
  console.log('   BSTN Token:    ', deployed.bstn)
  console.log('   RewardsVault:  ', deployed.vault)
  console.log('\n👤 Owner:', OWNER_ADDRESS)
  
  console.log('\n📝 Update app/events/page.tsx:')
  console.log(`   const XP_CONTRACT = '${deployed.vault}' as const`)
  console.log(`   const BSTN_TOKEN = '${deployed.bstn}' as const`)
  
  console.log('\n' + '═'.repeat(60))
}

deploy().catch(console.error)
