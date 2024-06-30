"use client"

import type React from "react";
import { useEffect } from "react";
import { useSolanaWallet } from "~/context/SolanaWalletContext";
import Hero from "./Hero";
import Menu from "./Menu";

const WalletDetails: React.FC = () => {
	const { context, value } = useSolanaWallet();

	useEffect(() => {
		console.log({
			context,
			value,
		});
	}, [context, value]);

	return (
		<div>
			<div className="flex flex-col sm:flex-row-reverse gap-4">
				<Menu />
				<div className="flex flex-col gap-4 grow">
					<Hero />
					{value !== "ERROR" && value !== "DISCONNECTED" && (
						<dl className="grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center mx-auto max-w-4xl w-full">
							{context.balance !== null && (
								<div className="flex flex-col bg-white/5 p-8 w-full">
									<dd className="order-first text-3xl font-semibold tracking-tight text-white">{context.balance} SOL</dd>
									<dt className="text-sm font-semibold leading-6 text-gray-300">balance</dt>
								</div>
							)}
							{value !== "CONNECTING" && (
								<div className="flex flex-col bg-white/5 p-8">
									<dt className="text-sm font-semibold leading-6 text-gray-300">last transaction signature</dt>
									<dd className="order-first text-3xl font-semibold tracking-tight text-white">{context.transactionSignature}</dd>
								</div>
							)}
							<div className="flex flex-col bg-white/5 p-8">
								<dt className="text-sm font-semibold leading-6 text-gray-300">connection status</dt>
								<dd className="order-first text-3xl font-semibold tracking-tight text-white">{value}</dd>
							</div>
						</dl>
					)}
				</div>

			</div>
		</div>
	);
};

export default WalletDetails;
