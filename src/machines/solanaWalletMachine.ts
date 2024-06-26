// src/machines/solanaWalletMachine.ts
import { createMachine, assign, setup } from "xstate";
import type Solflare from "@solflare-wallet/sdk";
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
  | { type: "SEND_TRANSACTION" }
  | { type: "RETRY" };

const solanaWalletMachine = setup({
  types: {
    context: {} as SolanaWalletContext,
    events: {} as
      | { type: 'CONNECT'; }
      | { type: 'DISCONNECT'; }
      | { type: 'SEND_TRANSACTION'; }
      | { type: 'RETRY'; }
  },
  id: "solanaWallet",
  initial: "disconnected",
  context: {
  wallet: new Solflare(),
  balance: 0,
  transactionSignature: "",
  publicKey: null,
},
  states:
  {
    CONNECT: "connecting",
	,
	,
  connecting:
    src: "connectWallet", onDone;
	:
target: "connected", actions;
	: assign(
  publicKey: (_, event) => event?.data?.publicKey,
),
	,
  onError:
target: "disconnected",
	,
	,
	,
  connected:
entry: "updateBalance", on;
	:
DISCONNECT: "disconnecting", SEND_TRANSACTION;
	: "sendingTransaction",
	,
	,
  disconnecting:
src: "disconnectWallet", onDone;
	:
target: "disconnected", actions;
	: assign(
  balance: 0, publicKey;
	: null,
	),
	,
onError:
target: "connected",
	,
	,
	,
  sendingTransaction:
src: "sendTransaction", onDone;
	:
target: "connected", actions;
	: assign(
  transactionSignature: (_, event) => event?.data.signature,
),
	,
  onError:
target: "connected",
	,
	,
	,
  error:
RETRY: "connected",
	,
	,
}
,
})
// const solanaWalletMachine = createMachine<
// 	SolanaWalletContext,
// 	SolanaWalletEvent
// >(
// 	{
// 		id: "solanaWallet",
// 		initial: "disconnected",
// 		context: {
// 			wallet: new Solflare(),
// 			balance: 0,
// 			transactionSignature: "",
// 			publicKey: null,
// 		},
// 		states: {
// 			disconnected: {
// 				on: {
// 					CONNECT: "connecting",
// 				},
// 			},
// 			connecting: {
// 				invoke: {
// 					src: "connectWallet",
// 					onDone: {
// 						target: "connected",
// 						actions: assign({
// 							publicKey: (_, event) => event?.data?.publicKey,
// 						}),
// 					},
// 					onError: {
// 						target: "disconnected",
// 					},
// 				},
// 			},
// 			connected: {
// 				entry: "updateBalance",
// 				on: {
// 					DISCONNECT: "disconnecting",
// 					SEND_TRANSACTION: "sendingTransaction",
// 				},
// 			},
// 			disconnecting: {
// 				invoke: {
// 					src: "disconnectWallet",
// 					onDone: {
// 						target: "disconnected",
// 						actions: assign({
// 							balance: 0,
// 							publicKey: null,
// 						}),
// 					},
// 					onError: {
// 						target: "connected",
// 					},
// 				},
// 			},
// 			sendingTransaction: {
// 				invoke: {
// 					src: "sendTransaction",
// 					onDone: {
// 						target: "connected",
// 						actions: assign({
// 							transactionSignature: (_, event) => event?.data.signature,
// 						}),
// 					},
// 					onError: {
// 						target: "connected",
// 					},
// 				},
// 			},
// 			error: {
// 				on: {
// 					RETRY: "connected",
// 				},
// 			},
// 		},
// 	},
// 	{
// 		services: {
// 			connectWallet: async () => {
// 				const wallet = new Solflare();
// 				await wallet.connect();
// 				return { publicKey: wallet.publicKey };
// 			},
// 			disconnectWallet: async (context) => {
// 				await context.wallet?.disconnect();
// 			},
// 			sendTransaction: async (context) => {
// 				const connection = getConnection();
// 				const transaction = new Transaction().add(
// 					SystemProgram.transfer({
// 						fromPubkey: context.publicKey!,
// 						toPubkey: context.publicKey!,
// 						lamports: 0,
// 					}),
// 				);
// 				const signature =
// 					await context.wallet!.signAndSendTransaction(transaction);
// 				await connection.confirmTransaction(signature, "confirmed");
// 				return { signature };
// 			},
// 		},
// 		actions: {
// 			updateBalance: assign(async (context) => {
// 				if (context.publicKey) {
// 					const connection = getConnection();
// 					const newBalance = await connection.getBalance(context.publicKey);
// 					return { balance: newBalance / 1e9 }; // Convert lamports to SOL
// 				}
// 				return { balance: 0 };
// 			}),
// 		},
// 	},
// );

export default solanaWalletMachine;
