'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWalletClient, useChainId, useBalance, useReadContract } from 'wagmi'
import { formatEther, formatUnits, parseUnits, encodeFunctionData } from 'viem'
import { AppShell } from '@/components/AppShell'
import { WalletConnect } from '@/components/WalletConnect'
import { ShareTrade } from '@/components/ShareTrade'
import { buildSwapParams, buildTokenToEthParams, SWAP_ROUTER, WETH, swapAbi, erc20Abi, getQuote } from '@/lib/swap'
import { ArrowDownUp, Zap, AlertCircle, ExternalLink, ChevronDown, Settings, Plus, X, Search } from 'lucide-react'

interface Token {
  symbol: string
  name: string
  address: string
  decimals: number
  color: string
}

const DEFAULT_TOKENS: Token[] = [
  { symbol: 'USDC', name: 'USD Coin', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6, color: '#2775CA' },
  { symbol: 'WETH', name: 'Wrapped Ether', address: '0x4200000000000000000000000000000000000006', decimals: 18, color: '#627EEA' },
  { symbol: 'DAI', name: 'Dai Stablecoin', address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', decimals: 18, color: '#F5AC37' },
  { symbol: 'USDbC', name: 'USD Base Coin', address: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', decimals: 6, color: '#2775CA' },
  { symbol: 'cbETH', name: 'Coinbase ETH', address: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22', decimals: 18, color: '#0052FF' },
  { symbol: 'AERO', name: 'Aerodrome', address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631', decimals: 18, color: '#0066FF' },
  { symbol: 'DEGEN', name: 'Degen', address: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', decimals: 18, color: '#A36EFD' },
  { symbol: 'BRETT', name: 'Brett', address: '0x532f27101965dd16442E59d40670FaF5eBB142E4', decimals: 18, color: '#0066CC' },
  { symbol: 'TOSHI', name: 'Toshi', address: '0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4', decimals: 18, color: '#FF6B35' },
  { symbol: 'HIGHER', name: 'Higher', address: '0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe', decimals: 18, color: '#00D632' },
]

const SLIPPAGE_PRESETS = [0.5, 1, 2, 5]

export default function SwapPage() {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const chainId = useChainId()

  const { data: balanceData, refetch: refetchBalance } = useBalance({
    address: address,
    chainId: 8453,
  })

  const [tokens, setTokens] = useState<Token[]>(DEFAULT_TOKENS)
  const [amount, setAmount] = useState('')
  const [lastSwapAmount, setLastSwapAmount] = useState('')
  const [selectedToken, setSelectedToken] = useState(tokens[0])
  const [slippage, setSlippage] = useState(0.5)
  const [customSlippage, setCustomSlippage] = useState('')
  const [quote, setQuote] = useState<{ output: string; priceImpact: string; fee: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [pending, setPending] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [isReversed, setIsReversed] = useState(false)
  const [approving, setApproving] = useState(false)
  const [showTokenSelect, setShowTokenSelect] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showAddToken, setShowAddToken] = useState(false)
  const [newTokenAddress, setNewTokenAddress] = useState('')
  const [tokenSearch, setTokenSearch] = useState('')
  const [addingToken, setAddingToken] = useState(false)

  const wrongNetwork = chainId !== 8453
  const ethBalance = balanceData ? Number(formatEther(balanceData.value)).toFixed(4) : '0.0000'
  const hasInsufficientBalance = !isReversed && balanceData && amount ? Number(amount) > Number(formatEther(balanceData.value)) : false

  const { data: tokenBalance } = useReadContract({
    address: selectedToken.address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

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

  const hasInsufficientTokenBalance = isReversed && tokenBalance && amount
    ? parseUnits(amount, selectedToken.decimals) > (tokenBalance as bigint)
    : false

  // Load custom tokens from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('custom_tokens')
    if (stored) {
      const custom = JSON.parse(stored) as Token[]
      setTokens([...DEFAULT_TOKENS, ...custom])
    }
  }, [])

  useEffect(() => {
    if (!amount || Number(amount) <= 0) {
      setQuote(null)
      return
    }

    const fetchQuote = async () => {
      setLoading(true)
      const q = await getQuote(amount, isReversed, selectedToken.decimals, selectedToken.address)
      setQuote(q)
      setLoading(false)
    }

    const timer = setTimeout(fetchQuote, 300)
    return () => clearTimeout(timer)
  }, [amount, selectedToken, isReversed])

  const handleSwapDirection = () => {
    setIsReversed(!isReversed)
    setAmount('')
    setQuote(null)
  }

  const handleApprove = async () => {
    if (!walletClient || !address) return
    
    setApproving(true)
    setError('')
    
    try {
      const approveAmount = parseUnits(amount, selectedToken.decimals)
      await walletClient.writeContract({
        address: selectedToken.address as `0x${string}`,
        abi: erc20Abi,
        functionName: 'approve',
        args: [SWAP_ROUTER as `0x${string}`, approveAmount * 10n]
      })
      
      setTimeout(() => refetchAllowance(), 5000)
    } catch (e: any) {
      console.error('Approval error:', e)
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

    if (isReversed) {
      if (hasInsufficientTokenBalance) {
        setError('Insufficient ' + selectedToken.symbol + ' balance')
        return
      }
      if (needsApproval) {
        setError('Please approve ' + selectedToken.symbol + ' first')
        return
      }
    } else {
      if (hasInsufficientBalance) {
        setError('Insufficient ETH balance')
        return
      }
    }

    setError('')
    setPending(true)
    setTxHash(null)
    const swapAmount = amount

    try {
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1800)

      if (isReversed) {
        // Token -> ETH swap
        // Need to: 1) swap token to WETH, 2) unwrap WETH to ETH
        const params = buildTokenToEthParams({
          tokenIn: selectedToken.address as `0x${string}`,
          user: SWAP_ROUTER as `0x${string}`, // Send WETH to router first
          amount,
          decimals: selectedToken.decimals
        })

        const swapData = encodeFunctionData({
          abi: swapAbi,
          functionName: 'exactInputSingle',
          args: [params]
        })

        // Unwrap WETH to ETH and send to user
        const unwrapData = encodeFunctionData({
          abi: swapAbi,
          functionName: 'unwrapWETH9',
          args: [0n, address]
        })

        const hash = await walletClient.writeContract({
          address: SWAP_ROUTER as `0x${string}`,
          abi: swapAbi,
          functionName: 'multicall',
          args: [deadline, [swapData, unwrapData]]
        })

        setTxHash(hash)
        setLastSwapAmount(swapAmount)
      } else {
        // ETH -> Token swap
        const params = buildSwapParams({
          tokenOut: selectedToken.address as `0x${string}`,
          user: address,
          amount,
          slippage
        })

        const swapData = encodeFunctionData({
          abi: swapAbi,
          functionName: 'exactInputSingle',
          args: [params]
        })

        // Refund any unused ETH
        const refundData = encodeFunctionData({
          abi: swapAbi,
          functionName: 'refundETH',
          args: []
        })

        const hash = await walletClient.writeContract({
          address: SWAP_ROUTER as `0x${string}`,
          abi: swapAbi,
          functionName: 'multicall',
          args: [deadline, [swapData, refundData]],
          value: params.amountIn
        })

        setTxHash(hash)
        setLastSwapAmount(swapAmount)
      }
      
      setAmount('')
      setQuote(null)
      
      // Track transaction count for events reward
      if (address) {
        const currentCount = parseInt(localStorage.getItem('tx_count_' + address) || '0')
        localStorage.setItem('tx_count_' + address, String(currentCount + 1))
      }
      
      setTimeout(() => {
        refetchBalance()
        refetchAllowance()
      }, 3000)
    } catch (e: any) {
      console.error('Swap failed:', e)
      const msg = e?.shortMessage || e?.message || 'Swap failed'
      if (msg.includes('STF')) {
        setError('Transfer failed. Please check token balance and approval.')
      } else if (msg.includes('insufficient')) {
        setError('Insufficient balance for swap')
      } else if (msg.includes('user rejected') || msg.includes('denied')) {
        setError('Transaction cancelled')
      } else {
        setError(msg)
      }
    } finally {
      setPending(false)
    }
  }

  const setAmountPercent = (percent: number) => {
    if (isReversed) {
      const val = (Number(tokenBalanceFormatted) * percent / 100).toFixed(4)
      setAmount(val)
    } else {
      const max = Math.max(0, Number(ethBalance) - 0.001)
      const val = (max * percent / 100).toFixed(4)
      setAmount(val)
    }
  }

  const handleAddToken = async () => {
    if (!newTokenAddress || !newTokenAddress.startsWith('0x') || newTokenAddress.length !== 42) {
      setError('Invalid token address')
      return
    }

    setAddingToken(true)
    setError('')

    try {
      // Fetch token info using ERC20 calls
      const response = await fetch('/api/token-info?address=' + newTokenAddress)
      
      let tokenInfo: Token
      
      if (response.ok) {
        const data = await response.json()
        tokenInfo = {
          symbol: data.symbol || 'UNKNOWN',
          name: data.name || 'Unknown Token',
          address: newTokenAddress,
          decimals: data.decimals || 18,
          color: '#' + newTokenAddress.slice(2, 8)
        }
      } else {
        // Fallback - add with defaults
        tokenInfo = {
          symbol: 'TOKEN',
          name: 'Custom Token',
          address: newTokenAddress,
          decimals: 18,
          color: '#' + newTokenAddress.slice(2, 8)
        }
      }

      // Check if already exists
      if (tokens.some(t => t.address.toLowerCase() === newTokenAddress.toLowerCase())) {
        setError('Token already added')
        setAddingToken(false)
        return
      }

      const newTokens = [...tokens, tokenInfo]
      setTokens(newTokens)
      
      // Save custom tokens to localStorage
      const customTokens = newTokens.filter(t => !DEFAULT_TOKENS.some(d => d.address === t.address))
      localStorage.setItem('custom_tokens', JSON.stringify(customTokens))
      
      setSelectedToken(tokenInfo)
      setNewTokenAddress('')
      setShowAddToken(false)
      setShowTokenSelect(false)
    } catch (e) {
      console.error('Add token error:', e)
      setError('Failed to add token')
    } finally {
      setAddingToken(false)
    }
  }

  const filteredTokens = tokens.filter(t => 
    t.symbol.toLowerCase().includes(tokenSearch.toLowerCase()) ||
    t.name.toLowerCase().includes(tokenSearch.toLowerCase()) ||
    t.address.toLowerCase().includes(tokenSearch.toLowerCase())
  )

  const effectiveSlippage = customSlippage ? parseFloat(customSlippage) : slippage

  return (
    <AppShell>
      <main className="bg-[#05060A] min-h-screen pb-24">
        <WalletConnect />

        {/* Header */}
        <div className="px-4 pt-4 pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">Swap</h1>
            <p className="text-sm text-zinc-400 mt-1">Trade tokens on Base</p>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition"
          >
            <Settings size={18} className="text-zinc-400" />
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mx-4 mb-4 rounded-xl bg-[#0E1F24] border border-white/10 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white">Slippage Tolerance</span>
              <button onClick={() => setShowSettings(false)}>
                <X size={16} className="text-zinc-500" />
              </button>
            </div>
            
            <div className="flex gap-2 mb-3">
              {SLIPPAGE_PRESETS.map(val => (
                <button
                  key={val}
                  onClick={() => { setSlippage(val); setCustomSlippage('') }}
                  className={'flex-1 py-2 rounded-lg text-xs font-medium transition ' + 
                    (slippage === val && !customSlippage 
                      ? 'bg-teal-500 text-black' 
                      : 'bg-white/5 text-zinc-400 hover:bg-white/10')}
                >
                  {val}%
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={customSlippage}
                onChange={(e) => setCustomSlippage(e.target.value)}
                placeholder="Custom"
                className="flex-1 bg-white/5 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-teal-500"
              />
              <span className="text-sm text-zinc-500">%</span>
            </div>
            
            {effectiveSlippage > 5 && (
              <p className="text-xs text-yellow-400 mt-2">High slippage may result in unfavorable trades</p>
            )}
          </div>
        )}

        {wrongNetwork && isConnected && (
          <div className="mx-4 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400" />
            <span className="text-sm text-red-300">Wrong network. Please switch to Base.</span>
          </div>
        )}

        {/* Swap Card */}
        <div className="mx-4">
          <div className="relative rounded-2xl bg-gradient-to-b from-[#0E1F24] to-[#071317] border border-white/10 overflow-hidden">
            <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.08),transparent_60%)] pointer-events-none" />
            
            <div className="relative p-4 space-y-3">
              {/* From Section */}
              <div className="rounded-xl bg-white/5 p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-zinc-500">From</span>
                  <span className="text-xs text-zinc-500">
                    Balance: {isReversed ? tokenBalanceFormatted : ethBalance}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    className="flex-1 bg-transparent text-2xl font-semibold text-white outline-none placeholder-zinc-600"
                    disabled={pending}
                  />
                  
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: isReversed ? selectedToken.color : '#627EEA' }}
                    >
                      {isReversed ? selectedToken.symbol[0] : 'E'}
                    </div>
                    <span className="text-sm font-medium text-white">
                      {isReversed ? selectedToken.symbol : 'ETH'}
                    </span>
                  </div>
                </div>

                {/* Amount Presets */}
                <div className="flex gap-2 mt-3">
                  {[25, 50, 75, 100].map(pct => (
                    <button
                      key={pct}
                      onClick={() => setAmountPercent(pct)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-zinc-400 hover:bg-teal-500/20 hover:text-teal-400 transition"
                    >
                      {pct === 100 ? 'MAX' : pct + '%'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Swap Direction Button */}
              <div className="flex justify-center -my-1 relative z-10">
                <button
                  onClick={handleSwapDirection}
                  className="w-10 h-10 rounded-full bg-[#0E1F24] border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors"
                >
                  <ArrowDownUp size={18} className="text-teal-400" />
                </button>
              </div>

              {/* To Section */}
              <div className="rounded-xl bg-white/5 p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-zinc-500">To (estimated)</span>
                  <span className="text-xs text-zinc-500">Slippage: {effectiveSlippage}%</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex-1 text-2xl font-semibold text-zinc-300">
                    {loading ? <span className="text-zinc-500">...</span> : quote?.output || '0.0'}
                  </div>
                  
                  {!isReversed ? (
                    <button
                      onClick={() => setShowTokenSelect(!showTokenSelect)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 transition"
                    >
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ backgroundColor: selectedToken.color }}
                      >
                        {selectedToken.symbol[0]}
                      </div>
                      <span className="text-sm font-medium text-white">{selectedToken.symbol}</span>
                      <ChevronDown size={14} className="text-zinc-400" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10">
                      <div className="w-6 h-6 rounded-full bg-[#627EEA] flex items-center justify-center text-xs font-bold text-white">E</div>
                      <span className="text-sm font-medium text-white">ETH</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Token Selector Modal */}
              {showTokenSelect && !isReversed && (
                <div className="absolute inset-x-4 top-4 bottom-4 rounded-xl bg-[#0A1215] border border-white/10 z-30 flex flex-col">
                  <div className="p-4 border-b border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-white">Select Token</span>
                      <button onClick={() => { setShowTokenSelect(false); setShowAddToken(false) }}>
                        <X size={18} className="text-zinc-500" />
                      </button>
                    </div>
                    
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="text"
                        value={tokenSearch}
                        onChange={(e) => setTokenSearch(e.target.value)}
                        placeholder="Search by name or paste address"
                        className="w-full bg-white/5 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-2">
                    {filteredTokens.map(token => (
                      <button
                        key={token.address}
                        onClick={() => {
                          setSelectedToken(token)
                          setShowTokenSelect(false)
                          setTokenSearch('')
                        }}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition"
                      >
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                          style={{ backgroundColor: token.color }}
                        >
                          {token.symbol[0]}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-white">{token.symbol}</p>
                          <p className="text-xs text-zinc-500">{token.name}</p>
                        </div>
                        {selectedToken.address === token.address && (
                          <div className="w-2 h-2 rounded-full bg-teal-400" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Add Custom Token */}
                  <div className="p-4 border-t border-white/10">
                    {showAddToken ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={newTokenAddress}
                          onChange={(e) => setNewTokenAddress(e.target.value)}
                          placeholder="0x... token contract address"
                          className="w-full bg-white/5 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowAddToken(false)}
                            className="flex-1 py-2 rounded-lg text-sm bg-white/5 text-zinc-400"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleAddToken}
                            disabled={addingToken}
                            className="flex-1 py-2 rounded-lg text-sm bg-teal-500 text-black font-medium disabled:opacity-50"
                          >
                            {addingToken ? 'Adding...' : 'Add Token'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowAddToken(true)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/5 text-sm text-zinc-400 hover:text-white hover:bg-white/10 transition"
                      >
                        <Plus size={16} />
                        Add Custom Token
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Quote Info */}
              {quote && (
                <div className="rounded-xl bg-white/5 p-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Price Impact</span>
                    <span className="text-green-400">{quote.priceImpact}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Pool Fee</span>
                    <span className="text-zinc-300">{quote.fee}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Slippage</span>
                    <span className="text-zinc-300">{effectiveSlippage}%</span>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 flex items-start gap-2">
                  <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-red-300">{error}</span>
                </div>
              )}

              {/* Balance Warning */}
              {(hasInsufficientBalance || hasInsufficientTokenBalance) && !error && (
                <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-3 flex items-center gap-2">
                  <AlertCircle size={16} className="text-yellow-400" />
                  <span className="text-sm text-yellow-300">
                    Insufficient {isReversed ? selectedToken.symbol : 'ETH'} balance
                  </span>
                </div>
              )}

              {/* Approve Button */}
              {isReversed && needsApproval && (
                <button
                  onClick={handleApprove}
                  disabled={approving || !amount}
                  className="w-full py-4 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/15 text-white transition disabled:opacity-50"
                >
                  {approving ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Approving...
                    </span>
                  ) : (
                    'Approve ' + selectedToken.symbol
                  )}
                </button>
              )}

              {/* Swap Button */}
              <button
                onClick={handleSwap}
                disabled={
                  pending || 
                  !isConnected || 
                  !amount || 
                  hasInsufficientBalance || 
                  hasInsufficientTokenBalance ||
                  wrongNetwork ||
                  (isReversed && needsApproval)
                }
                className="w-full py-4 rounded-xl text-sm font-semibold bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 text-black transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!isConnected ? (
                  'Connect Wallet'
                ) : pending ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Swapping...
                  </span>
                ) : wrongNetwork ? (
                  'Switch to Base'
                ) : hasInsufficientBalance || hasInsufficientTokenBalance ? (
                  'Insufficient Balance'
                ) : isReversed && needsApproval ? (
                  'Approve First'
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Zap size={16} />
                    Swap
                  </span>
                )}
              </button>

              {/* Transaction Link */}
              {txHash && (
                <a
                  href={'https://basescan.org/tx/' + txHash}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-sm text-green-400 hover:bg-green-500/20 transition"
                >
                  <ExternalLink size={14} />
                  View Transaction on BaseScan
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Share Trade */}
        {txHash && lastSwapAmount && (
          <div className="mx-4 mt-4">
            <ShareTrade amount={lastSwapAmount} />
          </div>
        )}

        {/* Info Card */}
        <div className="mx-4 mt-6">
          <div className="rounded-xl bg-white/5 border border-white/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center">
                <Zap size={16} className="text-teal-400" />
              </div>
              <span className="text-sm font-medium text-white">Uniswap V3 on Base</span>
            </div>
            <p className="text-xs text-zinc-500">
              Swaps executed through Uniswap V3 pools. {tokens.length} tokens available. Add custom tokens by contract address.
            </p>
          </div>
        </div>
      </main>
    </AppShell>
  )
}