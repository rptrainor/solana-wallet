"use client";

import type React from "react";
import { useSolanaWalletStore } from "~/stores/solanaWalletStore";

const WalletDetails: React.FC = () => {
	const { state, send } = useSolanaWalletStore();

	return (
		<div>
			<button type="button" onClick={() => send({ type: "CONNECT" })}>Connect Wallet</button>
			<button type="button"  onClick={() => send({ type: "DISCONNECT" })}>
				Disconnect Wallet
			</button>
			<button type="button"  onClick={() => send({ type: "SEND_TRANSACTION" })}>
				Send Test Transaction
			</button>
			<div>Balance: {state.context.balance} SOL</div>
			<div>Transaction Signature: {state.context.transactionSignature}</div>
			<div>Status: {state.value}</div>
		</div>
	);
};

export default WalletDetails;
