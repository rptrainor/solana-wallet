import { assign, fromPromise, setup } from "xstate";
import Solflare from "@solflare-wallet/sdk";
import {
	Connection,
	Transaction,
	SystemProgram,
	LAMPORTS_PER_SOL,
	type TransactionSignature,
} from "@solana/web3.js";

export interface SolanaWalletContext {
	wallet: Solflare | null;
	balance: number | null;
	transactionSignature: string;
}

export type SolanaWalletEvent =
	| { type: "CONNECT" }
	| { type: "DISCONNECT" }
	| { type: "TRANSACTION_MODAL" }
	| { type: "CANCEL" }
	| { type: "SENDING_TRANSACTION", data: { amount: number } }
	| { type: "RETRY" }

interface ConnectWalletDoneEvent {
	type: "done.invoke.connectWallet";
	data: {
		wallet: Solflare;
		balance: number;
		connection: Connection;
	};
}

interface SendTransactionDoneEvent {
	type: "done.invoke.sendTransaction";
	data: {
		signature: TransactionSignature;
	};
}

const SOLANA_DEVNET = "https://api.testnet.solana.com/";

export const solanaWalletMachine = setup({
	types: {
		context: {} as SolanaWalletContext,
		events: {} as
			| { type: "CONNECT" }
			| { type: "DISCONNECT" }
			| { type: "TRANSACTION_MODAL" }
			| { type: "CANCEL" }
			| { type: "SENDING_TRANSACTION", data: { amount: number } }
			| { type: "RETRY" }
			| ConnectWalletDoneEvent
			| SendTransactionDoneEvent,
	},
	actors: {
		connectWallet: fromPromise(async () => {
			const wallet = new Solflare({ network: "devnet" });
			await wallet.connect();
			if (!wallet.publicKey) throw new Error("No public key found");

			const connection = new Connection(SOLANA_DEVNET);
			const newBalance = await connection.getBalance(wallet.publicKey);

			return { wallet, balance: newBalance / 1e9 };
		}),
		sendTransaction: fromPromise(
			async ({
				input,
			}: {
				input: { wallet: Solflare | null, amount: number };
			}) => {
				if (!input.wallet) throw new Error("No wallet found");
				if (!input.wallet.publicKey) throw new Error("No public key found");
				if (input.amount == null || input.amount < 0) throw new Error("Please enter a valid amount");
				const connection = new Connection(SOLANA_DEVNET);
				const { blockhash, lastValidBlockHeight } =
					await connection.getLatestBlockhash();
				const transaction = new Transaction().add(
					SystemProgram.transfer({
						fromPubkey: input.wallet.publicKey,
						toPubkey: input.wallet.publicKey,
						lamports: input.amount * LAMPORTS_PER_SOL,
					}),
				);
				transaction.feePayer = input.wallet.publicKey;
				transaction.recentBlockhash = blockhash;

				try {
					const signature =
						await input.wallet.signAndSendTransaction(transaction);
					await connection.confirmTransaction({
						signature,
						blockhash,
						lastValidBlockHeight,
					});
					return { signature };
				} catch (error) {
					console.error("Transaction failed:", error);
					throw error;
				}
			},
		),
		disconnectWallet: fromPromise(async ({ input }: { input: { wallet: Solflare | null } }) => {
			await input?.wallet?.disconnect();
			return { wallet: null, balance: null, transactionSignature: null };
		}),
	},
	actions: {},
}).createMachine({
	context: {
		wallet: new Solflare({ network: "devnet" }),
		balance: null,
		transactionSignature: "",
	},
	id: "SolanaWalletMachine",
	initial: "DISCONNECTED",
	states: {
		DISCONNECTED: {
			on: {
				CONNECT: "CONNECTING",
			},
		},
		CONNECTING: {
			invoke: {
				id: "connectWallet",
				src: "connectWallet",
				onDone: {
					target: "CONNECTED",
					actions: assign({
						wallet: ({ context, event }) =>
							event.output.wallet || context.wallet,
						balance: ({ context, event }) =>
							event.output.balance || context.balance,
					}),
				},
				onError: {
					target: "ERROR",
				},
			},
		},
		CONNECTED: {
			on: {
				DISCONNECT: {
					target: "DISCONNECTING",
				},
				TRANSACTION_MODAL: "TRANSACTION_MODAL",
			},
		},
		TRANSACTION_MODAL: {
			on: {
				SENDING_TRANSACTION: "SENDING_TRANSACTION",
				CANCEL: "CONNECTED",
			},
		},
		DISCONNECTING: {
			invoke: {
				id: "disconnectWallet",
				src: "disconnectWallet",
				input: ({ context }) => ({
					wallet: context.wallet,
				}),
				onDone: {
					target: "DISCONNECTED",
					actions: assign({
						wallet: (_context, _event) => null,
						balance: (_context, _event) => null,
						transactionSignature: (_context, _event) => "",
					}),
				},
				onError: {
					target: "ERROR",
				},
			},
		},
		SENDING_TRANSACTION: {
			invoke: {
				id: "sendTransaction",
				src: "sendTransaction",
				input: ({ context, event }) => {
					if (event.type === "SENDING_TRANSACTION") {
						return {
							wallet: context.wallet,
							amount: event.data.amount,
						};
					}
					return {
						wallet: context.wallet,
						amount: 0
					};
				},
				onDone: {
					target: "CONNECTED",
					actions: assign({
						transactionSignature: ({ context, event }) =>
							event.output.signature || context.transactionSignature,
					}),
				},
				onError: {
					target: "ERROR",
				},
			},
		},
		ERROR: {
			on: {
				RETRY: "DISCONNECTED",
			},
		},
	},
});

export default solanaWalletMachine;
