'use client'

import { Signature } from '@coinbase/onchainkit/signature'
import type { LifecycleStatus } from '@coinbase/onchainkit/signature'
import { useCallback, useState } from 'react'
import type { Address, Hex } from 'viem'

interface SignMessageProps {
  message: string
  className?: string
  onSign?: (signature: Hex) => void
  onStatus?: (status: LifecycleStatus) => void
}

export function SignMessage({
  message,
  className,
  onSign,
  onStatus,
}: SignMessageProps) {
  const [signature, setSignature] = useState<Hex | null>(null)
  
  const handleStatus = useCallback((status: LifecycleStatus) => {
    console.log('Signature status:', status)
    onStatus?.(status)
    
    if (status.statusName === 'success' && status.statusData && 'signature' in status.statusData) {
      setSignature(status.statusData.signature as Hex)
      onSign?.(status.statusData.signature as Hex)
    }
  }, [onSign, onStatus])

  return (
    <div className={className}>
      <Signature
        message={message}
        onStatus={handleStatus}
      />
      {signature && (
        <div className="mt-4 p-3 bg-zinc-800 rounded-lg">
          <p className="text-xs text-zinc-400 mb-1">Signature:</p>
          <p className="text-xs font-mono text-green-400 break-all">{signature}</p>
        </div>
      )}
    </div>
  )
}

// Sign typed data (EIP-712)
interface SignTypedDataProps {
  domain: {
    name: string
    version: string
    chainId: number
    verifyingContract: Address
  }
  types: Record<string, readonly { name: string; type: string }[]>
  primaryType: string
  message: Record<string, unknown>
  className?: string
  onSign?: (signature: Hex) => void
  onStatus?: (status: LifecycleStatus) => void
}

export function SignTypedData({
  domain,
  types,
  primaryType,
  message,
  className,
  onSign,
  onStatus,
}: SignTypedDataProps) {
  const [signature, setSignature] = useState<Hex | null>(null)
  
  const handleStatus = useCallback((status: LifecycleStatus) => {
    console.log('Typed data signature status:', status)
    onStatus?.(status)
    
    if (status.statusName === 'success' && status.statusData && 'signature' in status.statusData) {
      setSignature(status.statusData.signature as Hex)
      onSign?.(status.statusData.signature as Hex)
    }
  }, [onSign, onStatus])

  return (
    <div className={className}>
      <Signature
        domain={domain}
        types={types as any}
        primaryType={primaryType}
        message={message}
        onStatus={handleStatus}
      />
      {signature && (
        <div className="mt-4 p-3 bg-zinc-800 rounded-lg">
          <p className="text-xs text-zinc-400 mb-1">Signature:</p>
          <p className="text-xs font-mono text-green-400 break-all">{signature}</p>
        </div>
      )}
    </div>
  )
}

// Verify signature - uses viem directly since SignatureVerification is not available
interface VerifySignatureProps {
  message: string
  signature: Hex
  address: Address
  className?: string
  onVerified?: (isValid: boolean) => void
}

export function VerifySignature({
  message,
  signature,
  address,
  className,
  onVerified,
}: VerifySignatureProps) {
  // Note: For signature verification, use viem's verifyMessage directly
  // This component is a placeholder that shows the verification data
  return (
    <div className={`rounded-lg bg-zinc-800 p-4 ${className}`}>
      <h4 className="text-sm font-medium text-white mb-2">Signature Verification</h4>
      <div className="space-y-2 text-xs">
        <div>
          <span className="text-zinc-400">Message: </span>
          <span className="text-white">{message}</span>
        </div>
        <div>
          <span className="text-zinc-400">Address: </span>
          <span className="text-white font-mono">{address}</span>
        </div>
        <div>
          <span className="text-zinc-400">Signature: </span>
          <span className="text-white font-mono break-all">{signature.slice(0, 20)}...</span>
        </div>
      </div>
    </div>
  )
}

// Agreement signing component
interface AgreementSignProps {
  agreementText: string
  agreementTitle?: string
  className?: string
  onSigned?: (signature: Hex) => void
}

export function AgreementSign({
  agreementText,
  agreementTitle = 'Terms Agreement',
  className,
  onSigned,
}: AgreementSignProps) {
  const [signed, setSigned] = useState(false)
  
  const handleSign = useCallback((signature: Hex) => {
    setSigned(true)
    onSigned?.(signature)
  }, [onSigned])

  return (
    <div className={`rounded-xl bg-zinc-900 p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-2">{agreementTitle}</h3>
      <div className="text-sm text-zinc-400 mb-4 max-h-40 overflow-y-auto">
        {agreementText}
      </div>
      {signed ? (
        <div className="flex items-center gap-2 text-green-400">
          <span>✓</span>
          <span>Signed</span>
        </div>
      ) : (
        <SignMessage
          message={`I agree to: ${agreementText}`}
          onSign={handleSign}
        />
      )}
    </div>
  )
}
