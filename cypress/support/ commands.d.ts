/// <reference types="cypress" />
import type { SolanaWalletContext, SolanaWalletEvent } from '~/machines/solanaWalletMachine';

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to stub the Solana Wallet store.
     * @example cy.stubSolanaWalletStore('CONNECTED', { balance: 100 })
     */
    stubSolanaWalletStore(
      stateValue: SolanaWalletEvent['type'] | 'DISCONNECTED' | 'ERROR' | 'TRANSACTION_MODAL' | 'SENDING_TRANSACTION' | 'CONNECTED',
      contextOverrides?: Partial<SolanaWalletContext>
    ): Chainable<void>;
  }
}
