'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { AppShell } from '@/components/AppShell'
import {
  BuyToken,
  CheckoutFlow,
  EarnUSDC,
  FundWallet,
  QuickFund,
  UserIdentity,
  ProfileDisplay,
  SwapComponent,
  TokenSelector,
  WalletWithDropdown,
  WalletPanel,
  ConnectionStatus,
  NFTMint,
  SignMessage,
  BASE_TOKEN_LIST,
  DEMO_NFTS,
} from '@/components/onchainkit'

const SECTIONS = [
  { id: 'wallet', label: 'Wallet' },
  { id: 'buy', label: 'Buy' },
  { id: 'swap', label: 'Swap' },
  { id: 'fund', label: 'Fund' },
  { id: 'earn', label: 'Earn' },
  { id: 'identity', label: 'Identity' },
  { id: 'nft', label: 'NFT' },
  { id: 'signature', label: 'Signature' },
]

export default function OnchainKitDemoPage() {
  const { address, isConnected } = useAccount()
  const [activeSection, setActiveSection] = useState('wallet')

  return (
    <AppShell>
      <div className="min-h-screen bg-[#05060A] pb-24">
        {/* Header */}
        <div className="bg-gradient-to-b from-blue-600/20 to-transparent px-4 py-8">
          <h1 className="text-2xl font-bold text-white mb-2">OnchainKit Components</h1>
          <p className="text-sm text-zinc-400">
            Full implementation of Base OnchainKit
          </p>
          <ConnectionStatus className="mt-2" />
        </div>

        {/* Section Tabs */}
        <div className="px-4 py-3 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-4 space-y-6">
          {/* Wallet Section */}
          {activeSection === 'wallet' && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Wallet Components</h2>
              
              <div className="rounded-xl bg-zinc-900 p-4">
                <h3 className="text-sm font-medium text-zinc-400 mb-3">Wallet Dropdown</h3>
                <WalletWithDropdown />
              </div>
              
              <div className="rounded-xl bg-zinc-900 p-4">
                <h3 className="text-sm font-medium text-zinc-400 mb-3">Wallet Panel</h3>
                <WalletPanel />
              </div>
            </section>
          )}

          {/* Buy Section */}
          {activeSection === 'buy' && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Buy Components</h2>
              
              <div className="rounded-xl bg-zinc-900 p-4">
                <h3 className="text-sm font-medium text-zinc-400 mb-3">Buy Token</h3>
                <BuyToken />
              </div>
            </section>
          )}

          {/* Swap Section */}
          {activeSection === 'swap' && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Swap Components</h2>
              
              <div className="rounded-xl bg-zinc-900 p-4">
                <h3 className="text-sm font-medium text-zinc-400 mb-3">Token Swap</h3>
                <SwapComponent />
              </div>
              
              <div className="rounded-xl bg-zinc-900 p-4">
                <h3 className="text-sm font-medium text-zinc-400 mb-3">Token Selector</h3>
                <TokenSelector tokens={BASE_TOKEN_LIST} />
              </div>
            </section>
          )}

          {/* Fund Section */}
          {activeSection === 'fund' && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Fund Components</h2>
              
              <div className="rounded-xl bg-zinc-900 p-4">
                <h3 className="text-sm font-medium text-zinc-400 mb-3">Fund Button</h3>
                <FundWallet />
              </div>
              
              <div className="rounded-xl bg-zinc-900 p-4">
                <h3 className="text-sm font-medium text-zinc-400 mb-3">Quick Fund</h3>
                <QuickFund />
              </div>
            </section>
          )}

          {/* Earn Section */}
          {activeSection === 'earn' && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Earn Components</h2>
              
              <div className="rounded-xl bg-zinc-900 p-4">
                <h3 className="text-sm font-medium text-zinc-400 mb-3">Earn USDC</h3>
                <EarnUSDC />
              </div>
            </section>
          )}

          {/* Identity Section */}
          {activeSection === 'identity' && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Identity Components</h2>
              
              {isConnected && address ? (
                <>
                  <div className="rounded-xl bg-zinc-900 p-4">
                    <h3 className="text-sm font-medium text-zinc-400 mb-3">User Identity</h3>
                    <UserIdentity address={address} />
                  </div>
                  
                  <div className="rounded-xl bg-zinc-900 p-4">
                    <h3 className="text-sm font-medium text-zinc-400 mb-3">Profile Display</h3>
                    <ProfileDisplay address={address} />
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-zinc-400">
                  Connect wallet to view identity components
                </div>
              )}
            </section>
          )}

          {/* NFT Section */}
          {activeSection === 'nft' && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-white">NFT Components</h2>
              
              <div className="rounded-xl bg-zinc-900 p-4">
                <h3 className="text-sm font-medium text-zinc-400 mb-3">NFT Mint Card</h3>
                <NFTMint 
                  contractAddress={DEMO_NFTS.basepaintBrush.contractAddress}
                  tokenId={DEMO_NFTS.basepaintBrush.tokenId}
                />
              </div>
            </section>
          )}

          {/* Signature Section */}
          {activeSection === 'signature' && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Signature Components</h2>
              
              <div className="rounded-xl bg-zinc-900 p-4">
                <h3 className="text-sm font-medium text-zinc-400 mb-3">Sign Message</h3>
                <SignMessage 
                  message="I agree to use Baseline responsibly."
                  onSign={(sig) => console.log('Signed:', sig)}
                />
              </div>
            </section>
          )}
        </div>
      </div>
    </AppShell>
  )
}
