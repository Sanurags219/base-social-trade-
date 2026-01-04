import { createWalletClient, createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import 'dotenv/config';

const EVENT_REGISTRY = '0xe1ebc0804a5f298d07f4544bf3fe1bb00ac31776';

const EVENTS = [
  { id: 'genesis', title: 'Baseline Genesis', xpReward: 500n, sbtReward: true, maxParticipants: 0n, endTime: 0n },
  { id: 'swap-challenge', title: 'Swap Challenge', xpReward: 100n, sbtReward: false, maxParticipants: 0n, endTime: 0n },
  { id: 'copy-trade', title: 'Copy Trade Challenge', xpReward: 100n, sbtReward: false, maxParticipants: 0n, endTime: 0n },
  { id: 'daily-login', title: 'Daily Onchain Check-in', xpReward: 50n, sbtReward: false, maxParticipants: 0n, endTime: 0n },
  { id: 'share-baseline', title: 'Share Baseline', xpReward: 50n, sbtReward: false, maxParticipants: 0n, endTime: 0n },
];

const ABI = [
  {
    name: 'createEvent',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'id', type: 'string' },
      { name: 'title', type: 'string' },
      { name: 'xpReward', type: 'uint256' },
      { name: 'sbtReward', type: 'bool' },
      { name: 'maxParticipants', type: 'uint256' },
      { name: 'endTime', type: 'uint256' }
    ],
    outputs: []
  },
  {
    name: 'getTotalEvents',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'owner',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }]
  }
];

async function main() {
  const privateKey = process.env.PRIVATE_KEY_DEPLOYER;
  if (!privateKey) {
    console.error('Missing PRIVATE_KEY_DEPLOYER in .env.local');
    process.exit(1);
  }

  const account = privateKeyToAccount(privateKey);
  console.log('Account:', account.address);

  const publicClient = createPublicClient({
    chain: base,
    transport: http('https://mainnet.base.org')
  });

  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http('https://mainnet.base.org')
  });

  // Check owner
  const owner = await publicClient.readContract({
    address: EVENT_REGISTRY,
    abi: ABI,
    functionName: 'owner'
  });
  console.log('Contract owner:', owner);

  if (owner.toLowerCase() !== account.address.toLowerCase()) {
    console.error('ERROR: Account is not the owner!');
    return;
  }

  const totalBefore = await publicClient.readContract({
    address: EVENT_REGISTRY,
    abi: ABI,
    functionName: 'getTotalEvents'
  });
  console.log('Total events before:', totalBefore.toString());

  for (const event of EVENTS) {
    try {
      console.log(`\nCreating: ${event.title}...`);
      const hash = await walletClient.writeContract({
        address: EVENT_REGISTRY,
        abi: ABI,
        functionName: 'createEvent',
        args: [event.id, event.title, event.xpReward, event.sbtReward, event.maxParticipants, event.endTime]
      });
      console.log('TX:', hash);
      await publicClient.waitForTransactionReceipt({ hash });
      console.log(' Created:', event.title);
    } catch (error) {
      if (error.message?.includes('Event exists')) {
        console.log(' Already exists:', event.title);
      } else {
        console.error(' Failed:', event.title, error.shortMessage || error.message);
      }
    }
  }

  const totalAfter = await publicClient.readContract({
    address: EVENT_REGISTRY,
    abi: ABI,
    functionName: 'getTotalEvents'
  });
  console.log('\nTotal events after:', totalAfter.toString());
  console.log('Done!');
}

main();
