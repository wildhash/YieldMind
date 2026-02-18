import { TrendingUp, Shield, AlertCircle } from 'lucide-react'

interface ProtocolCardProps {
  name: string
  apy: number
  tvl: string
  riskScore: number
  isActive: boolean
}

export default function ProtocolCard({ name, apy, tvl, riskScore, isActive }: ProtocolCardProps) {
  const getRiskColor = (score: number) => {
    if (score <= 3) return 'text-green-500'
    if (score <= 6) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className={`terminal-border rounded-lg p-4 bg-dark-panel ${isActive ? 'shadow-neon' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl font-bold">{name}</h3>
        {isActive && (
          <span className="text-xs bg-neon-lime text-black px-2 py-1 rounded pulse-glow">
            ACTIVE
          </span>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} />
            <span className="text-sm opacity-70">APY</span>
          </div>
          <span className="text-lg font-bold">{apy.toFixed(2)}%</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={16} />
            <span className="text-sm opacity-70">Risk</span>
          </div>
          <span className={`text-sm font-bold ${getRiskColor(riskScore)}`}>
            {riskScore}/10
          </span>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-dark-border">
          <span className="text-xs opacity-50">TVL</span>
          <span className="text-sm">{tvl}</span>
        </div>
      </div>
    </div>
  )
}
