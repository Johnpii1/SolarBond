import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@/test/render'
import { STELLAR_WALLETS, WalletSelectionModal } from './WalletSelectionModal'

describe('WalletSelectionModal', () => {
  it('lists each supported Stellar wallet when opened', () => {
    render(<WalletSelectionModal open connecting={false} onClose={vi.fn()} onSelect={vi.fn()} />)

    expect(screen.getByRole('dialog', { name: 'Choose your wallet' })).toBeInTheDocument()
    for (const wallet of STELLAR_WALLETS) {
      expect(screen.getByRole('button', { name: new RegExp(wallet.name, 'i') })).toBeInTheDocument()
    }
  })

  it('connects with the wallet the visitor selects', () => {
    const onSelect = vi.fn()
    render(<WalletSelectionModal open connecting={false} onClose={vi.fn()} onSelect={onSelect} />)

    fireEvent.click(screen.getByRole('button', { name: /freighter/i }))

    expect(onSelect).toHaveBeenCalledWith('freighter')
  })

  it('closes on Escape when a connection is not in progress', () => {
    const onClose = vi.fn()
    render(<WalletSelectionModal open connecting={false} onClose={onClose} onSelect={vi.fn()} />)

    fireEvent.keyDown(window, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
