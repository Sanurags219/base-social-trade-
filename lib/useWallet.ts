import { useAccount } from 'wagmi'

export function useWallet() {
  const { address, isConnected, status } = useAccount()
  return { address, isConnected, status }
}
