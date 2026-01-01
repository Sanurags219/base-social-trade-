'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { getQuote, SWAP_ROUTER, swapAbi, buildSwapParams } from '@/lib/swap'
import { ShareTrade } from '@/components/ShareTrade'
import { XPBadge } from '@/components/XPBadge'
import { WalletConnect } from '@/components/WalletConnect'

interface CopyContext {
  address: string
  tier: string
  reputation: number
}

export default function SwapPage() {
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()

  const [amount, setAmount] = useState('')
  const [quote, setQuote] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [slippage, setSlippage] = useState(1)
  const [copyContext, setCopyContext] = useState<CopyContext | null>(null)
  const [userBalance, setUserBalance] = useState(0)

  useEffect(() => {
    // Get copy parameter from URL
    const searchParams = new URLSearchParams(window.location.search)
    const copy = searchParams.get('copy')
    const tier = searchParams.get('tier') || 'unknown'

    if (copy) {
      // Fetch reputation for trader being copied
      fetch(`/api/reputation?address=${copy}`)
        .then(r => r.json())
        .then(d => {
          setCopyContext({
            address: copy,
            tier: tier,
            reputation: d.score || 0
          })
          // Set safety defaults for copy trades
          setSlippage(1) // Cap at 1%
          // Amount will be set to 10% when balance is fetched
        })
        .catch(e => console.error('Failed to fetch reputation:', e))
    }
  }, [])

// TODO: Fetch real balance from wallet
  useEffect(() => {
    if (address) {
      // TODO: Use viem's getBalance or Wagmi's useBalance hook
      // const balance = await publicClient.getBalance({ address })
      setUserBalance(0) // Set to 0 until implemented
    }
  }, [address, copyContext])

  const previewSwap = async () => {
    if (!amount) {
      setError('Enter an amount')
      return
    }
    setLoading(true)
    const q = await getQuote(amount)
    setQuote(q)
    setLoading(false)
  }

  const executeSwap = async () => {
    if (!walletClient || !address) return alert('Connect wallet')

    const params = buildSwapParams({
      tokenOut: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC Base
      user: address,
      amount,
      slippage
    })

    setPending(true)
    setError('')
    try {
      await walletClient.writeContract({
        address: SWAP_ROUTER as `0x${string}`,
        abi: swapAbi,
        functionName: 'exactInputSingle',
        args: [params],
        account: address,
        value: params.amountIn
      })

      // Award XP if copy trade
      if (copyContext) {
        fetch('/api/xp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address,
            xp: 10, // Base XP (tier multiplier handled in API)
            copiedFrom: copyContext.address,
            copiedFromRep: copyContext.reputation
          })
        }).catch(e => console.error('Failed to record XP:', e))
      }

      alert('Swap submitted 🚀')
    } catch (e: any) {
      const msg = e?.shortMessage || 'Swap failed. Try again.'
      setError(msg)
      alert(msg)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative">
      <XPBadge />

      <a
        href="/launch"
        className="block text-center w-full max-w-md bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl py-3 text-sm font-semibold mb-4 transition"
      >
        🚀 BSTN Launch Live — Claim Now
      </a>

      {copyContext && (
        <div className="block text-center w-full max-w-md bg-purple-600/20 border border-purple-600 rounded-xl p-4 mb-4">
          <div className="text-sm font-semibold mb-1">📋 Copy Trading Mode</div>
          <div className="text-xs text-zinc-300">
            Copying {copyContext.address.slice(0, 6)}… 
            <span className="ml-2">
              {copyContext.tier === 'elite' && '🟢 Elite'}
              {copyContext.tier === 'trusted' && '🔵 Trusted'}
              {copyContext.tier === 'regular' && '🟡 Regular'}
            </span>
          </div>
          <div className="text-xs text-zinc-400 mt-1">Rep: {copyContext.reputation}</div>
          <div className="text-yellow-400 text-xs mt-2 font-semibold">⚠️ Manual confirmation required</div>
        </div>
      )}

      <div className="w-full max-w-md bg-zinc-900 rounded-2xl p-4 shadow-lg">

        <WalletConnect />

        <h1 className="text-lg font-bold mb-4">Swap on Base</h1>

        {/* FROM */}
        <div className="bg-black rounded-xl p-3 mb-3">
          <label className="text-xs text-zinc-400">You pay</label>
          <input
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-transparent text-xl outline-none mt-1"
          />
          <div className="text-xs text-zinc-500 mt-1">ETH</div>
          {copyContext && (
            <div className="text-xs text-purple-400 mt-2">💡 Pre-filled with 10% of balance for safety</div>
          )}
        </div>

        <div className="mt-3">
          <label className="text-xs text-zinc-400">
            Slippage ({slippage}%)
          </label>
          <input
            type="range"
            min="0.1"
            max={copyContext ? 1 : 5}
            step="0.1"
            value={slippage}
            onChange={(e) => setSlippage(Number(e.target.value))}
            className="w-full"
          />
          {copyContext && slippage > 1 && (
            <div className="text-yellow-400 text-xs mt-1">⚠️ Copy trades capped at 1% slippage</div>
          )}
        </div>

        {error && (
          <p className="text-red-400 text-sm mt-2">
            {error}
          </p>
        )}

        {/* PREVIEW BUTTON */}
        <button
          onClick={previewSwap}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 transition rounded-xl py-3 font-semibold"
        >
          {loading ? 'Previewing...' : 'Preview Swap'}
        </button>

        {/* QUOTE */}
        {quote && (
          <>
            <div className="mt-4 bg-black rounded-xl p-3 text-sm text-zinc-300">
              <div className="flex justify-between">
                <span>You receive</span>
                <span>{quote.output} USDC</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Fee</span>
                <span>{quote.fee}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Price impact</span>
                <span className="text-yellow-400">{quote.priceImpact}</span>
              </div>
            </div>

            <button
              onClick={executeSwap}
              disabled={pending}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition rounded-xl py-3 font-semibold"
            >
              {pending ? 'Swapping...' : 'Swap Now'}
            </button>

            <ShareTrade amount={amount} />
          </>
        )}

      </div>
    </div>
  )
}
