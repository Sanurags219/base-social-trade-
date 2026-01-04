'use client'

import { useState } from 'react'

interface PortfolioTabsProps {
  tabs: string[]
  activeTab: string
  onTabChange: (tab: string) => void
}

export function PortfolioTabs({ tabs, activeTab, onTabChange }: PortfolioTabsProps) {
  return (
    <div className="flex gap-2 px-4 overflow-x-auto scrollbar-hide pb-1">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`
            px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap
            transition-all duration-200
            ${activeTab === tab 
              ? 'bg-teal-400 text-black shadow-lg shadow-teal-400/20' 
              : 'bg-white/10 text-zinc-300 hover:bg-white/15'
            }
          `}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}