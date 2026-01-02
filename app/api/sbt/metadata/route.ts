import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'https://base-social-trade.vercel.app';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenId = searchParams.get('tokenId') || '1';

  const metadata = {
    name: `Baseline PRO #${tokenId}`,
    description: 'Baseline Reputation SBT - Proof of onchain reputation on Base. Non-transferable soulbound token.',
    image: `${BASE_URL}/sbt-image.png`,
    external_url: BASE_URL,
    attributes: [
      {
        trait_type: 'Type',
        value: 'Reputation SBT'
      },
      {
        trait_type: 'Network',
        value: 'Base'
      },
      {
        trait_type: 'Tier',
        value: 'PRO'
      },
      {
        trait_type: 'Transferable',
        value: 'No'
      }
    ]
  };

  return NextResponse.json(metadata);
}
