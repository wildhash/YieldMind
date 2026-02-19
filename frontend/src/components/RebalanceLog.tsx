import { ArrowRightLeft, Clock } from 'lucide-react'

interface RebalanceEvent {
  timestamp: string
  fromProtocol: string
  toProtocol: string
  amount: string
  reason: string
}

interface RebalanceLogProps {
  rebalances: RebalanceEvent[]
}

export default function RebalanceLog({ rebalances }: RebalanceLogProps) {
  return (
    <div className="terminal-border rounded-lg p-6 bg-dark-panel">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <ArrowRightLeft className="mr-2" size={24} />
        Recent Rebalances
      </h2>
      
      {rebalances.length === 0 ? (
        <p className="text-center opacity-50 py-8">No rebalances yet</p>
      ) : (
        <div className="space-y-3">
          {rebalances.map((rebalance, idx) => (
            <div key={idx} className="border border-dark-border rounded p-3 hover:border-neon-lime transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="opacity-50" />
                  <span className="text-sm opacity-70">
                    {new Date(rebalance.timestamp).toLocaleString()}
                  </span>
                </div>
                <span className="text-sm font-bold">{rebalance.amount}</span>
              </div>
              
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">{rebalance.fromProtocol}</span>
                <ArrowRightLeft size={16} className="text-neon-lime" />
                <span className="text-sm">{rebalance.toProtocol}</span>
              </div>
              
              <p className="text-xs opacity-50">{rebalance.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
