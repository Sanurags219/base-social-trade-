'use client'

import { useState } from 'react'
import { AppShell } from '@/components/AppShell'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { WalletConnect } from '@/components/WalletConnect'

export default function SwapPage() {
  const [amount, setAmount] = useState('')

  return (
    <AppShell>
      <WalletConnect />

      <Card>
        <p className="text-sm text-zinc-400 mb-2">You pay</p>

        <div className="flex items-end justify-between mb-4">
          <Input
            value={amount}
            onChange={setAmount}
            placeholder="0.0"
          />
          <span className="text-sm text-zinc-400 ml-2">ETH</span>
        </div>

        <Button>
          Preview Swap
        </Button>
      </Card>
    </AppShell>
  )
}
