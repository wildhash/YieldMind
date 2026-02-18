import { Wallet, DollarSign } from 'lucide-react'

interface VaultStatusProps {
  balance: string
  currentProtocol?: string
}

export default function VaultStatus({ balance, currentProtocol }: VaultStatusProps) {
  return (
    <div className="mb-8 terminal-border rounded-lg p-6 bg-dark-panel shadow-neon-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wallet size={32} className="text-neon-lime" />
          <div>
            <p className="text-sm opacity-70">Total Vault Balance</p>
            <p className="text-3xl font-bold terminal-text">{balance} BNB</p>
            {currentProtocol ? (
              <p className="text-xs opacity-60 mt-1">Current: {currentProtocol}</p>
            ) : null}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm opacity-70">Optimized by AI</p>
          <p className="text-lg font-bold flex items-center gap-2">
            <DollarSign size={20} />
            Claude Opus 4.5
          </p>
        </div>
      </div>
    </div>
  )
}
