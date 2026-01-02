'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWalletClient, useChainId, useBalance, useReadContract } from 'wagmi'
import { formatEther, formatUnits, parseUnits } from 'viem'
import { AppShell } from '@/components/AppShell'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { WalletConnect } from '@/components/WalletConnect'
import { ShareTrade } from '@/components/ShareTrade'
import { buildSwapParams, buildTokenToEthParams, SWAP_ROUTER, WETH, swapAbi, erc20Abi, getQuote } from '@/lib/swap'

const TOKENS = [
  { symbol: 'USDC', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6, icon: '' },
  { symbol: 'WETH', address: '0x4200000000000000000000000000000000000006', decimals: 18, icon: '' },
  { symbol: 'DAI', address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', decimals: 18, icon: '' },
]

export default function SwapPage() {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const chainId = useChainId()

  const { data: balanceData, refetch: refetchBalance } = useBalance({
    address: address,
    chainId: 8453,
  })

  const [amount, setAmount] = useState('')
  const [selectedToken, setSelectedToken] = useState(TOKENS[0])
  const [slippage, setSlippage] = useState(0.5)
  const [quote, setQuote] = useState<{ output: string; priceImpact: string; fee: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [pending, setPending] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [isReversed, setIsReversed] = useState(false)
  const [approving, setApproving] = useState(false)

  const wrongNetwork = chainId !== 8453
  const ethBalance = balanceData ? Number(formatEther(balanceData.value)).toFixed(4) : '0.0000'
  const hasInsufficientBalance = !isReversed && balanceData && amount ? Number(amount) > Number(formatEther(balanceData.value)) : false

  // Get token balance for reversed swaps
  const { data: tokenBalance } = useReadContract({
    address: selectedToken.address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  // Get allowance for token swaps
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: selectedToken.address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address ? [address, SWAP_ROUTER as `0x${string}`] : undefined,
  })

  const tokenBalanceFormatted = tokenBalance 
    ? Number(formatUnits(tokenBalance as bigint, selectedToken.decimals)).toFixed(4) 
    : '0.0000'

  const needsApproval = isReversed && amount && allowance !== undefined
    ? parseUnits(amount, selectedToken.decimals) > (allowance as bigint)
    : false

  useEffect(() => {
    if (!amount || Number(amount) <= 0) {
      setQuote(null)
      return
    }

    const fetchQuote = async () => {
      setLoading(true)
      const q = await getQuote(amount, isReversed, selectedToken.decimals)
      setQuote(q)
      setLoading(false)
    }

    const timer = setTimeout(fetchQuote, 300)
    return () => clearTimeout(timer)
  }, [amount, selectedToken, isReversed])

  const handleSwapDirection = () => {
    setIsReversed(!isReversed)
    // Clear values when reversing
    setAmount('')
    setQuote(null)
  }

  const handleApprove = async () => {
    if (!walletClient || !address) return
    
    setApproving(true)
    setError('')
    
    try {
      const approveAmount = parseUnits(amount, selectedToken.decimals)
      const hash = await walletClient.writeContract({
        address: selectedToken.address as `0x${string}`,
        abi: erc20Abi,
        functionName: 'approve',
        args: [SWAP_ROUTER as `0x${string}`, approveAmount * 2n] // Approve 2x for buffer
      })
      
      // Wait a moment then refetch
      setTimeout(() => refetchAllowance(), 3000)
    } catch (e: any) {
      setError(e?.shortMessage || e?.message || 'Approval failed')
    } finally {
      setApproving(false)
    }
  }

  const handleSwap = async () => {
    if (!walletClient || !address || !amount) {
      setError('Connect wallet and enter amount')
      return
    }

    if (wrongNetwork) {
      setError('Please switch to Base network')
      return
    }

    setError('')
    setPending(true)
    setTxHash(null)

    try {
      if (isReversed) {
        // Token -> ETH swap
        const params = buildTokenToEthParams({
          tokenIn: selectedToken.address as `0x${string}`,
          user: address,
          amount,
          decimals: selectedToken.decimals
        })

        const hash = await walletClient.writeContract({
          address: SWAP_ROUTER as `0x${string}`,
          abi: swapAbi,
          functionName: 'exactInputSingle',
          args: [params]
        })

        setTxHash(hash)
      } else {
        // ETH -> Token swap
        const params = buildSwapParams({
          tokenOut: selectedToken.address as `0x${string}`,
          user: address,
          amount,
          slippage
        })

        const hash = await walletClient.writeContract({
          address: SWAP_ROUTER as `0x${string}`,
          abi: swapAbi,
          functionName: 'exactInputSingle',
          args: [params],
          value: params.amountIn
        })

        setTxHash(hash)
      }
      
      setAmount('')
      setQuote(null)
      setTimeout(() => {
        refetchBalance()
        refetchAllowance()
      }, 2000)
    } catch (e: any) {
      console.error('Swap failed:', e)
      setError(e?.shortMessage || e?.message || 'Swap failed')
    } finally {
      setPending(false)
    }
  }

  return (
    <AppShell>
      <WalletConnect />

      {wrongNetwork && isConnected && (
        <div className="mb-4 rounded-xl bg-red-900/30 border border-red-500/20 px-4 py-3 text-sm text-red-300">
           Wrong network. Please switch to Base.
        </div>
      )}

      <Card>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-zinc-400">
            {isReversed ? 'Swap tokens for ETH' : 'Swap ETH for tokens'}
          </p>
          <span className="text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded-full whitespace-nowrap">
            Base
          </span>
        </div>

        {/* Input - You Pay */}
        <div className="bg-black/50 rounded-xl p-4 mb-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-zinc-500">You pay</p>
            {isConnected && (
              <button
                onClick={() => setAmount(isReversed ? tokenBalanceFormatted : ethBalance)}
                className="text-xs text-zinc-400 hover:text-white transition"
              >
                Balance: <span className="text-blue-400">
                  {isReversed ? `${tokenBalanceFormatted} ${selectedToken.symbol}` : `${ethBalance} ETH`}
                </span>
              </button>
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="w-full bg-transparent text-2xl font-semibold outline-none text-white min-w-0"
              style={{ maxWidth: 'calc(100% - 100px)' }}
            />
            {isReversed ? (
              <select
                value={selectedToken.symbol}
                onChange={(e) => setSelectedToken(TOKENS.find(t => t.symbol === e.target.value) || TOKENS[0])}
                className="bg-zinc-800 rounded-xl px-3 py-2 text-sm font-medium outline-none cursor-pointer shrink-0"
              >
                {TOKENS.map((token) => (
                  <option key={token.symbol} value={token.symbol}>
                    {token.icon} {token.symbol}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-2 bg-zinc-800 rounded-xl px-3 py-2 shrink-0">
                <span></span>
                <span className="text-sm font-medium">ETH</span>
              </div>
            )}
          </div>
        </div>

        {/* Swap Direction Arrow */}
        <div className="flex justify-center -my-2 relative z-10">
          <button
            onClick={handleSwapDirection}
            className="bg-zinc-800 border-4 border-[#0B0F1A] rounded-xl p-2 hover:bg-zinc-700 active:scale-95 transition-all cursor-pointer"
            title="Swap direction"
          >
            <svg 
              className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${isReversed ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>

        {/* Output - You Receive */}
        <div className="bg-black/50 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-zinc-500">You receive</p>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="text-2xl font-semibold text-white min-w-0" style={{ maxWidth: 'calc(100% - 100px)' }}>
              {loading ? (
                <span className="text-zinc-500">...</span>
              ) : quote ? (
                <span className="truncate block">{quote.output}</span>
              ) : (
                <span className="text-zinc-600">0.0</span>
              )}
            </div>
            {isReversed ? (
              <div className="flex items-center gap-2 bg-zinc-800 rounded-xl px-3 py-2 shrink-0">
                <span></span>
                <span className="text-sm font-medium">ETH</span>
              </div>
            ) : (
              <select
                value={selectedToken.symbol}
                onChange={(e) => setSelectedToken(TOKENS.find(t => t.symbol === e.target.value) || TOKENS[0])}
                className="bg-zinc-800 rounded-xl px-3 py-2 text-sm font-medium outline-none cursor-pointer shrink-0"
              >
                {TOKENS.map((token) => (
                  <option key={token.symbol} value={token.symbol}>
                    {token.icon} {token.symbol}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Quote Details */}
        {quote && (
          <div className="bg-zinc-900/50 rounded-xl p-3 mb-4 text-xs space-y-2">
            <div className="flex justify-between text-zinc-400">
              <span>Price Impact</span>
              <span className="text-yellow-400">{quote.priceImpact}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Fee</span>
              <span>{quote.fee}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Slippage</span>
              <span>{slippage}%</span>
            </div>
          </div>
        )}

        {/* Slippage */}
        <div className="mb-4">
          <p className="text-xs text-zinc-500 mb-2">Slippage Tolerance</p>
          <div className="grid grid-cols-4 gap-2">
            {[0.1, 0.5, 1, 2].map((s) => (
              <button
                key={s}
                onClick={() => setSlippage(s)}
                className={`py-2.5 rounded-xl text-xs font-medium transition ${
                  slippage === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {s}%
              </button>
            ))}
          </div>
        </div>

        {/* Approval Button for Token -> ETH swaps */}
        {isReversed && needsApproval && (
          <button
            onClick={handleApprove}
            disabled={approving || !amount}
            className="w-full py-3 mb-3 rounded-xl text-sm font-semibold bg-gradient-to-b from-yellow-500 to-yellow-600 shadow-lg active:scale-[0.97] transition disabled:opacity-50"
          >
            {approving ? '⏳ Approving...' : `Approve ${selectedToken.symbol}`}
          </button>
        )}

        {/* Swap Button */}
        <Button
          onClick={handleSwap}
          disabled={!isConnected || !amount || pending || wrongNetwork || hasInsufficientBalance || (isReversed && needsApproval)}
        >
          {!isConnected
            ? 'Connect Wallet'
            : wrongNetwork
            ? 'Switch to Base'
            : hasInsufficientBalance
            ? `Insufficient ${isReversed ? selectedToken.symbol : 'ETH'} Balance`
            : pending
            ? ' Confirming...'
            : 'Swap'}
        </Button>

        {/* Error */}
        {error && (
          <div className="mt-3 p-3 rounded-xl bg-red-900/30 border border-red-500/20 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Success */}
        {txHash && (
          <div className="mt-3 p-3 rounded-xl bg-green-900/30 border border-green-500/20 text-xs text-green-300">
            <p className="font-medium mb-1"> Swap successful!</p>
            <a
              href={`https://basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline break-all"
            >
              View on Basescan 
            </a>
          </div>
        )}
      </Card>

      {/* Share Trade */}
      {txHash && amount && (
        <div className="mt-4">
          <ShareTrade amount={amount} />
        </div>
      )}

      {/* Info */}
      <div className="mt-4 text-xs text-zinc-500 text-center space-y-1">
        <p>Powered by Uniswap V3 on Base</p>
        <a
          href={`https://basescan.org/address/${SWAP_ROUTER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          Router Contract 
        </a>
      </div>
    </AppShell>
  )
}
