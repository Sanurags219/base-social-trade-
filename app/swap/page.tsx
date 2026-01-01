'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { getQuote, SWAP_ROUTER, swapAbi, buildSwapParams } from '@/lib/swap'
import { ShareTrade } from '@/components/ShareTrade'
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
  const [userXP, setUserXP] = useState(1240)

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const copy = searchParams.get('copy')
    const tier = searchParams.get('tier') || 'unknown'

    if (copy) {
      fetch(`/api/reputation?address=${copy}`)
        .then(r => r.json())
        .then(d => {
          setCopyContext({
            address: copy,
            tier: tier,
            reputation: d.score || 0
          })
          setSlippage(1)
        })
        .catch(e => console.error('Failed to fetch reputation:', e))
    }
  }, [])

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
      tokenOut: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
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

      if (copyContext) {
        fetch('/api/xp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address,
            xp: 10,
            copiedFrom: copyContext.address,
            copiedFromRep: copyContext.reputation
          })
        }).catch(e => console.error('Failed to record XP:', e))
      }

      alert('Swap submitted!')
    } catch (e: any) {
      const msg = e?.shortMessage || 'Swap failed. Try again.'
      setError(msg)
      alert(msg)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-start pt-8 p-4">
      {/* Launch Banner */}
      <a
        href="/launch"
        className="block text-center w-full max-w-md mb-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
      >
        🚀 BSTN Launch Live — Claim Now
      </a>

      {/* Main Card */}
      <div className="w-full max-w-md bg-[#0B0F1A] border border-[#1E293B] rounded-2xl p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_25px_60px_-20px_rgba(37,99,235,0.45)]">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-lg font-semibold tracking-tight">Swap</h1>
          <div className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/5 border border-white/10">
            XP · {userXP.toLocaleString()}
          </div>
        </div>

        <WalletConnect />

        {/* Copy Trading Banner */}
        {copyContext && (
          <div className="bg-purple-600/10 border border-purple-500/30 rounded-xl p-4 mb-4">
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

        {/* Input Box */}
        <div className="bg-black border border-[#1E293B] rounded-xl p-4 mb-4">
          <p className="text-xs text-zinc-400 mb-2">You pay</p>
          <div className="flex items-end justify-between">
            <input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-transparent text-3xl font-semibold outline-none w-full"
            />
            <span className="text-sm text-zinc-400 ml-2 pb-1">ETH</span>
          </div>
          {copyContext && (
            <div className="text-xs text-purple-400 mt-3">💡 Pre-filled with 10% of balance for safety</div>
          )}
        </div>

        {/* Slippage */}
        <div className="mb-4">
          <label className="text-xs text-zinc-400 block">
            Slippage · <span className="text-white">{slippage}%</span>
          </label>
          <input
            type="range"
            min="0.1"
            max={copyContext ? 1 : 5}
            step="0.1"
            value={slippage}
            onChange={(e) => setSlippage(Number(e.target.value))}
            className="w-full mt-2"
          />
          {copyContext && slippage > 1 && (
            <div className="text-yellow-400 text-xs mt-1">⚠️ Copy trades capped at 1% slippage</div>
          )}
        </div>

        {error && (
          <p className="text-red-400 text-sm mb-3">{error}</p>
        )}

        {/* Primary Button */}
        <button
          onClick={previewSwap}
          disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-semibold bg-gradient-to-b from-[#2563EB] to-[#1D4ED8] shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_15px_40px_-15px_rgba(37,99,235,0.9)] active:scale-[0.98] transition disabled:opacity-50"
        >
          {loading ? 'Previewing...' : 'Preview Swap'}
        </button>

        {/* Quote Result */}
        {quote && (
          <>
            <div className="mt-4 bg-black border border-[#1E293B] rounded-xl p-4 text-sm text-zinc-300">
              <div className="flex justify-between">
                <span>You receive</span>
                <span className="text-white font-medium">{quote.output} USDC</span>
              </div>
              <div className="flex justify-between mt-2">
                <span>Fee</span>
                <span>{quote.fee}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span>Price impact</span>
                <span className="text-yellow-400">{quote.priceImpact}</span>
              </div>
            </div>

            <button
              onClick={executeSwap}
              disabled={pending}
              className="w-full mt-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-b from-emerald-500 to-emerald-600 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_15px_40px_-15px_rgba(16,185,129,0.9)] active:scale-[0.98] transition disabled:opacity-50"
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
