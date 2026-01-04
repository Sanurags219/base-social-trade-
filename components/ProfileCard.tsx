'use client'

import { useAccount } from 'wagmi'
import { Identity, Name, Avatar, Badge } from '@coinbase/onchainkit/identity'
import { base } from 'viem/chains'
import { User, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface ProfileCardProps {
  showFullCard?: boolean
}

export function ProfileCard({ showFullCard = true }: ProfileCardProps) {
  const { address, isConnected } = useAccount()

  if (!isConnected || !address) {
    return null
  }

  // Generate gradient avatar from address
  const gradientColors = [
    'from-teal-400 to-blue-500',
    'from-purple-400 to-pink-500',
    'from-orange-400 to-red-500',
    'from-green-400 to-teal-500',
    'from-blue-400 to-purple-500',
    'from-yellow-400 to-orange-500'
  ]
  const colorIndex = parseInt(address.slice(-2), 16) % gradientColors.length
  const gradient = gradientColors[colorIndex]

  if (!showFullCard) {
    // Compact version for header
    return (
      <div className="flex items-center gap-2">
        <Identity
          address={address}
          chain={base}
          className="!bg-transparent"
        >
          <Avatar 
            className="!w-8 !h-8 !rounded-full !border !border-white/10"
            defaultComponent={
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                <span className="text-xs font-bold text-white">{address.slice(2, 4).toUpperCase()}</span>
              </div>
            }
          />
        </Identity>
        <div className="flex flex-col">
          <Identity address={address} chain={base} className="!bg-transparent">
            <Name className="!text-sm !font-medium !text-white" />
          </Identity>
          <span className="text-[10px] text-zinc-500">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>
      </div>
    )
  }

  // Full card for portfolio page
  return (
    <div className="mx-4 mb-4">
      <div className="
        relative rounded-2xl p-4
        bg-gradient-to-b from-[#0E1F24] to-[#071317]
        border border-white/10
        overflow-hidden
      ">
        {/* Glow */}
        <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.1),transparent_60%)] pointer-events-none" />
        
        <div className="relative flex items-center gap-4">
          {/* Avatar with fallback */}
          <div className="relative flex-shrink-0">
            <Identity
              address={address}
              chain={base}
              className="!bg-transparent"
            >
              <Avatar 
                className="!w-14 !h-14 !rounded-full !border-2 !border-teal-400/30"
                defaultComponent={
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center border-2 border-teal-400/30 shadow-lg shadow-teal-400/10`}>
                    <span className="text-lg font-bold text-white">{address.slice(2, 4).toUpperCase()}</span>
                  </div>
                }
              />
            </Identity>
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-[#071317]" />
          </div>

          {/* Name and address */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Identity
                address={address}
                chain={base}
                className="!bg-transparent"
              >
                <Name className="!text-lg !font-semibold !text-white" />
                <Badge className="!bg-teal-400/20 !text-teal-300 !text-[10px] !px-1.5 !py-0.5 !rounded" />
              </Identity>
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              {address.slice(0, 8)}...{address.slice(-6)}
            </p>
          </div>
          
          <Link
            href={'/reputation/' + address}
            className="
              flex items-center gap-1.5
              px-3 py-1.5 rounded-full
              bg-white/5 hover:bg-white/10
              text-xs text-zinc-400 hover:text-white
              transition-all
            "
          >
            <User size={12} />
            Profile
          </Link>
        </div>

        {/* Quick stats row */}
        <div className="relative mt-4 pt-4 border-t border-white/5 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[10px] text-zinc-500">Network</p>
            <p className="text-xs font-medium text-teal-400">Base</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500">Status</p>
            <p className="text-xs font-medium text-green-400">Connected</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500">Farcaster</p>
            <a 
              href={'https://warpcast.com/~/profiles/' + address}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-purple-400 hover:text-purple-300 flex items-center justify-center gap-1"
            >
              Link
              <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}