import { Wallet, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { motion } from 'framer-motion'

interface VaultStatusProps {
  balance: string
  currentProtocol?: string
  onDeposit?: () => void
  onWithdraw?: () => void
}

export default function VaultStatus({ balance, currentProtocol, onDeposit, onWithdraw }: VaultStatusProps) {
  const depositHandler = typeof onDeposit === 'function' ? onDeposit : undefined
  const withdrawHandler = typeof onWithdraw === 'function' ? onWithdraw : undefined

  const depositEnabled = Boolean(depositHandler)
  const withdrawEnabled = Boolean(withdrawHandler)

  const handleDepositClick = () => {
    depositHandler?.()
  }

  const handleWithdrawClick = () => {
    withdrawHandler?.()
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="mb-8 terminal-border terminal-panel rounded-xl p-6 bg-gradient-to-br from-dark-panel to-black shadow-neon-lg"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-neon-lime/10 rounded-full border border-neon-lime/30">
            <Wallet size={36} className="text-neon-lime" />
          </div>
          <div>
            <p className="text-sm text-gray-400 uppercase tracking-widest mb-1">Smart Vault Balance</p>
            <p className="text-4xl font-bold terminal-text font-mono">{balance} <span className="text-xl text-gray-400">BNB</span></p>
            {currentProtocol && (
              <p className="text-sm text-neon-lime/80 mt-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neon-lime animate-ping" />
                Deployed in: {currentProtocol}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons & AI Status */}
        <div className="flex flex-col items-end gap-4 w-full md:w-auto">
          <div className="text-right border-b border-dark-border/50 pb-3 w-full md:w-auto">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Agent Driver</p>
            <p className="text-lg font-bold flex items-center justify-end gap-2 text-white">
              <DollarSign size={18} className="text-neon-lime" />
              Claude Opus 3.5
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={handleDepositClick}
              disabled={!depositEnabled}
              aria-disabled={!depositEnabled}
              aria-label={!depositEnabled ? 'Deposit (coming soon)' : 'Deposit'}
              title={!depositEnabled ? 'Coming soon' : undefined}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-neon-lime/10 hover:bg-neon-lime/20 border border-neon-lime rounded-md text-neon-lime font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-neon-lime/10 disabled:hover:scale-100"
            >
              <ArrowDownRight size={18} /> Deposit
            </button>
            <button
              type="button"
              onClick={handleWithdrawClick}
              disabled={!withdrawEnabled}
              aria-disabled={!withdrawEnabled}
              aria-label={!withdrawEnabled ? 'Withdraw (coming soon)' : 'Withdraw'}
              title={!withdrawEnabled ? 'Coming soon' : undefined}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-black hover:bg-gray-900 border border-dark-border rounded-md text-gray-300 font-bold transition-all hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black"
            >
              <ArrowUpRight size={18} /> Withdraw
            </button>
          </div>
          {!depositEnabled && !withdrawEnabled && (
            <p className="text-[11px] text-gray-500 text-right mt-1 w-full md:w-auto">
              Wallet actions coming soon.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
