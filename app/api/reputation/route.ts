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

// Fallback mock data with seed
function getMockReputation(address: string) {
  const seed = parseInt(address.slice(2, 10), 16) || Math.random();
  const random = (min: number, max: number) => {
    const pseudo = Math.sin(seed * 12.9898 + Math.random()) * 43758.5453;
    return Math.floor((pseudo - Math.floor(pseudo)) * (max - min) + min);
  };

  const xpScore = random(0, 300);
  const tradingScore = random(0, 200);
  const ageScore = random(0, 150);
  const socialScore = random(0, 150);
  const riskScore = random(0, 200);

  return {
    score: xpScore + tradingScore + ageScore + socialScore + riskScore,
    breakdown: {
      xpScore,
      tradingScore,
      ageScore,
      socialScore,
      riskScore,
    },
    source: 'mock'
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

  // Fallback to mock data
  const mockRep = getMockReputation(address);
  return NextResponse.json({
    address,
    ...mockRep,
    lastUpdated: new Date().toISOString(),
  });
}
