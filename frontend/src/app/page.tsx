'use client'

import { useEffect, useState } from 'react'
import ProtocolCard from '@/components/ProtocolCard'
import VaultStatus from '@/components/VaultStatus'
import RebalanceLog from '@/components/RebalanceLog'
import { Activity, Zap, TrendingUp, Cpu } from 'lucide-react'
import { BACKEND_URL } from '@/lib/constants'
import { motion } from 'framer-motion'

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
  const [aiStatus, setAiStatus] = useState('Initializing Core...')
  const [rebalances, setRebalances] = useState<RebalanceEvent[]>([])
  const [isTriggeringCycle, setIsTriggeringCycle] = useState(false)
  const [triggerStatus, setTriggerStatus] = useState<
    { message: string; tone: 'success' | 'error' } | null
  >(null)
  const [isLoading, setIsLoading] = useState(true)
  const [initError, setInitError] = useState<string | null>(null)

  useEffect(() => {
    const refreshAll = async (errorMessage: string) => {
      const results = await Promise.allSettled([
        fetchProtocolData({ throwOnError: true }),
        fetchVaultStatus({ throwOnError: true }),
        fetchRebalanceHistory({ throwOnError: true }),
      ])

      const hadError = results.some((r) => r.status === 'rejected')
      setInitError(hadError ? errorMessage : null)
    }

    const init = async () => {
      try {
        await refreshAll('Failed to fully load on-chain state. Data may be incomplete.')
      } catch (error) {
        console.error('Error initializing dashboard:', error)
        setInitError('Failed to fully load on-chain state. Data may be incomplete.')
      } finally {
        setIsLoading(false)
      }
    }
    init()

    const interval = setInterval(() => {
      void refreshAll('Failed to refresh on-chain state. Data may be stale.')
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

      const mapped: ProtocolData[] = backendProtocols.map((p) => {
        const tvlValue = (p as unknown as Record<string, unknown>).tvl
        const tvl =
          typeof tvlValue === 'string'
            ? tvlValue
            : typeof tvlValue === 'number'
              ? tvlValue.toString()
              : '0'

        return {
          name: typeof p.name === 'string' ? p.name : 'Unknown',
          apy: typeof p.apy === 'number' ? p.apy : 0,
          tvl,
          riskScore: p.risk_score ?? p.riskScore ?? 0,
          isActive: p.is_active ?? p.isActive ?? false,
        }
      })

      setProtocols(mapped)
      setAiStatus(backendStatus || 'Active')
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
      setTriggerStatus(null)
      const response = await fetch(`${BACKEND_URL}/api/trigger-cycle`, { method: 'POST' })

      if (!response.ok) {
        setTriggerStatus({ message: `Backend returned ${response.status}`, tone: 'error' })
        return
      }

      try {
        await Promise.all([
          fetchProtocolData({ throwOnError: true }),
          fetchVaultStatus({ throwOnError: true }),
          fetchRebalanceHistory({ throwOnError: true }),
        ])
        setTriggerStatus({ message: 'Cycle triggered and dashboard updated', tone: 'success' })
      } catch (error) {
        console.error('Error refreshing after trigger:', error)
        setTriggerStatus({ message: 'Cycle triggered, but failed to refresh dashboard data', tone: 'error' })
      }
    } catch (error) {
      console.error('Error triggering AI cycle:', error)
      setTriggerStatus({ message: 'Failed to trigger AI cycle', tone: 'error' })
    } finally {
      setIsTriggeringCycle(false)
    }
  }

  return (
    <main className="min-h-screen p-4 md:p-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 terminal-border rounded-xl p-6 bg-dark-panel/80 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-black terminal-text flex items-center gap-3">
              <div className="p-2 bg-neon-lime/10 rounded-lg">
                <Zap className="text-neon-lime" size={32} />
              </div>
              YieldMind
            </h1>
            <p className="text-gray-400 mt-2 font-mono text-sm border-l-2 border-neon-lime pl-3 ml-2">
              Autonomous DeFi Optimizer • BNB Chain
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-3 w-full md:w-auto">
            <div className="flex items-center gap-4 bg-black/50 px-4 py-2 rounded-lg border border-dark-border">
              <div className="flex items-center gap-2">
                <Cpu className={aiStatus === 'Active' ? 'text-neon-lime pulse-glow' : 'text-yellow-500'} size={18} />
                <span className="text-sm font-mono text-gray-300">{aiStatus}</span>
              </div>
              <div className="w-px h-4 bg-dark-border"></div>
              <UtcClock />
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={triggerCycle}
                disabled={isTriggeringCycle}
                className="glow-button flex-1 md:flex-none rounded px-6 py-2 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                {isTriggeringCycle ? <Activity className="animate-spin" size={16} /> : <Zap size={16} />}
                {isTriggeringCycle ? 'Executing...' : 'Force Cycle'}
              </button>
              
              {/* Fake Connect Button for Demo/Scaffolding - Replace with Wagmi later */}
              <button className="bg-white text-black px-6 py-2 rounded text-sm font-bold hover:bg-gray-200 transition-colors">
                Connect Wallet
              </button>
            </div>
            <div className="min-h-[1rem] flex items-center justify-end w-full">
              {triggerStatus && (
                <p
                  className={`text-xs font-mono ${triggerStatus.tone === 'error' ? 'text-red-400' : 'text-neon-lime'}`}
                  title={triggerStatus.message}
                >
                  {triggerStatus.message}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Activity className="text-neon-lime animate-spin" size={48} />
            <p className="text-neon-lime font-mono animate-pulse">Syncing on-chain state...</p>
          </div>
        ) : (
          <>
            {initError && (
              <div className="mb-6 rounded-lg px-4 py-3 bg-red-950/20 border border-red-500/20">
                <p className="text-sm font-mono text-red-300">{initError}</p>
              </div>
            )}
            <VaultStatus balance={vaultBalance} currentProtocol={currentProtocol} />

            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                  <TrendingUp className="text-neon-lime" size={24} />
                  Live Yield Matrix
                </h2>
                <span className="text-xs text-gray-500 font-mono">Auto-updates every 30s</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {protocols.map((protocol, idx) => (
                  <ProtocolCard key={protocol.name} {...protocol} index={idx} />
                ))}
              </div>
            </div>

            <RebalanceLog rebalances={rebalances} />
          </>
        )}
      </div>
    </main>
  )
}

function UtcClock() {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  if (!now) {
    return <span className="text-xs text-gray-400 font-mono invisible">00:00:00 UTC</span>
  }

  const hours = String(now.getUTCHours()).padStart(2, '0')
  const minutes = String(now.getUTCMinutes()).padStart(2, '0')
  const seconds = String(now.getUTCSeconds()).padStart(2, '0')
  const time = `${hours}:${minutes}:${seconds}`

  return <span className="text-xs text-gray-400 font-mono">{time} UTC</span>
}
