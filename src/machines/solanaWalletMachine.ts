import { createMachine, assign, fromPromise, setup } from "xstate";
import Solflare from "@solflare-wallet/sdk";
import {
	Connection,
	type PublicKey,
	Transaction,
	SystemProgram,
	LAMPORTS_PER_SOL,
	sendAndConfirmRawTransaction,
} from "@solana/web3.js";

export interface SolanaWalletContext {
	wallet: Solflare | null;
	balance: number;
	transactionSignature: string;
	publicKey: PublicKey | null;
}

export const solanaWalletMachine = setup({
	types: {
		context: {} as SolanaWalletContext,
		events: {} as
			| { type: "CONNECT" }
			| { type: "DISCONNECT" }
			| { type: "SENDING_TRANSACTION"; toPublicKey: PublicKey; amount: number }
			| { type: "RETRY" }
			| {
				type: "done.invoke.connectWallet";
				output: { publicKey: PublicKey; wallet: Solflare; balance: number };
			}
			| { type: "done.invoke.sendTransaction"; output: { signature: string } },
	},
	actors: {
		connectWallet: fromPromise(async () => {
			const wallet = new Solflare({ network: "devnet" });
			await wallet.connect();
			const connection = new Connection("https://api.devnet.solana.com/");
			if (!wallet.publicKey) throw new Error("No public key found");
			const newBalance = await connection.getBalance(wallet.publicKey);
			return {
				publicKey: wallet.publicKey,
				wallet,
				balance: newBalance / LAMPORTS_PER_SOL,
			};
		}),
		sendTransaction: fromPromise(
			async ({
				input,
			}: {
				input: { publicKey: PublicKey | null; wallet: Solflare | null; toPublicKey: PublicKey | null; amount: number | 0 };
			}) => {
				const { publicKey, wallet, toPublicKey, amount } = input;
				if (!publicKey) throw new Error("No public key found");
				if (!wallet) throw new Error("No wallet found");
				if (!toPublicKey) throw new Error("No toPublicKey found");

				const connection = new Connection("https://api.devnet.solana.com", "confirmed");

				// Fetch recent blockhash
				const { blockhash } = await connection.getLatestBlockhash();

				const transferInstruction = SystemProgram.transfer({
					fromPubkey: publicKey,
					toPubkey: toPublicKey,
					lamports: amount * LAMPORTS_PER_SOL,
				});

				const transaction = new Transaction().add(transferInstruction);
				transaction.recentBlockhash = blockhash;
				transaction.feePayer = publicKey;

				try {
					// Sign the transaction using the Solflare wallet
					const signedTransaction = await wallet.signTransaction(transaction);

					// Convert the signed transaction to Buffer before sending
					const serializedTransaction = Buffer.from(signedTransaction.serialize());

					// Send and confirm the signed transaction
					const signature = await sendAndConfirmRawTransaction(connection, serializedTransaction);
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
		wallet: null,
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
						publicKey: ({ context, event }) => event.output.publicKey || context.publicKey,
						wallet: ({ context, event }) => event.output.wallet || context.wallet,
						balance: ({ context, event }) => event.output.balance || context.balance,
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
				SENDING_TRANSACTION: {
					target: "CHECK_READY_TO_SEND",
				},
			},
		},
		CHECK_READY_TO_SEND: {
			always: [
				{
					target: "SENDING_TRANSACTION",
					guard: ({ context }) => context.publicKey !== null && context.wallet !== null,
				},
				{
					target: "ERROR",
				},
			],
		},
		SENDING_TRANSACTION: {
			invoke: {
				id: "sendTransaction",
				src: "sendTransaction",
				input: ({ context }) => ({
					publicKey: context.publicKey,
					wallet: context.wallet,
					toPublicKey: context.publicKey,
					amount: 0,
				}),
				onDone: {
					target: "CONNECTED",
					actions: assign({
						transactionSignature: ({ context, event }) =>
							event.output.signature || context.transactionSignature,
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
