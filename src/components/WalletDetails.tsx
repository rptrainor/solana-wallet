"use client"

import { type FC, useEffect } from "react";
import { DialogTitle } from "@headlessui/react";

import { useSolanaWallet } from "~/context/SolanaWalletContext";
import Hero from "./Hero";
import Menu from "./Menu";
import Modal from "./Modal";

const WalletDetails: FC = () => {
	const { context, value, send } = useSolanaWallet();

	useEffect(() => {
		console.log({
			context,
			value,
		});
	}, [context, value]);

	return (
		<>
			<div>
				<div className="flex flex-col sm:flex-row-reverse gap-4">
					<Menu />
					<div className="flex flex-col gap-4 grow">
						{value === "DISCONNECTED" && (<Hero />)}
						{value !== "ERROR" && value !== "DISCONNECTED" && (
							<dl className="grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center mx-auto max-w-4xl w-full">
								{context.balance !== null && (
									<div className="flex flex-col bg-white/5 p-8 w-full">
										<dd className="order-first text-3xl font-semibold tracking-tight text-white">{context.balance} SOL</dd>
										<dt className="text-sm font-semibold leading-6 text-gray-300">balance</dt>
									</div>
								)}
								{value !== "CONNECTING" && context.transactionSignature && (
									<div className="flex flex-col bg-white/5 p-8">
										<dt className="text-sm font-semibold leading-6 text-gray-300">last transaction signature</dt>
										<dd className="order-first text-3xl font-semibold tracking-tight text-white text-wrap break-words">{context.transactionSignature}</dd>
									</div>
								)}
								<div className="flex flex-col bg-white/5 p-8">
									<dt className="text-sm font-semibold leading-6 text-gray-300">connection status</dt>
									<dd className="order-first text-3xl font-semibold tracking-tight text-white break-words">{value}</dd>
								</div>
							</dl>
						)}
					</div>

				</div>
			</div>
			<Modal open={value === "ERROR"} setOpen={() => send({ type: "RETRY" })}>
				<div>
					<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
						<svg
							xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
							aria-label='Reset network connection'
							className="h-6 w-6 fill-slate-800"
						>
							<title id='reset'>Reset network connection</title>
							<path d="M125.7 160H176c17.7 0 32 14.3 32 32s-14.3 32-32 32H48c-17.7 0-32-14.3-32-32V64c0-17.7 14.3-32 32-32s32 14.3 32 32v51.2L97.6 97.6c87.5-87.5 229.3-87.5 316.8 0s87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3s-163.8-62.5-226.3 0L125.7 160z" /></svg>
					</div>
					<div className="mt-3 text-center sm:mt-5">
						<DialogTitle as="h3" className="text-base font-semibold leading-6 text-slate-900">
							Opps! Something went wrong
						</DialogTitle>
						<div className="mt-2">
							<p className="text-sm text-slate-500">
								Please try to reconnect to your wallet.
							</p>
						</div>
					</div>
				</div>
				<div className="mt-5 sm:mt-6">
					<button
						type="button"
						className="inline-flex w-full justify-center rounded-md bg-slate-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
						onClick={() => send({ type: "RETRY" })}
					>
						Reconnect
					</button>
				</div>
			</Modal>
		</>
	);
};

export default WalletDetails;
