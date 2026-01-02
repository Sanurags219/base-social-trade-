// Deploy ReputationSBT to Base Mainnet using viem
import { createWalletClient, createPublicClient, http, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base } from 'viem/chains'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import solc from 'solc'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load private key from .env.local
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const PRIVATE_KEY = process.env.PRIVATE_KEY_DEPLOYER

if (!PRIVATE_KEY) {
  console.error('❌ PRIVATE_KEY_DEPLOYER not found in .env.local')
  process.exit(1)
}

// Compile contract
function compileContract() {
  console.log('📦 Compiling ReputationSBT.sol...')
  
  const contractPath = join(__dirname, '..', 'contracts', 'ReputationSBT.sol')
  const source = readFileSync(contractPath, 'utf8')

  const input = {
    language: 'Solidity',
    sources: {
      'ReputationSBT.sol': { content: source }
    },
    settings: {
      outputSelection: {
        '*': { '*': ['abi', 'evm.bytecode.object'] }
      },
      optimizer: { enabled: true, runs: 200 }
    }
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

  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }))

  if (output.errors) {
    const errors = output.errors.filter(e => e.severity === 'error')
    if (errors.length > 0) {
      console.error('Compilation errors:', errors)
      process.exit(1)
    }
  }

  const contract = output.contracts['ReputationSBT.sol']['ReputationSBT']
  return {
    abi: contract.abi,
    bytecode: '0x' + contract.evm.bytecode.object
  }
}

async function deploy() {
  console.log('🚀 Deploying ReputationSBT to Base Mainnet...\n')

  const account = privateKeyToAccount(PRIVATE_KEY)
  console.log('Deployer:', account.address)

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
  console.log('Balance:', balanceEth.toFixed(6), 'ETH\n')

  if (balanceEth < 0.001) {
    console.error('❌ Insufficient balance. Need at least 0.001 ETH')
    process.exit(1)
  }

  // Compile
  const { abi, bytecode } = compileContract()
  console.log('✅ Compiled successfully\n')

  // Deploy
  console.log('📤 Deploying contract...')
  const hash = await walletClient.deployContract({
    abi,
    bytecode,
  })

  console.log('Transaction:', `https://basescan.org/tx/${hash}`)
  console.log('⏳ Waiting for confirmation...\n')

  const receipt = await publicClient.waitForTransactionReceipt({ hash })

  console.log('✅ ReputationSBT deployed!')
  console.log('Contract:', receipt.contractAddress)
  console.log('Gas used:', receipt.gasUsed.toString())
  console.log('Explorer:', `https://basescan.org/address/${receipt.contractAddress}`)

  console.log('\n📝 Update .env.local:')
  console.log(`NEXT_PUBLIC_REP_CONTRACT=${receipt.contractAddress}`)

  console.log('\n📝 Update Vercel:')
  console.log(`npx vercel env rm NEXT_PUBLIC_REP_CONTRACT production -y`)
  console.log(`echo "${receipt.contractAddress}" | npx vercel env add NEXT_PUBLIC_REP_CONTRACT production`)
}

deploy().catch(console.error)
