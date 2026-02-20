'use client'

import { BrowserProvider } from 'ethers'
import type { Eip1193Provider as EthersEip1193Provider, Eip6963ProviderInfo as EthersEip6963ProviderInfo } from 'ethers'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type Eip1193Provider = EthersEip1193Provider & {
  on?: (event: string, listener: (...args: unknown[]) => void) => void
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void
  isMetaMask?: boolean
  isCoinbaseWallet?: boolean
}

type Eip6963ProviderInfo = EthersEip6963ProviderInfo

type Eip6963ProviderDetail = {
  info: Eip6963ProviderInfo
  provider: Eip1193Provider
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider
  }
}

function shortenAddress(address: string) {
  const normalized = address.trim()
  if (!/^0x[0-9a-fA-F]{8,}$/.test(normalized)) return normalized
  return `${normalized.slice(0, 6)}…${normalized.slice(-4)}`
}

function parseChainId(chainId: unknown) {
  if (typeof chainId === 'number') return chainId
  if (typeof chainId === 'bigint') {
    const maxSafe = BigInt(Number.MAX_SAFE_INTEGER)
    if (chainId > maxSafe) return null
    return Number(chainId)
  }
  if (typeof chainId !== 'string') return null
  const normalized = chainId.trim()
  const parsed = normalized.startsWith('0x') ? Number.parseInt(normalized, 16) : Number.parseInt(normalized, 10)
  return Number.isFinite(parsed) ? parsed : null
}

// Best-effort label for injected-style providers.
function getInjectedWalletFallbackName(provider: Eip1193Provider | null | undefined) {
  if (!provider) return 'Injected Wallet'
  if (provider.isMetaMask) return 'MetaMask'
  if (provider.isCoinbaseWallet) return 'Coinbase Wallet'
  return 'Injected Wallet'
}

