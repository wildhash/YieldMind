'use client'

import { useEffect, useState } from 'react'
import ProtocolCard from '@/components/ProtocolCard'
import VaultStatus from '@/components/VaultStatus'
import RebalanceLog from '@/components/RebalanceLog'
import { Activity, Zap, TrendingUp } from 'lucide-react'
import { BACKEND_URL } from '@/lib/constants'

interface ProtocolData {
  name: string
  apy: number
  tvl: string
  riskScore: number
  isActive: boolean
}

type BackendProtocolData = {
  name: string
  apy: number
  tvl: string
  risk_score?: number
  riskScore?: number
  is_active?: boolean
  isActive?: boolean
}

interface RebalanceEvent {
  timestamp: string
  fromProtocol: string
  toProtocol: string
  amount: string
  reason: string
}

type BackendRebalanceEvent = {
  timestamp: string
  from_protocol?: string
  fromProtocol?: string
  to_protocol?: string
  toProtocol?: string
  amount: string
  reason: string
}

export default function Home() {
  const [protocols, setProtocols] = useState<ProtocolData[]>([])
  const [vaultBalance, setVaultBalance] = useState('0')
  const [currentProtocol, setCurrentProtocol] = useState<string | undefined>(undefined)
  const [aiStatus, setAiStatus] = useState('Analyzing...')
  const [rebalances, setRebalances] = useState<RebalanceEvent[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [now, setNow] = useState<Date>(new Date())
  const [isTriggeringCycle, setIsTriggeringCycle] = useState(false)
  const [triggerError, setTriggerError] = useState<string | null>(null)

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

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
      const response = await fetch(`${BACKEND_URL}/api/protocols`)
      const data = (await response.json()) as {
        protocols?: BackendProtocolData[]
        ai_status?: string
      }

      const mapped: ProtocolData[] = (data.protocols || []).map((p) => ({
        name: p.name,
        apy: p.apy,
        tvl: p.tvl,
        riskScore: p.risk_score ?? p.riskScore ?? 0,
        isActive: p.is_active ?? p.isActive ?? false,
      }))

      setProtocols(mapped)
      setAiStatus(data.ai_status || 'Active')
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error fetching protocol data:', error)
    }
  }

  const fetchVaultStatus = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/vault/status`)
      const data = await response.json()
      setVaultBalance(data.balance || '0')
      setCurrentProtocol(data.current_protocol || data.currentProtocol)
    } catch (error) {
      console.error('Error fetching vault status:', error)
    }
  }

  const fetchRebalanceHistory = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/rebalances`)
      const data = (await response.json()) as {
        rebalances?: BackendRebalanceEvent[]
      }
      const mapped: RebalanceEvent[] = (data.rebalances || []).map((r) => ({
        timestamp: r.timestamp,
        fromProtocol: r.from_protocol ?? r.fromProtocol ?? '',
        toProtocol: r.to_protocol ?? r.toProtocol ?? '',
        amount: r.amount,
        reason: r.reason,
      }))
      setRebalances(mapped)
    } catch (error) {
      console.error('Error fetching rebalance history:', error)
    }
  }

  const triggerCycle = async () => {
    try {
      setIsTriggeringCycle(true)
      setTriggerError(null)
      const response = await fetch(`${BACKEND_URL}/api/trigger-cycle`, { method: 'POST' })

      if (!response.ok) {
        setTriggerError(`Backend returned ${response.status}`)
        return
      }

      await fetchProtocolData()
      await fetchVaultStatus()
      await fetchRebalanceHistory()
    } catch (error) {
      console.error('Error triggering AI cycle:', error)
      setTriggerError('Failed to trigger AI cycle')
    } finally {
      setIsTriggeringCycle(false)
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
              <p className="text-xs opacity-50 mb-3">{now.toUTCString().replace('GMT', 'UTC')}</p>
              <button
                onClick={triggerCycle}
                disabled={isTriggeringCycle}
                className={`glow-button terminal-border rounded px-4 py-2 text-sm font-bold w-full ${
                  isTriggeringCycle ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isTriggeringCycle ? 'Running cycle...' : 'Run cycle now'}
              </button>
              {triggerError ? (
                <p className="text-xs text-red-400 mt-2">{triggerError}</p>
              ) : null}
              <p className="text-xs opacity-50">
                Last Update: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* Vault Status */}
        <VaultStatus balance={vaultBalance} currentProtocol={currentProtocol} />

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
