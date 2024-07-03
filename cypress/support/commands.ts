/// <reference types="cypress" />
import '../../src/app/globals.css';
import { mount } from 'cypress/react18';
import * as solanaWalletStore from '~/stores/solanaWalletStore';
import type { SolanaWalletContext, SolanaWalletEvent } from '~/machines/solanaWalletMachine';
import Solflare from '@solflare-wallet/sdk';

declare global {
  namespace Cypress {
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
}

Cypress.Commands.add('mount', mount);

Cypress.Commands.add('stubSolanaWalletStore', (
  stateValue: SolanaWalletEvent['type'] | 'DISCONNECTED' | 'ERROR' | 'TRANSACTION_MODAL' | 'SENDING_TRANSACTION' | 'CONNECTED',
  contextOverrides: Partial<SolanaWalletContext> = {}
) => {
  const initialContext: SolanaWalletContext = {
    balance: 100,
    transactionSignature: 'null',
    wallet: new Solflare({ network: 'devnet' })
  };
  const context: SolanaWalletContext = { ...initialContext, ...contextOverrides };
  const sendStub = cy.stub().as('sendStub');
  const solanaWalletMachineStub = {
    context,
    value: stateValue,
    send: sendStub,
  };

  cy.stub(solanaWalletStore, 'useSolanaWalletMachine').returns(solanaWalletMachineStub);
  cy.log('Stubbed useSolanaWalletMachine:', solanaWalletMachineStub);
});
