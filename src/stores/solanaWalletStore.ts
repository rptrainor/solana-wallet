import { create } from "zustand";
import { useMachine } from "@xstate/react";
import type { StateFrom } from "xstate";
import solanaWalletMachine, {
	type SolanaWalletContext,
	type SolanaWalletEvent,
} from "../machines/solanaWalletMachine";
import { useEffect } from "react";

type SolanaWalletState = StateFrom<typeof solanaWalletMachine>;

interface SolanaWalletStore {
	context: SolanaWalletContext;
	value: string;
	send: (event: SolanaWalletEvent) => void;
	initialize: (
		state: SolanaWalletState,
		send: (event: SolanaWalletEvent) => void,
	) => void;
}

export const useSolanaWalletStore = create<SolanaWalletStore>((set) => ({
	context: {} as SolanaWalletContext,
	value: "DISCONNECTED",
	send: () => {},
	initialize: (state, send) =>
		set({ context: state.context, value: state.value, send }),
}));

export const useSolanaWalletMachine = () => {
	const [state, send] = useMachine(solanaWalletMachine);
	const initialize = useSolanaWalletStore((state) => state.initialize);

	useEffect(() => {
		initialize(state, send);
	}, [state, send, initialize]);

	return useSolanaWalletStore();
};
