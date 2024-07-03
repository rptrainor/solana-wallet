import React from 'react';
import Button from './Button';

describe('<Button />', () => {
  it('renders with default props', () => {
    cy.mount(<Button>Click Me</Button>);
    cy.get('button').should('exist');
    cy.get('button').should('contain.text', 'Click Me');
  });

  it('applies additional props', () => {
    cy.mount(<Button disabled>Click Me</Button>);
    cy.get('button').should('be.disabled');
  });

  it('applies hover effects', () => {
    cy.mount(<Button>Hover Me</Button>);
    cy.get('button').trigger('mouseover');
    cy.get('button').should('have.class', 'hover:scale-105');
    cy.get('button').should('have.class', 'hover:shadow-lg');
  });

  it('handles clicks', () => {
    const handleClick = cy.stub().as('handleClick');
    cy.mount(<Button onClick={handleClick}>Click Me</Button>);
    cy.get('button').click();
    cy.get('@handleClick').should('have.been.calledOnce');
  });

  it('renders with custom class names', () => {
    cy.mount(<Button className="custom-class">Custom Class</Button>);
    cy.get('button').should('have.class', 'custom-class');
  });

  it('renders with different children', () => {
    cy.mount(<Button>Button Text</Button>);
    cy.get('button').should('contain.text', 'Button Text');

    cy.mount(<Button><span>Span Child</span></Button>);
    cy.get('button').should('contain.html', '<span>Span Child</span>');
  });

  it('renders with various sizes', () => {
    cy.mount(<Button className="w-16 h-16">Large</Button>);
    cy.get('button').should('have.class', 'w-16');
    cy.get('button').should('have.class', 'h-16');
  });

  it('renders with different colors', () => {
    cy.mount(<Button className="bg-red-500">Red Button</Button>);
    cy.get('button').should('have.class', 'bg-red-500');
  });

  it('renders with different font sizes', () => {
    cy.mount(<Button className="text-xl">Large Text</Button>);
    cy.get('button').should('have.class', 'text-xl');
  });
});
