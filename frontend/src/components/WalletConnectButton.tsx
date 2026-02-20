'use client'

import { BrowserProvider } from 'ethers'
import { useEffect, useMemo, useRef, useState } from 'react'

type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] | Record<string, unknown> }) => Promise<unknown>
  on?: (event: string, listener: (...args: unknown[]) => void) => void
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void
}

type Eip6963ProviderInfo = {
  uuid: string
  name: string
  icon: string
  rdns: string
}

type Eip6963ProviderDetail = {
  info: Eip6963ProviderInfo
  provider: Eip1193Provider
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider & {
      isMetaMask?: boolean
      isCoinbaseWallet?: boolean
    }
  }
}

function shortenAddress(address: string) {
  const normalized = address.trim()
  if (normalized.length <= 12) return normalized
  return `${normalized.slice(0, 6)}…${normalized.slice(-4)}`
}

function parseChainId(chainId: unknown) {
  if (typeof chainId === 'number') return chainId
  if (typeof chainId === 'bigint') return Number(chainId)
  if (typeof chainId !== 'string') return null
  const normalized = chainId.trim()
  const parsed = normalized.startsWith('0x') ? Number.parseInt(normalized, 16) : Number.parseInt(normalized, 10)
  return Number.isFinite(parsed) ? parsed : null
}

function getFallbackWalletName(ethereum: Window['ethereum']) {
  if (!ethereum) return 'Browser Wallet'
  if (ethereum.isMetaMask) return 'MetaMask'
  if (ethereum.isCoinbaseWallet) return 'Coinbase Wallet'
  return 'Browser Wallet'
}

export default function WalletConnectButton() {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [providers, setProviders] = useState<Eip6963ProviderDetail[]>([])
  const [activeProvider, setActiveProvider] = useState<Eip1193Provider | null>(null)
  const [activeProviderInfo, setActiveProviderInfo] = useState<Eip6963ProviderInfo | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const isConnected = Boolean(address)

  const providersWithFallback = useMemo(() => {
    if (typeof window === 'undefined') return []
    if (providers.length > 0) return providers
    if (!window.ethereum) return []

    return [
      {
        info: {
          uuid: 'window.ethereum',
          name: getFallbackWalletName(window.ethereum),
          icon: '',
          rdns: 'injected',
        },
        provider: window.ethereum,
      },
    ]
  }, [providers])

  useEffect(() => {
    const handleProviderAnnouncement = (event: Event) => {
      const customEvent = event as CustomEvent<Eip6963ProviderDetail>
      const detail = customEvent.detail
      if (!detail?.info?.uuid || !detail.provider) return

      setProviders((current) => {
        const alreadyPresent = current.some((providerDetail) => providerDetail.info.uuid === detail.info.uuid)
        if (alreadyPresent) return current
        return [...current, detail].sort((a, b) => a.info.name.localeCompare(b.info.name))
      })
    }

    window.addEventListener('eip6963:announceProvider', handleProviderAnnouncement)
    window.dispatchEvent(new Event('eip6963:requestProvider'))

    return () => {
      window.removeEventListener('eip6963:announceProvider', handleProviderAnnouncement)
    }
  }, [])

  useEffect(() => {
    if (!isMenuOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current) return
      if (event.target instanceof Node && rootRef.current.contains(event.target)) return
      setIsMenuOpen(false)
    }

    window.addEventListener('mousedown', handlePointerDown)
    return () => window.removeEventListener('mousedown', handlePointerDown)
  }, [isMenuOpen])

  useEffect(() => {
    if (!activeProvider) return

    const handleAccountsChanged = (accounts: unknown) => {
      if (!Array.isArray(accounts) || typeof accounts[0] !== 'string') {
        setAddress(null)
        return
      }

      setAddress(accounts[0])
    }

    const handleChainChanged = (nextChainId: unknown) => {
      setChainId(parseChainId(nextChainId))
    }

    activeProvider.on?.('accountsChanged', handleAccountsChanged)
    activeProvider.on?.('chainChanged', handleChainChanged)

    return () => {
      activeProvider.removeListener?.('accountsChanged', handleAccountsChanged)
      activeProvider.removeListener?.('chainChanged', handleChainChanged)
    }
  }, [activeProvider])

  const connectToProvider = async (providerDetail: Eip6963ProviderDetail) => {
    setIsMenuOpen(false)

    try {
      await providerDetail.provider.request({ method: 'eth_requestAccounts' })
      const browserProvider = new BrowserProvider(providerDetail.provider as never)
      const signer = await browserProvider.getSigner()
      const connectedAddress = await signer.getAddress()
      const network = await browserProvider.getNetwork()

      setActiveProvider(providerDetail.provider)
      setActiveProviderInfo(providerDetail.info)
      setAddress(connectedAddress)
      setChainId(parseChainId(network.chainId))
    } catch (error) {
      console.error('Failed to connect wallet', error)
    }
  }

  const disconnect = () => {
    setIsMenuOpen(false)
    setActiveProvider(null)
    setActiveProviderInfo(null)
    setAddress(null)
    setChainId(null)
  }

  const handleButtonClick = () => {
    if (isConnected) {
      setIsMenuOpen((open) => !open)
      return
    }

    if (providersWithFallback.length === 1) {
      void connectToProvider(providersWithFallback[0])
      return
    }

    setIsMenuOpen(true)
  }

  const activeProviderName =
    activeProviderInfo?.name || (typeof window === 'undefined' ? 'Browser Wallet' : getFallbackWalletName(window.ethereum))
  const label = isConnected ? shortenAddress(address ?? '') : 'Connect Wallet'

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={handleButtonClick}
        aria-expanded={isMenuOpen}
        aria-haspopup="menu"
        className="bg-white text-black px-6 py-2 rounded text-sm font-bold hover:bg-gray-200 transition-colors whitespace-nowrap"
      >
        {label}
      </button>

      {isMenuOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 rounded-lg border border-dark-border bg-black/95 shadow-neon-lg overflow-hidden z-50"
        >
          {isConnected ? (
            <>
              <div className="px-4 py-3 border-b border-dark-border">
                <p className="text-xs text-gray-400 font-mono">Connected</p>
                <p className="text-sm text-white font-mono mt-1">{activeProviderName}</p>
                {chainId !== null && <p className="text-xs text-gray-500 font-mono mt-1">Chain ID: {chainId}</p>}
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={disconnect}
                className="w-full text-left px-4 py-3 text-sm text-red-300 hover:bg-red-950/30 transition-colors"
              >
                Disconnect
              </button>
            </>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-dark-border">
                <p className="text-xs text-gray-400 font-mono">Select wallet</p>
              </div>
              {providersWithFallback.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-300">No injected wallet detected.</div>
              ) : (
                providersWithFallback.map((providerDetail) => (
                  <button
                    key={providerDetail.info.uuid}
                    type="button"
                    role="menuitem"
                    onClick={() => void connectToProvider(providerDetail)}
                    className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-gray-900 transition-colors"
                  >
                    {providerDetail.info.name}
                  </button>
                ))
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
