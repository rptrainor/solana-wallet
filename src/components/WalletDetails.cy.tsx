import React from 'react';
import WalletDetails from './WalletDetails';

describe('<WalletDetails />', () => {
  beforeEach(() => {
    cy.stubSolanaWalletStore('DISCONNECTED');
  });

  it('renders the Hero component when disconnected', () => {
    cy.stubSolanaWalletStore('DISCONNECTED');
    cy.mount(<WalletDetails />);
    cy.get('h1').should('contain.text', 'Send & Receive SOL');
  });

  it('renders the Menu component when connected or modal open', () => {
    cy.stubSolanaWalletStore('CONNECTED');
    cy.mount(<WalletDetails />);
    cy.get('button').should('have.length', 1);

    cy.stubSolanaWalletStore('TRANSACTION_MODAL');
    cy.mount(<WalletDetails />);
    cy.get('button').should('have.length', 1);
  });

});
