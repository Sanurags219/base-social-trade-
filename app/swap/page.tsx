'use client'

import { useState } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { getQuote, SWAP_ROUTER, swapAbi, buildSwapParams } from '@/lib/swap'
import { ShareTrade } from '@/components/ShareTrade'
import { XPBadge } from '@/components/XPBadge'
import { WalletConnect } from '@/components/WalletConnect'

export default function SwapPage() {
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()
  const [amount, setAmount] = useState('')
  const [quote, setQuote] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [slippage, setSlippage] = useState(1)

  const previewSwap = async () => {
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
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative">
      <XPBadge />
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
        </div>

        <div className="mt-3">
          <label className="text-xs text-zinc-400">
            Slippage ({slippage}%)
          </label>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={slippage}
            onChange={(e) => setSlippage(Number(e.target.value))}
            className="w-full"
          />
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
