import { createMachine, assign, fromPromise, setup } from "xstate";
import Solflare from "@solflare-wallet/sdk";
import {
	Connection,
	type PublicKey,
	Transaction,
	SystemProgram,
} from "@solana/web3.js";
import { getConnection } from "../utils/solanaConnection";

export interface SolanaWalletContext {
	wallet: Solflare | null;
	balance: number;
	transactionSignature: string;
	publicKey: PublicKey | null;
}

export type SolanaWalletEvent =
	| { type: "CONNECT" }
	| { type: "DISCONNECT" }
	| { type: "SENDING_TRANSACTION" }
	| { type: "RETRY" };

interface ConnectWalletDoneEvent {
	type: "done.invoke.connectWallet";
	output: {
		publicKey: PublicKey;
		wallet: Solflare;
		balance: number;
	};
}

interface SendTransactionDoneEvent {
	type: "done.invoke.sendTransaction";
	output: {
		signature: string;
	};
}

export const solanaWalletMachine = setup({
	types: {
		context: {} as SolanaWalletContext,
		events: {} as
			| { type: "CONNECTING" }
			| { type: "CONNECT" }
			| { type: "DISCONNECT" }
			| { type: "SENDING_TRANSACTION" }
			| { type: "RETRY" }
			| ConnectWalletDoneEvent
			| SendTransactionDoneEvent,
	},
	actors: {
		connectWallet: fromPromise(async () => {
			const wallet = new Solflare({network: 'devnet' });
			await wallet.connect();
			if (!wallet.publicKey) throw new Error("No public key found");
			const connection = getConnection();
			const newBalance = await connection.getBalance(wallet.publicKey);
			return { publicKey: wallet.publicKey, wallet, balance: newBalance / 1e9 };
		}),
		sendTransaction: fromPromise(
			async ({
				input,
			}: {
				input: { publicKey: PublicKey | null; wallet: Solflare | null };
			}) => {
				if (!input?.publicKey) throw new Error("No public key found");
				const connection = getConnection();
				const { blockhash, lastValidBlockHeight } =
					await connection.getLatestBlockhash();
				const transaction = new Transaction().add(
					SystemProgram.transfer({
						fromPubkey: input.publicKey,
						toPubkey: input.publicKey,
						lamports: 0,
					}),
				);
				transaction.feePayer = input.publicKey; // Set the fee payer
				transaction.recentBlockhash = blockhash;
				transaction.lastValidBlockHeight = lastValidBlockHeight;

				if (!input?.wallet) throw new Error("No wallet found");
				try {
					const signature =
						await input.wallet.signAndSendTransaction(transaction);
					await connection.confirmTransaction(
						{
							signature,
							blockhash,
							lastValidBlockHeight,
						},
						"confirmed",
					);
					return { signature };
				} catch (error) {
					console.error("Transaction failed:", error);
					throw error;
				}
			},
		),
	},
	actions: {
		disconnectWallet({ context }) {
			return context.wallet?.disconnect().then(() => ({ wallet: null }));
		},
	},
}).createMachine({
	context: {
		wallet: new Solflare({ network: 'devnet' }),
		balance: 0,
		transactionSignature: "",
		publicKey: null,
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
						publicKey: ({
							context,
							event,
						}: {
							context: SolanaWalletContext;
							event: ConnectWalletDoneEvent;
						}) => context.publicKey || event.output.publicKey,
						wallet: ({
							context,
							event,
						}: {
							context: SolanaWalletContext;
							event: ConnectWalletDoneEvent;
						}) => event.output.wallet ?? context.wallet,
						balance: ({
							context,
							event,
						}: {
							context: SolanaWalletContext;
							event: ConnectWalletDoneEvent;
						}) => event.output.balance ?? context.balance,
					}),
				},
				onError: {
					target: "DISCONNECTED",
				},
			},
		},
		CONNECTED: {
			on: {
				DISCONNECT: {
					target: "DISCONNECTED",
					actions: "disconnectWallet",
				},
				SENDING_TRANSACTION: "SENDING_TRANSACTION",
			},
		},
		SENDING_TRANSACTION: {
			invoke: {
				id: "sendTransaction",
				src: "sendTransaction",
				input: ({ context }) => ({
					publicKey: context.publicKey,
					wallet: context.wallet,
				}),
				onDone: {
					target: "CONNECTED",
					actions: assign({
						transactionSignature: ({
							context,
							event,
						}: {
							context: SolanaWalletContext;
							event: SendTransactionDoneEvent;
						}) => context.transactionSignature || event.output.signature,
					}),
				},
				onError: {
					target: "CONNECTED",
				},
			},
		},
		ERROR: {
			on: {
				RETRY: "CONNECTED",
			},
		},
	},
});

export default solanaWalletMachine;
