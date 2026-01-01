import { publicClient } from '@/lib/base'

export default async function Home() {
  const block = await publicClient.getBlockNumber()

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div>
        <h1 className="text-xl font-bold">Base Connected</h1>
        <p className="text-zinc-400">Block: {block.toString()}</p>
      </div>
    </div>
  )
}
