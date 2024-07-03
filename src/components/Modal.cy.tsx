import React, { useState } from 'react';
import Modal from './Modal';

describe('<Modal />', () => {
  const ModalWrapper = () => {
    const [open, setOpen] = useState(true);
    return (
      <Modal open={open} setOpen={setOpen}>
        <div>
          <h1>Modal Title</h1>
          <p>Modal Content</p>
          <button type='button' onClick={() => setOpen(false)}>Close Modal</button>
        </div>
      </Modal>
    );
  };

  it('renders when open is true', () => {
    cy.mount(<ModalWrapper />);
    cy.get('h1').should('contain.text', 'Modal Title');
    cy.get('p').should('contain.text', 'Modal Content');
  });

  it('does not render when open is false', () => {
    const TestComponent = () => {
      const [open, setOpen] = useState(false);
      return (
        <Modal open={open} setOpen={setOpen}>
          <div>
            <h1>Modal Title</h1>
            <p>Modal Content</p>
            <button type='button' onClick={() => setOpen(false)}>Close Modal</button>
          </div>
        </Modal>
      );
    };
    cy.mount(<TestComponent />);
    cy.get('h1').should('not.exist');
    cy.get('p').should('not.exist');
  });

  it('calls setOpen when close button is clicked', () => {
    cy.mount(<ModalWrapper />);
    cy.get('button').contains('Close Modal').click();
    cy.get('h1').should('not.exist');
  });

});
