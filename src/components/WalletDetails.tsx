"use client"

import type React from "react";
import { useEffect } from "react";
import { useSolanaWallet } from "~/context/SolanaWalletContext";

const WalletDetails: React.FC = () => {
	const { context, value, send } = useSolanaWallet();

	useEffect(() => {
		console.log({
			context,
			value,
		});
	}, [context, value]);

	return (
		<div>
			<button type="button" onClick={() => send({ type: "CONNECT" })}>
				Connect Wallet
			</button>
			<button type="button" onClick={() => send({ type: "DISCONNECT" })}>
				Disconnect Wallet
			</button>
			<button type="button" onClick={() => send({ type: "SENDING_TRANSACTION" })}>
				Send Test Transaction
			</button>
			<div>Balance: {context.balance} SOL</div>
			<div>Transaction Signature: {context.transactionSignature}</div>
			<div>Status: {value}</div>
		</div>
	);
};

export default WalletDetails;
