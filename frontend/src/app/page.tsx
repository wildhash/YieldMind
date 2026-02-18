'use client'

import { useEffect, useState } from 'react'
import ProtocolCard from '@/components/ProtocolCard'
import VaultStatus from '@/components/VaultStatus'
import RebalanceLog from '@/components/RebalanceLog'
import { Activity, Zap, TrendingUp } from 'lucide-react'

interface ProtocolData {
  name: string
  apy: number
  tvl: string
  riskScore: number
  isActive: boolean
}

interface RebalanceEvent {
  timestamp: string
  fromProtocol: string
  toProtocol: string
  amount: string
  reason: string
}

export default function Home() {
  const [protocols, setProtocols] = useState<ProtocolData[]>([])
  const [vaultBalance, setVaultBalance] = useState('0')
  const [aiStatus, setAiStatus] = useState('Analyzing...')
  const [rebalances, setRebalances] = useState<RebalanceEvent[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    // Fetch initial data
    fetchProtocolData()
    fetchVaultStatus()
    fetchRebalanceHistory()

    // Set up polling every 30 seconds
    const interval = setInterval(() => {
      fetchProtocolData()
      fetchVaultStatus()
      fetchRebalanceHistory()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const fetchProtocolData = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/protocols')
      const data = await response.json()
      setProtocols(data.protocols || [])
      setAiStatus(data.ai_status || 'Active')
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error fetching protocol data:', error)
    }
  }

  const fetchVaultStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/vault/status')
      const data = await response.json()
      setVaultBalance(data.balance || '0')
    } catch (error) {
      console.error('Error fetching vault status:', error)
    }
  }

  const fetchRebalanceHistory = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/rebalances')
      const data = await response.json()
      setRebalances(data.rebalances || [])
    } catch (error) {
      console.error('Error fetching rebalance history:', error)
    }
  }

  return (
    <main className="min-h-screen bg-dark-bg p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 terminal-border rounded-lg p-6 bg-dark-panel">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold terminal-text mb-2">
                <Zap className="inline mr-2" size={40} />
                YieldMind
              </h1>
              <p className="text-neon-lime opacity-70">AI DeFi Optimizer on BNB Chain</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="pulse-glow" size={20} />
                <span className="text-sm">AI Status: {aiStatus}</span>
              </div>
              <p className="text-xs opacity-50">
                Last Update: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* Vault Status */}
        <VaultStatus balance={vaultBalance} />

        {/* Protocol Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <TrendingUp className="mr-2" size={24} />
            Protocol APYs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {protocols.map((protocol, idx) => (
              <ProtocolCard key={idx} {...protocol} />
            ))}
          </div>
        </div>

        {/* Rebalance History */}
        <RebalanceLog rebalances={rebalances} />
      </div>
    </main>
  )
}
