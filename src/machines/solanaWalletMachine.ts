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
	| { type: "SEND_TRANSACTION" }
	| { type: "RETRY" };

export const solanaWalletMachine = setup({
	types: {
		context: {} as SolanaWalletContext,
		events: {} as
      | { type: "CONNECTING" }
			| { type: "CONNECT" }
			| { type: "DISCONNECT" }
			| { type: "SEND_TRANSACTION" }
			| { type: "RETRY" },
	},
	actors: {
    connectWallet: fromPromise(async () => {
      const wallet = new Solflare();
      await wallet.connect();
      if (!wallet.publicKey) throw new Error('No public key found');
      const connection = getConnection()
      const newBalance = await connection.getBalance(wallet?.publicKey)
      return { publicKey: wallet.publicKey, wallet, balance: newBalance / 1e9 };
    }),
    sendTransaction: fromPromise(async ({ input }: { input: { publicKey: PublicKey | null; wallet: Solflare | null } }) => {
      if (!input?.publicKey) throw new Error('No public key found');
      const connection = getConnection();
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: input.publicKey,
          toPubkey: input.publicKey,
          lamports: 0,
        })
      );
      transaction.recentBlockhash = blockhash;
      transaction.lastValidBlockHeight = lastValidBlockHeight;

      if (!input?.wallet) throw new Error('No wallet found');
      try {
        const signature = await input.wallet.signAndSendTransaction(transaction);
        await connection.confirmTransaction(
          {
            signature,
            blockhash,
            lastValidBlockHeight,
          },
          'confirmed'
        );
        return { signature };
      } catch (error) {
        console.error('Transaction failed:', error);
        throw error;
      }
    }),
	},
	actions: {
    disconnectWallet({ context }) {
      return context.wallet?.disconnect().then(() => ({ wallet: null }));
    },
	},
}).createMachine({
	context: {
		wallet: new Solflare(),
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
				src: "connectWallet",
				onDone: {
					target: "CONNECTED",
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
				SEND_TRANSACTION: "SENDING_TRANSACTION",
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
