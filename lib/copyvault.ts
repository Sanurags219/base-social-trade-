// On-chain CopyVault Factory integration
import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

const COPY_VAULT_FACTORY = process.env.NEXT_PUBLIC_COPY_VAULT_CONTRACT || '0x71a89FDa4e2101855a35394a713Fe54e9a17c77c'

export const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org'),
})

export const FACTORY_ABI = [
  {
    name: 'createVault',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'trader', type: 'address' },
      { name: 'copyPercent', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'address' }]
  },
  {
    name: 'getUserVaults',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'address[]' }]
  },
  {
    name: 'getVaultCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'admin',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }]
  }
] as const

export const VAULT_ABI = [
  {
    name: 'owner',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }]
  },
  {
    name: 'trader',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }]
  },
  {
    name: 'copyPercent',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'active',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'totalDeposited',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'totalExecuted',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'getStatus',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: '', type: 'address' },
      { name: '', type: 'address' },
      { name: '', type: 'uint256' },
      { name: '', type: 'uint256' },
      { name: '', type: 'uint256' },
      { name: '', type: 'bool' }
    ]
  },
  {
    name: 'balance',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'token', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'deposit',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: []
  },
  {
    name: 'withdraw',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: []
  },
  {
    name: 'updateCopyPercent',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'newPercent', type: 'uint256' }],
    outputs: []
  },
  {
    name: 'deactivate',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: []
  }
] as const

export interface VaultInfo {
  address: string
  owner: string
  trader: string
  copyPercent: number
  totalDeposited: bigint
  totalExecuted: bigint
  active: boolean
}

export async function getUserVaults(userAddress: string): Promise<string[]> {
  try {
    const vaults = await publicClient.readContract({
      address: COPY_VAULT_FACTORY as `0x${string}`,
      abi: FACTORY_ABI,
      functionName: 'getUserVaults',
      args: [userAddress as `0x${string}`]
    })
    return vaults as string[]
  } catch (error) {
    console.error('Failed to get user vaults:', error)
    return []
  }
}

export async function getVaultInfo(vaultAddress: string): Promise<VaultInfo | null> {
  try {
    const status = await publicClient.readContract({
      address: vaultAddress as `0x${string}`,
      abi: VAULT_ABI,
      functionName: 'getStatus'
    })

    const [owner, trader, copyPercent, totalDeposited, totalExecuted, active] = status

    return {
      address: vaultAddress,
      owner: owner as string,
      trader: trader as string,
      copyPercent: Number(copyPercent),
      totalDeposited: totalDeposited as bigint,
      totalExecuted: totalExecuted as bigint,
      active: active as boolean
    }
  } catch (error) {
    console.error('Failed to get vault info:', error)
    return null
  }
}

export async function getTotalVaults(): Promise<number> {
  try {
    const total = await publicClient.readContract({
      address: COPY_VAULT_FACTORY as `0x${string}`,
      abi: FACTORY_ABI,
      functionName: 'getVaultCount'
    })
    return Number(total)
  } catch (error) {
    console.error('Failed to get total vaults:', error)
    return 0
  }
}

export function getFactoryAddress() {
  return COPY_VAULT_FACTORY
}
