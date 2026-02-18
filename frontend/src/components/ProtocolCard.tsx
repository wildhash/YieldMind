import { TrendingUp, Shield } from 'lucide-react'
import { motion } from 'framer-motion'

interface ProtocolCardProps {
  name: string
  apy: number
  tvl: string
  riskScore: number
  isActive: boolean
  index: number
}

export default function ProtocolCard({ name, apy, tvl, riskScore, isActive, index }: ProtocolCardProps) {
  const getRiskColor = (score: number) => {
    if (score <= 3) return 'text-green-400 bg-green-400'
    if (score <= 6) return 'text-yellow-400 bg-yellow-400'
    return 'text-red-500 bg-red-500'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`terminal-border rounded-xl p-5 bg-dark-panel/80 backdrop-blur-sm hover:shadow-neon transition-shadow ${
        isActive ? 'shadow-neon ring-2 ring-neon-lime/20' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">{name}</h3>
        {isActive && (
          <span className="text-xs bg-neon-lime text-black px-2 py-1 rounded-md pulse-glow font-bold">
            ACTIVE
          </span>
        )}
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-neon-lime" />
            <span className="text-sm text-gray-400">APY</span>
          </div>
          <span className="text-2xl font-bold terminal-text">{apy.toFixed(2)}%</span>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-neon-lime" />
              <span className="text-sm text-gray-400">Risk</span>
            </div>
            <span className={`text-sm font-bold ${getRiskColor(riskScore).split(' ')[0]}`}>
              {riskScore}/10
            </span>
          </div>
          {/* Visual Risk Bar */}
          <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getRiskColor(riskScore).split(' ')[1]}`}
              style={{ width: `${(riskScore / 10) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-dark-border/50">
          <span className="text-xs text-gray-500 uppercase tracking-wider">TVL</span>
          <span className="text-sm font-mono text-gray-300">{tvl}</span>
        </div>
      </div>
    </motion.div>
  )
}
