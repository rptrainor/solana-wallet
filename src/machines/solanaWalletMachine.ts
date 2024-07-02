import { assign, fromPromise, setup } from "xstate";
import Solflare from "@solflare-wallet/sdk";
import {
	Connection,
	Transaction,
	SystemProgram,
	LAMPORTS_PER_SOL,
	type TransactionSignature,
	type Commitment,
} from "@solana/web3.js";
import { toast } from "sonner";

export interface SolanaWalletContext {
	wallet: Solflare | null;
	balance: number | null;
	transactionSignature: string;
}

export type SolanaWalletEvent =
	| { type: "DISCONNECTED" }
	| { type: "CONNECT" }
	| { type: "CONNECTING" }
	| { type: "CONNECTED" }
	| { type: "ERROR" }
	| { type: "DISCONNECTING" }
	| { type: "TRANSACTION_MODAL" }
	| { type: "CANCEL" }
	| { type: "SENDING_TRANSACTION"; data: { amount: number } }
	| { type: "RETRY" }
	| {
		type: "done.invoke.connectWallet";
		data: { wallet: Solflare; balance: number; connection: Connection };
	}
	| {
		type: "done.invoke.sendTransaction";
		data: { signature: TransactionSignature };
	};

const SOLANA_DEVNET = "https://api.devnet.solana.com/";

export const solanaWalletMachine = setup({
	types: {
		context: {} as SolanaWalletContext,
		events: {} as SolanaWalletEvent,
	},
	actors: {
		connectWallet: fromPromise(async () => {
			try {
				const wallet = new Solflare({ network: "devnet" });
				await wallet.connect();

				if (!wallet.publicKey) {
					toast.error("No public key found");
					throw new Error("No public key found");
				}

				const connection = new Connection(SOLANA_DEVNET);
				const newBalance = await connection.getBalance(
					wallet.publicKey,
					"finalized",
				);
				console.log({ newBalance });
				toast.success("Connected to wallet", {
					description: `Balance: ${newBalance / 1e9} SOL`,
				});

				return { wallet, balance: newBalance / 1e9 };
			} catch (error) {
				toast.info("Wallet disconnected");
				throw error;
			}
		}),

		sendTransaction: fromPromise(
			async ({
				input,
			}: {
				input: { wallet: Solflare | null; amount: number };
			}) => {
				if (!input.wallet) {
					toast.error("No wallet found");
					throw new Error("No wallet found");
				}
				if (!input.wallet.publicKey) {
					toast.error("No public key found");
					throw new Error("No public key found");
				}
				if (input.amount == null || input.amount < 0) {
					toast.error("Please enter a valid amount");
					throw new Error("Please enter a valid amount");
				}
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
					toast.info("Confirming transaction...");
					await connection.confirmTransaction(
						{
							signature,
							blockhash,
							lastValidBlockHeight,
						},
						"finalized",
					);

					const newBalance = await connection.getBalance(
						input.wallet.publicKey,
						"finalized",
					);
					console.log({ newBalance });
					toast.success("Transaction confirmed", {
						description: `Your balance is now ${newBalance / 1e9} SOL`,
					});
					return { signature, balance: newBalance / 1e9 };
				} catch (error) {
					toast.error("Transaction failed");
					throw error;
				}
			},
		),
		disconnectWallet: fromPromise(
			async ({ input }: { input: { wallet: Solflare | null } }) => {
				try {
					await input?.wallet?.disconnect();
					toast.success("Disconnected from wallet");
					return { wallet: null, balance: null, transactionSignature: null };
				} catch (error) {
					toast.error("Disconnection failed");
					throw error;
				}
			},
		),
	},
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
					target: "DISCONNECTED",
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
						amount: 0,
					};
				},
				onDone: {
					target: "CONNECTED",
					actions: assign({
						transactionSignature: ({ context, event }) =>
							event.output.signature || context.transactionSignature,
						balance: ({ context, event }) =>
							event.output.balance || context.balance,
					}),
				},
				onError: {
					target: "CONNECTED",
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
