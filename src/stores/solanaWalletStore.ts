// src/store/solanaWalletStore.ts
import { create } from "zustand";
import { useMachine } from "@xstate/react";
import solanaWalletMachine, {
	type SolanaWalletContext,
	type SolanaWalletEvent,
} from "../machines/solanaWalletMachine";

export interface SolanaWalletState {
	context: SolanaWalletContext;
	value: string;
}

type SolanaWalletStoreState = {
	state: SolanaWalletState;
	send: (event: SolanaWalletEvent) => void;
};

export const useSolanaWalletStore = create<SolanaWalletStoreState>((set) => {
	const [state, send] = useMachine(solanaWalletMachine);

	// Transform XState state to Zustand-compatible state
	const zustandState: SolanaWalletStoreState = {
		state: {
			context: state.context,
			value: state.value as string,
		},
		send,
	};

	return zustandState;
});
