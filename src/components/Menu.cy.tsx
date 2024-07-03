import React from 'react';
import Menu from './Menu';
import * as solanaWalletStore from '~/stores/solanaWalletStore';

describe('<Menu />', () => {
  beforeEach(() => {
    cy.stub(solanaWalletStore, 'useSolanaWalletStore').returns({
      send: cy.stub().as('sendStub'),
    });
  });

  it('renders', () => {
    cy.mount(<Menu />);
    cy.get('button').should('have.length', 2);
  });

  it('renders disconnect button with correct SVG', () => {
    cy.mount(<Menu />);
    cy.get('button').first().within(() => {
      cy.get('svg').should('have.attr', 'aria-label', 'Disconnect from network');
      cy.get('svg title').should('contain.text', 'Disconnect from network');
    });
  });

  it('renders send transaction button with correct SVG', () => {
    cy.mount(<Menu />);
    cy.get('button').last().within(() => {
      cy.get('svg').should('have.attr', 'aria-label', 'Send transaction');
      cy.get('svg title').should('contain.text', 'Send transaction');
    });
  });

});
