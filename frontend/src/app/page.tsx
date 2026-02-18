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
  const [isTriggeringCycle, setIsTriggeringCycle] = useState(false)
  const [triggerError, setTriggerError] = useState<string | null>(null)
  const [triggerMessage, setTriggerMessage] = useState<string | null>(null)

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

  const fetchProtocolData = async (options: { throwOnError?: boolean } = {}) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/protocols`)
      const raw = (await response.json()) as unknown
      if (!raw || typeof raw !== 'object') {
        throw new Error('Unexpected /api/protocols response')
      }

      const data = raw as Record<string, unknown>
      const protocolsRaw = data.protocols
      const aiStatusRaw = data.ai_status

      const backendProtocols: BackendProtocolData[] = Array.isArray(protocolsRaw)
        ? (protocolsRaw as BackendProtocolData[])
        : []
      const backendStatus = typeof aiStatusRaw === 'string' ? aiStatusRaw : undefined

      const mapped: ProtocolData[] = backendProtocols.map((p) => ({
        name: typeof p.name === 'string' ? p.name : 'Unknown',
        apy: typeof p.apy === 'number' ? p.apy : 0,
        tvl:
          typeof p.tvl === 'string'
            ? p.tvl
            : String((p as unknown as Record<string, unknown>).tvl ?? '0'),
        riskScore: p.risk_score ?? p.riskScore ?? 0,
        isActive: p.is_active ?? p.isActive ?? false,
      }))

      setProtocols(mapped)
      setAiStatus(backendStatus || 'Active')
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error fetching protocol data:', error)
      if (options.throwOnError) {
        throw error
      }
    }
  }

  const fetchVaultStatus = async (options: { throwOnError?: boolean } = {}) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/vault/status`)
      const raw = (await response.json()) as unknown
      if (!raw || typeof raw !== 'object') {
        throw new Error('Unexpected /api/vault/status response')
      }

      const data = raw as Record<string, unknown>
      const balanceRaw = data.balance
      const currentProtocolRaw = data.current_protocol ?? data.currentProtocol

      setVaultBalance(typeof balanceRaw === 'string' ? balanceRaw : String(balanceRaw ?? '0'))
      setCurrentProtocol(typeof currentProtocolRaw === 'string' ? currentProtocolRaw : undefined)
    } catch (error) {
      console.error('Error fetching vault status:', error)
      if (options.throwOnError) {
        throw error
      }
    }
  }

  const fetchRebalanceHistory = async (options: { throwOnError?: boolean } = {}) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/rebalances`)
      const raw = (await response.json()) as unknown
      if (!raw || typeof raw !== 'object') {
        throw new Error('Unexpected /api/rebalances response')
      }

      const data = raw as Record<string, unknown>
      const rebalancesRaw = data.rebalances
      const backendRebalances: BackendRebalanceEvent[] = Array.isArray(rebalancesRaw)
        ? (rebalancesRaw as BackendRebalanceEvent[])
        : []

      const mapped: RebalanceEvent[] = backendRebalances.map((r) => ({
        timestamp: typeof r.timestamp === 'string' ? r.timestamp : '',
        fromProtocol: r.from_protocol ?? r.fromProtocol ?? '',
        toProtocol: r.to_protocol ?? r.toProtocol ?? '',
        amount: typeof r.amount === 'string' ? r.amount : String(r.amount ?? ''),
        reason: typeof r.reason === 'string' ? r.reason : '',
      }))
      setRebalances(mapped)
    } catch (error) {
      console.error('Error fetching rebalance history:', error)
      if (options.throwOnError) {
        throw error
      }
    }
  }

  const triggerCycle = async () => {
    try {
      setIsTriggeringCycle(true)
      setTriggerError(null)
      setTriggerMessage(null)
      const response = await fetch(`${BACKEND_URL}/api/trigger-cycle`, { method: 'POST' })

      if (!response.ok) {
        setTriggerError(`Backend returned ${response.status}`)
        return
      }

      try {
        await Promise.all([
          fetchProtocolData({ throwOnError: true }),
          fetchVaultStatus({ throwOnError: true }),
          fetchRebalanceHistory({ throwOnError: true }),
        ])
        setTriggerMessage('Cycle triggered and dashboard updated')
      } catch (error) {
        console.error('Error refreshing after trigger:', error)
        setTriggerError('Cycle triggered, but failed to refresh dashboard data')
      }
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
              <UtcClock />
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
              ) : triggerMessage ? (
                <p className="text-xs text-green-400 mt-2">{triggerMessage}</p>
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

function UtcClock() {
  const [now, setNow] = useState<Date>(() => new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  return <p className="text-xs opacity-50 mb-3">{now.toUTCString().replace('GMT', 'UTC')}</p>
}
