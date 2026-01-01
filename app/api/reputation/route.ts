import { NextRequest, NextResponse } from 'next/server';

// TODO: Set these to your deployed contract address and RPC
const REP_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_REP_CONTRACT || '0x0000000000000000000000000000000000000000';
const BASE_RPC = process.env.NEXT_PUBLIC_BASE_RPC || 'https://mainnet.base.org';

// Minimal ABI for reputation reads
const REP_ABI = [
  {
    name: 'getReputation',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: 'score', type: 'uint256' },
      { name: 'lastUpdated', type: 'uint256' }
    ]
  }
];

async function getOnChainReputation(address: string) {
  try {
    const response = await fetch(BASE_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [
          {
            to: REP_CONTRACT_ADDRESS,
            data: encodeGetReputationCall(address)
          },
          'latest'
        ],
        id: 1
      })
    });

    const data = await response.json();
    if (data.result && data.result !== '0x') {
      const score = parseInt(data.result.slice(0, 66), 16);
      return { score, source: 'onchain' };
    }
  } catch (error) {
    console.error('Failed to read on-chain reputation:', error);
  }
  return null;
}

// Simple function selector: getReputation(address) = 0xf1127ed8
function encodeGetReputationCall(address: string): string {
  const selector = '0xf1127ed8';
  const paddedAddress = address.toLowerCase().replace('0x', '').padStart(64, '0');
  return selector + paddedAddress;
}

// Fallback: Return error instead of mock data
function getMockReputation(address: string) {
  return {
    error: 'On-chain reputation not available',
    message: 'Deploy ReputationSBT contract and update contract address in .env.local',
    address,
    score: 0,
    source: 'none'
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address') || '0x0000000000000000000000000000000000000000';

  // Try to read from on-chain first
  const onChainRep = await getOnChainReputation(address);
  if (onChainRep) {
    return NextResponse.json({
      address,
      score: onChainRep.score,
      source: 'onchain',
      lastUpdated: new Date().toISOString(),
    });
  }

  // Fallback: return error
  const mockRep = getMockReputation(address);
  return NextResponse.json({
    ...mockRep,
    lastUpdated: new Date().toISOString(),
  }, { status: 501 });
}
