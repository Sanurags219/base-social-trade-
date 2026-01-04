'use client'

import {
  ConnectWallet,
  Wallet,
  WalletAdvancedDefault,
  WalletAdvancedAddressDetails,
  WalletAdvancedTokenHoldings,
  WalletAdvancedTransactionActions,
  WalletAdvancedWalletActions,
  WalletDropdown,
  WalletDropdownBasename,
  WalletDropdownDisconnect,
  WalletDropdownFundLink,
  WalletDropdownLink,
  WalletIsland,
} from '@coinbase/onchainkit/wallet'
import {
  Avatar,
  Name,
  Address,
  EthBalance,
  Identity,
} from '@coinbase/onchainkit/identity'
import { useAccount, useDisconnect } from 'wagmi'

// Simple connect button
interface ConnectButtonProps {
  className?: string
  text?: string
}

export function ConnectButton({ className, text = 'Connect Wallet' }: ConnectButtonProps) {
  return (
    <ConnectWallet className={className}>
      <span>{text}</span>
    </ConnectWallet>
  )
}

// Default wallet with dropdown
interface WalletWithDropdownProps {
  className?: string
}

export function WalletWithDropdown({ className }: WalletWithDropdownProps) {
  return (
    <div className={className}>
      <Wallet>
        <ConnectWallet>
          <Avatar className="h-6 w-6" />
          <Name />
        </ConnectWallet>
        <WalletDropdown>
          <Identity className="px-4 pt-3 pb-2">
            <Avatar />
            <Name />
            <Address />
            <EthBalance />
          </Identity>
          <WalletDropdownBasename />
          <WalletDropdownFundLink />
          <WalletDropdownLink icon="wallet" href="/portfolio">
            Portfolio
          </WalletDropdownLink>
          <WalletDropdownDisconnect />
        </WalletDropdown>
      </Wallet>
    </div>
  )
}

// Default wallet component
interface WalletDefaultProps {
  className?: string
}

export function WalletDefaultComponent({ className }: WalletDefaultProps) {
  return (
    <div className={className}>
      <WalletAdvancedDefault />
    </div>
  )
}

// Advanced wallet view
interface WalletAdvancedViewProps {
  className?: string
}

export function WalletAdvancedView({ className }: WalletAdvancedViewProps) {
  return (
    <div className={className}>
      <WalletAdvancedDefault />
    </div>
  )
}

// Wallet Island (floating UI)
interface WalletIslandComponentProps {
  className?: string
}

export function WalletIslandComponent({ className }: WalletIslandComponentProps) {
  return (
    <div className={className}>
      <WalletIsland />
    </div>
  )
}

// Compact wallet button
interface CompactWalletProps {
  className?: string
}

export function CompactWallet({ className }: CompactWalletProps) {
  const { address, isConnected } = useAccount()
  
  if (!isConnected) {
    return <ConnectButton className={className} text="Connect" />
  }

  return (
    <div className={className}>
      <Wallet>
        <ConnectWallet className="!px-2 !py-1">
          <Avatar className="h-5 w-5" />
        </ConnectWallet>
        <WalletDropdown>
          <Identity className="px-4 pt-3 pb-2">
            <Avatar />
            <Name />
            <Address />
          </Identity>
          <WalletDropdownFundLink />
          <WalletDropdownDisconnect />
        </WalletDropdown>
      </Wallet>
    </div>
  )
}

// Full wallet panel
interface WalletPanelProps {
  className?: string
}

export function WalletPanel({ className }: WalletPanelProps) {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  if (!isConnected) {
    return (
      <div className={`rounded-xl bg-zinc-900 p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-white mb-4">Connect Wallet</h3>
        <p className="text-sm text-zinc-400 mb-4">
          Connect your wallet to start using Baseline
        </p>
        <ConnectButton className="w-full" />
      </div>
    )
  }

  return (
    <div className={`rounded-xl bg-zinc-900 p-6 ${className}`}>
      <Identity address={address} className="flex flex-col items-center gap-3 mb-6">
        <Avatar className="h-16 w-16" />
        <div className="text-center">
          <Name className="text-lg font-semibold" />
          <Address className="text-sm text-zinc-400" />
        </div>
        <EthBalance className="text-xl font-bold" />
      </Identity>
      
      <div className="space-y-2">
        <WalletDropdownFundLink className="w-full" />
        <button
          onClick={() => disconnect()}
          className="w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          Disconnect
        </button>
      </div>
    </div>
  )
}

// Connection status indicator
export function ConnectionStatus({ className }: { className?: string }) {
  const { isConnected, isConnecting, isReconnecting } = useAccount()

  if (isConnecting || isReconnecting) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
        <span className="text-sm text-zinc-400">Connecting...</span>
      </div>
    )
  }

  if (isConnected) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="h-2 w-2 rounded-full bg-green-400" />
        <span className="text-sm text-zinc-400">Connected</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="h-2 w-2 rounded-full bg-zinc-600" />
      <span className="text-sm text-zinc-400">Not connected</span>
    </div>
  )
}
