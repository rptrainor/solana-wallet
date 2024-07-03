import React from 'react';
import Hero from './Hero';
import * as solanaWalletStore from '~/stores/solanaWalletStore';

describe('<Hero />', () => {
  beforeEach(() => {
    cy.stub(solanaWalletStore, 'useSolanaWalletStore').returns({
      send: cy.stub().as('sendStub'),
    });
  });

  it('renders', () => {
    cy.mount(<Hero />);
    cy.get('h1').should('contain.text', 'Send & Receive SOL');
    cy.get('p').should('contain.text', 'Easily check your Solana wallet balance and send transactions with ease.');
  });

  it('renders buttons and links correctly', () => {
    cy.mount(<Hero />);
    cy.get('button').should('contain.text', 'Connect wallet');
    cy.get('a').should('contain.text', 'Get a wallet');
    cy.get('a').should('have.attr', 'href', 'https://chromewebstore.google.com/detail/solflare-wallet/bhhhlbepdkbapadjdnnojkbgioiodbic');
    cy.get('a').should('have.attr', 'target', '_blank');
  });

  it('hover effects on buttons and links', () => {
    cy.mount(<Hero />);
    cy.get('button').trigger('mouseover');
    cy.get('button').should('have.class', 'hover:scale-105');
    cy.get('button').should('have.class', 'hover:shadow-lg');

    cy.get('a').trigger('mouseover');
    cy.get('a').should('have.class', 'hover:scale-105');
    cy.get('a').should('have.class', 'hover:bg-slate-500/30');
  });
});
