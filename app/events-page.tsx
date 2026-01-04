import React from "react";

function XPOverview() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-blue-500/15 to-transparent border border-blue-500/30 p-4 mb-6">
      <p className="text-xs text-zinc-400">Your XP</p>
      <div className="text-3xl font-semibold mt-1">1,260</div>
      <div className="mt-2 text-xs text-zinc-400">Estimated BSTN airdrop share</div>
      <div className="text-sm text-blue-400 font-medium">~0.002%</div>
      <p className="text-[11px] text-zinc-500 mt-1">Final amount calculated at snapshot</p>
    </div>
  );
}

function ExclusiveEventCard({ title, description, reward, cta, claimed }: any) {
  return (
    <div
      className={`
        relative rounded-2xl p-4 mb-4
        border ${claimed ? "border-white/10" : "border-blue-500/30"}
        bg-gradient-to-b from-white/5 to-transparent
      `}
    >
      {!claimed && (
        <span className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
          Exclusive
        </span>
      )}
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-xs text-zinc-400 mt-1">{description}</p>
      <div className="flex gap-2 mt-3">
        {reward.map((r: string) => (
          <span
            key={r}
            className="text-xs px-2 py-1 rounded-full bg-yellow-500/15 text-yellow-400"
          >
            {r}
          </span>
        ))}
      </div>
      <button
        disabled={claimed}
        className={`
          mt-4 w-full py-2 rounded-xl text-sm
          ${claimed ? "bg-white/5 text-zinc-500" : "bg-blue-500 text-white"}
        `}
      >
        {claimed ? "Claimed" : cta}
      </button>
    </div>
  );
}

function ExclusiveEvents() {
  return (
    <>
      <h2 className="text-sm font-medium mb-3">Exclusive for You</h2>
      <ExclusiveEventCard
        title="Baseline Genesis"
        description="Mint the Genesis SBT and join the Baseline network."
        reward={["SBT", "+500 XP"]}
        cta="Claim Genesis"
        claimed={false}
      />
      <ExclusiveEventCard
        title="Copy Trade Challenge"
        description="Execute a $10+ copy trade on Base."
        reward={["+100 XP"]}
        cta="Claim XP"
        claimed={false}
      />
    </>
  );
}

function DailyEvent({ title, reward }: any) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white/3 mb-2">
      <div>
        <p className="text-sm">{title}</p>
        <p className="text-xs text-zinc-500">{reward}</p>
      </div>
      <button className="text-xs px-3 py-1 rounded-lg bg-blue-500/15 text-blue-400">Claim</button>
    </div>
  );
}

function DailyEvents() {
  return (
    <>
      <h2 className="text-sm font-medium mt-6 mb-3">Daily Rewards</h2>
      <DailyEvent title="Daily Onchain Check-in" reward="+50 XP" />
      <DailyEvent title="Share Baseline" reward="+50 XP" />
      <DailyEvent title="Any Base Transaction" reward="+10 XP" />
    </>
  );
}

export default function EventsPage() {
  return (
    <div className="pb-24">
      <XPOverview />
      <ExclusiveEvents />
      <DailyEvents />
    </div>
  );
}
