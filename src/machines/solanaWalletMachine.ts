import { createMachine, assign, fromPromise, setup } from "xstate";
import Solflare from "@solflare-wallet/sdk";
import {
	Connection,
	type PublicKey,
	Transaction,
	SystemProgram,
	LAMPORTS_PER_SOL,
	sendAndConfirmTransaction,
	Keypair,
	type Commitment,
} from "@solana/web3.js";

export interface SolanaWalletContext {
	wallet: Solflare | null;
	balance: number;
	transactionSignature: string;
	publicKey: PublicKey | null;
	connection: Connection | null;
}

const testKeypair = Keypair.generate(); // Generate a new keypair for testing
// const keypair = Keypair.generate();
// const payer = Keypair.generate();
// // let connection = new web3.Connection(web3.clusterApiUrl("testnet"));

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
			const connection = new Connection("https://api.devnet.solana.com/", "confirmed");
			if (!wallet.publicKey) throw new Error("No public key found");
			const newBalance = await connection.getBalance(wallet.publicKey);
			return {
				publicKey: wallet.publicKey,
				wallet,
				balance: newBalance / LAMPORTS_PER_SOL,
				connection
			};
		}),
		sendTransaction: fromPromise(
			async ({
				input,
			}: {
				input: {
					publicKey: PublicKey;
					wallet: Solflare;
					toPublicKey: PublicKey;
					amount: number;
					connection: Connection;
				};
			}) => {
				const { publicKey, wallet, toPublicKey, amount } = input;
				if (!publicKey) throw new Error("No public key found");
				if (!wallet) throw new Error("No wallet found");
				if (!toPublicKey) throw new Error("No toPublicKey found");
				if (!input.connection) throw new Error("No connection found");


				const { blockhash } = await input.connection.getLatestBlockhash();

				const transferInstruction = SystemProgram.transfer({
					fromPubkey: publicKey,
					toPubkey: toPublicKey,
					lamports: amount * LAMPORTS_PER_SOL,
				});

				const transaction = new Transaction({ recentBlockhash: blockhash }).add(transferInstruction);
        transaction.feePayer = publicKey;

				try {
					const signature = await wallet.signAndSendTransaction(transaction);

					// Send and confirm the signed transaction
					// const signature = await sendAndConfirmTransaction(connection, transaction, [{
					// 	publicKey: publicKey,
					// 	secretKey: secretKey,
					// }]);

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
		connection: null
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
						publicKey: ({ context, event }) =>
							event.output.publicKey || context.publicKey,
						wallet: ({ context, event }) =>
							event.output.wallet || context.wallet,
						balance: ({ context, event }) =>
							event.output.balance || context.balance,
						connection: ({ context, event }) =>
							event.output.connection || context.connection
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
					guard: ({ context }) =>
						context.publicKey !== null && context.wallet !== null,
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
				input: ({ context, event }) => {
					const toPublicKey = testKeypair.publicKey; // Use the test keypair's public key
					const amount = 1; // Amount of SOL to send (1 SOL in this case)
					return {
						publicKey: context.publicKey as PublicKey,
						wallet: context.wallet as Solflare,
						toPublicKey: toPublicKey,
						amount,
						connection: context.connection as Connection
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
