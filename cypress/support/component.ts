/// <reference types="cypress" />
import type { SolanaWalletEvent, SolanaWalletContext } from "~/machines/solanaWalletMachine";
import "./commands";
import { mount } from "cypress/react18";
import Solflare from "@solflare-wallet/sdk";

declare global {
	namespace Cypress {
		interface Chainable {
			mount: typeof mount;
			stubSolanaWalletStore(
				stateValue:
					| SolanaWalletEvent["type"]
					| "DISCONNECTED"
					| "ERROR"
					| "TRANSACTION_MODAL"
					| "SENDING_TRANSACTION"
					| "CONNECTED",
				contextOverrides?: Partial<SolanaWalletContext>,
			): Chainable<void>;
		}
	}
}

Cypress.Commands.add('mount', mount);
Cypress.Commands.add('stubSolanaWalletStore', (
	stateValue: SolanaWalletEvent["type"] | "DISCONNECTED" | "ERROR" | "TRANSACTION_MODAL" | "SENDING_TRANSACTION" | "CONNECTED",
	contextOverrides: Partial<SolanaWalletContext> = {},
) => {
	const initialContext: SolanaWalletContext = {
		balance: 100,
		transactionSignature: "null",
		wallet: new Solflare({ network: "devnet" }),
	};
	const context: SolanaWalletContext = { ...initialContext, ...contextOverrides };
	const sendStub = cy.stub().as("sendStub");
	const solanaWalletMachineStub = {
		context,
		value: stateValue,
		send: sendStub,
	};  
	// cy.stub(solanaWalletStore, "useSolanaWalletMachine").returns(solanaWalletMachineStub);
	cy.log("Stubbed useSolanaWalletMachine:", solanaWalletMachineStub);
});
