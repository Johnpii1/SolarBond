'use client'

import { useEffect } from 'react'
import { CloseIcon } from '../components/icons'

export const STELLAR_WALLETS = [
  { id: 'freighter', name: 'Freighter', description: 'Browser extension' },
  { id: 'xbull', name: 'xBull', description: 'Mobile and browser wallet' },
  { id: 'albedo', name: 'Albedo', description: 'Web-based Stellar signer' },
  { id: 'lobstr', name: 'LOBSTR', description: 'Mobile wallet and extension' },
  { id: 'hana', name: 'Hana', description: 'Browser extension' },
  { id: 'walletconnect', name: 'WalletConnect', description: 'Connect a compatible mobile wallet' },
] as const

export type StellarWalletId = (typeof STELLAR_WALLETS)[number]['id']

interface WalletSelectionModalProps {
  open: boolean
  connecting: boolean
  onClose: () => void
  onSelect: (walletId: StellarWalletId) => void
}

/** Select a Stellar Wallets Kit provider before asking it to authorize an address. */
export function WalletSelectionModal({
  open,
  connecting,
  onClose,
  onSelect,
}: WalletSelectionModalProps) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !connecting) onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, connecting, onClose])

  if (!open) return null

  return (
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !connecting) onClose()
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        background: 'var(--backdrop)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="stellar-wallet-picker-title"
        aria-describedby="stellar-wallet-picker-description"
        style={{
          width: '100%',
          maxWidth: 540,
          maxHeight: 'calc(100dvh - 40px)',
          overflowY: 'auto',
          padding: 28,
          border: '1px solid var(--ink-12)',
          borderRadius: 'var(--radius-modal)',
          background: 'var(--surface)',
          boxShadow: 'var(--shadow-lg)',
          animation: 'hb-rise 200ms var(--ease-out) forwards',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div>
            <p
              style={{
                margin: '0 0 6px',
                color: 'var(--growth)',
                fontFamily: 'var(--font-data)',
                fontSize: 'var(--type-eyebrow)',
              }}
            >
              STELLAR NETWORK
            </p>
            <h2
              id="stellar-wallet-picker-title"
              style={{
                margin: 0,
                color: 'var(--ink)',
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--type-h3-sm)',
                fontWeight: 700,
              }}
            >
              Choose your wallet
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close wallet selection"
            onClick={onClose}
            disabled={connecting}
            style={closeButtonStyle}
          >
            <CloseIcon size={18} />
          </button>
        </div>
        <p
          id="stellar-wallet-picker-description"
          style={{
            margin: '10px 0 20px',
            color: 'var(--ink-60)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--type-small)',
            lineHeight: 1.5,
          }}
        >
          Select a supported Stellar wallet to approve the connection. SolarBond never receives your
          private key.
        </p>
        <div style={{ display: 'grid', gap: 10 }}>
          {STELLAR_WALLETS.map((wallet) => (
            <button
              key={wallet.id}
              type="button"
              disabled={connecting}
              onClick={() => onSelect(wallet.id)}
              style={walletButtonStyle}
            >
              <span aria-hidden="true" style={walletMarkStyle}>
                {wallet.name.slice(0, 1)}
              </span>
              <span style={{ display: 'grid', gap: 3, textAlign: 'left' }}>
                <strong
                  style={{
                    color: 'var(--ink)',
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--type-body)',
                    fontWeight: 700,
                  }}
                >
                  {wallet.name}
                </strong>
                <span
                  style={{
                    color: 'var(--ink-60)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--type-caption)',
                  }}
                >
                  {wallet.description}
                </span>
              </span>
              <span
                style={{ marginLeft: 'auto', color: 'var(--ink-40)', fontSize: 20 }}
                aria-hidden="true"
              >
                ›
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

const closeButtonStyle = {
  display: 'grid',
  placeItems: 'center',
  width: 36,
  height: 36,
  padding: 0,
  border: '1px solid var(--ink-12)',
  borderRadius: '50%',
  background: 'transparent',
  color: 'var(--ink-60)',
  cursor: 'pointer',
} as const

const walletButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  padding: 14,
  border: '1px solid var(--ink-12)',
  borderRadius: 'var(--radius-input)',
  background: 'var(--surface)',
  cursor: 'pointer',
} as const

const walletMarkStyle = {
  display: 'grid',
  placeItems: 'center',
  flex: '0 0 auto',
  width: 38,
  height: 38,
  marginRight: 12,
  borderRadius: '50%',
  background: 'var(--growth-12)',
  color: 'var(--growth)',
  fontFamily: 'var(--font-display)',
  fontSize: 'var(--type-body)',
  fontWeight: 800,
} as const