export default function WalletConnectButton() {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const connectSeq = useRef(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [providers, setProviders] = useState<Eip6963ProviderDetail[]>([])
  const [activeProvider, setActiveProvider] = useState<Eip1193Provider | null>(null)
  const [activeProviderInfo, setActiveProviderInfo] = useState<Eip6963ProviderInfo | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const isConnected = Boolean(address)

  const invalidatePendingConnections = useCallback(() => {
    connectSeq.current += 1
  }, [])

  const clearConnectionState = useCallback(() => {
    setIsMenuOpen(false)
    setActiveProvider(null)
    setActiveProviderInfo(null)
    setAddress(null)
    setChainId(null)
    setConnectionError(null)
  }, [])

  const clearConnection = useCallback(() => {
    invalidatePendingConnections()
    clearConnectionState()
  }, [clearConnectionState, invalidatePendingConnections])

  const providersWithFallback = useMemo(() => {
    if (typeof window === 'undefined') return []
    if (providers.length > 0) return providers
    if (!window.ethereum) return []

    return [
      {
        info: {
          uuid: 'window.ethereum',
          name: getInjectedWalletFallbackName(window.ethereum),
          icon: '',
          rdns: 'injected',
        },
        provider: window.ethereum,
      },
    ]
  }, [providers])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleProviderAnnouncement = (event: Event) => {
      const customEvent = event as CustomEvent<Eip6963ProviderDetail>
      const detail = customEvent.detail
      if (!detail?.info?.uuid || !detail.info.name) return
      if (typeof detail.provider?.request !== 'function') return

      setProviders((current) => {
        const alreadyPresent = current.some((providerDetail) => providerDetail.info.uuid === detail.info.uuid)
        if (alreadyPresent) return current
        return [...current, detail]
      })
    }

    window.addEventListener('eip6963:announceProvider', handleProviderAnnouncement as EventListener)
    window.dispatchEvent(new CustomEvent('eip6963:requestProvider'))

    return () => {
      window.removeEventListener('eip6963:announceProvider', handleProviderAnnouncement as EventListener)
    }
  }, [])

  useEffect(() => {
    if (!isMenuOpen) return

    const handlePointerDown = (event: PointerEvent | MouseEvent) => {
      if (!rootRef.current) return
      if (event.target instanceof Node && rootRef.current.contains(event.target)) return
      setIsMenuOpen(false)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }

    const supportsPointerEvents = typeof window !== 'undefined' && 'onpointerdown' in window
    const outsideEvent = supportsPointerEvents ? 'pointerdown' : 'mousedown'

    window.addEventListener(outsideEvent, handlePointerDown as EventListener)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener(outsideEvent, handlePointerDown as EventListener)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen])

  useEffect(() => {
    if (!activeProvider) return

    const handleAccountsChanged = (accounts: unknown) => {
      if (!Array.isArray(accounts) || accounts.length === 0 || typeof accounts[0] !== 'string') {
        clearConnection()
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
  }, [activeProvider, clearConnection])

  const sortedProvidersWithFallback = useMemo(() => {
    return [...providersWithFallback].sort((a, b) => a.info.name.localeCompare(b.info.name))
  }, [providersWithFallback])

  const connectToProvider = async (providerDetail: Eip6963ProviderDetail) => {
    invalidatePendingConnections()
    const seq = connectSeq.current
    setIsMenuOpen(false)
    setConnectionError(null)

    try {
      const accounts = await providerDetail.provider.request({ method: 'eth_requestAccounts' })
      const requestedAddress =
        Array.isArray(accounts) && typeof accounts[0] === 'string' && accounts[0].length > 0 ? accounts[0] : null

      const browserProvider = new BrowserProvider(providerDetail.provider)
      const network = await browserProvider.getNetwork()

      let connectedAddress = requestedAddress
      if (!connectedAddress) {
        const signer = await browserProvider.getSigner()
        connectedAddress = await signer.getAddress()
      }

      if (seq !== connectSeq.current) return

      setActiveProvider(providerDetail.provider)
      setActiveProviderInfo(providerDetail.info)
      setAddress(connectedAddress)
      setChainId(parseChainId(network.chainId))
    } catch (error) {
      if (seq !== connectSeq.current) return

      const maybeError = error as { code?: unknown; message?: unknown; shortMessage?: unknown }
      const code = maybeError?.code
      const rawMessage =
        typeof maybeError?.shortMessage === 'string'
          ? maybeError.shortMessage
          : typeof maybeError?.message === 'string'
            ? maybeError.message
            : ''
      const normalizedMessage = rawMessage.toLowerCase()

      if (code === 4001 || normalizedMessage.includes('user rejected')) {
        setConnectionError('Connection request was rejected.')
      } else {
        setConnectionError('Wallet connection was cancelled or failed.')
      }

      setIsMenuOpen(true)
      console.error('Failed to connect wallet', error)
    }
  }

  const handleButtonClick = () => {
    if (isConnected) {
      setIsMenuOpen((open) => !open)
      return
    }

    setConnectionError(null)
    setIsMenuOpen(true)
  }

  const injectedProvider = typeof window === 'undefined' ? null : window.ethereum ?? null
  const discoveredProviderName = activeProvider
    ? providers.find((providerDetail) => providerDetail.provider === activeProvider)?.info.name
    : null
  const activeProviderName =
    activeProviderInfo?.name ||
    discoveredProviderName ||
    (activeProvider && injectedProvider && activeProvider === injectedProvider
      ? getInjectedWalletFallbackName(injectedProvider)
      : 'Injected Wallet')
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
                onClick={clearConnection}
                className="w-full text-left px-4 py-3 text-sm text-red-300 hover:bg-red-950/30 transition-colors"
              >
                Clear connection
              </button>
            </>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-dark-border">
                <p className="text-xs text-gray-400 font-mono">Select wallet</p>
                {connectionError && <p className="mt-2 text-xs text-red-300 font-mono">{connectionError}</p>}
              </div>
              {sortedProvidersWithFallback.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-300">No injected wallet detected.</div>
              ) : (
                sortedProvidersWithFallback.map((providerDetail) => (
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
