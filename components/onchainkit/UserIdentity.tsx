'use client'

import {
  Identity,
  Avatar,
  Name,
  Badge,
  Address,
  EthBalance,
  Socials,
  IdentityCard,
} from '@coinbase/onchainkit/identity'
import type { Address as AddressType } from 'viem'

interface UserIdentityProps {
  address: AddressType
  className?: string
  showAvatar?: boolean
  showName?: boolean
  showAddress?: boolean
  showBadge?: boolean
  showBalance?: boolean
  showSocials?: boolean
  hasCopyAddressOnClick?: boolean
}

export function UserIdentity({
  address,
  className,
  showAvatar = true,
  showName = true,
  showAddress = false,
  showBadge = true,
  showBalance = false,
  showSocials = false,
  hasCopyAddressOnClick = true,
}: UserIdentityProps) {
  return (
    <Identity
      address={address}
      className={className}
      hasCopyAddressOnClick={hasCopyAddressOnClick}
    >
      {showAvatar && <Avatar />}
      {showName && <Name />}
      {showBadge && <Badge />}
      {showAddress && <Address />}
      {showBalance && <EthBalance />}
      {showSocials && <Socials />}
    </Identity>
  )
}

// Compact identity display
interface CompactIdentityProps {
  address: AddressType
  className?: string
}

export function CompactIdentity({ address, className }: CompactIdentityProps) {
  return (
    <Identity address={address} className={`flex items-center gap-2 ${className}`}>
      <Avatar className="h-6 w-6" />
      <Name className="text-sm" />
      <Badge className="h-4 w-4" />
    </Identity>
  )
}

// Full identity card
interface IdentityCardDisplayProps {
  address: AddressType
  className?: string
}

export function IdentityCardDisplay({ address, className }: IdentityCardDisplayProps) {
  return (
    <div className={className}>
      <IdentityCard address={address} />
    </div>
  )
}

// Avatar only
interface AvatarOnlyProps {
  address: AddressType
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function AvatarOnly({ address, className, size = 'md' }: AvatarOnlyProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  }
  
  return (
    <Identity address={address}>
      <Avatar className={`${sizeClasses[size]} ${className}`} />
    </Identity>
  )
}

// Name with badge
interface NameWithBadgeProps {
  address: AddressType
  className?: string
}

export function NameWithBadge({ address, className }: NameWithBadgeProps) {
  return (
    <Identity address={address} className={`flex items-center gap-1 ${className}`}>
      <Name />
      <Badge />
    </Identity>
  )
}

// Full profile display
interface ProfileDisplayProps {
  address: AddressType
  className?: string
}

export function ProfileDisplay({ address, className }: ProfileDisplayProps) {
  return (
    <div className={`rounded-xl bg-zinc-900 p-4 ${className}`}>
      <Identity address={address} className="flex flex-col items-center gap-3">
        <Avatar className="h-20 w-20" />
        <div className="flex items-center gap-2">
          <Name className="text-xl font-bold" />
          <Badge />
        </div>
        <Address className="text-sm text-zinc-400" />
        <EthBalance className="text-lg font-semibold" />
        <Socials />
      </Identity>
    </div>
  )
}

// Socials display
interface SocialsDisplayProps {
  address: AddressType
  className?: string
}

export function SocialsDisplay({ address, className }: SocialsDisplayProps) {
  return (
    <Identity address={address} className={className}>
      <Socials />
    </Identity>
  )
}
