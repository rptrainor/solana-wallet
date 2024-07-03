"use client";

import { useEffect, type FC } from "react";
import { DialogTitle } from "@headlessui/react";

import { useSolanaWalletMachine } from "~/stores/solanaWalletStore";

import Hero from "./Hero";
import Menu from "./Menu";
import Modal from "./Modal";
import type { SolanaWalletEvent } from "~/machines/solanaWalletMachine";

const STATUS_DICTIONARY: Record<SolanaWalletEvent["type"], string> = {
	CONNECTING: "Connecting to network",
	CONNECTED: "Connected to network",
	CONNECT: "Connecting to network",
	DISCONNECT: "Disconnecting from network",
	DISCONNECTING: "Disconnecting from network",
	DISCONNECTED: "Disconnected from network",
	SENDING_TRANSACTION: "Sending transaction",
	ERROR: "Error",
	TRANSACTION_MODAL: "Transaction Modal Open",
	CANCEL: "Transaction Canceled",
	RETRY: "Retrying Connection",
	"done.invoke.connectWallet": "Connected to network",
	"done.invoke.sendTransaction": "Transaction Sent",
};

const WalletDetails: FC = () => {
  const { context, value, send } = useSolanaWalletMachine();
	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const amount = formData.get("amount") ?? "0";
		send({ type: "SENDING_TRANSACTION", data: { amount: Number(amount) } });
		console.log("Submitted");
	};

	const isDisconnected = value === "DISCONNECTED";
	const isError = value === "ERROR";
	const isModalOpen = value === "TRANSACTION_MODAL";
	const updating = value === "SENDING_TRANSACTION" || value === "CONNECTING";
	const isConnected = value === "CONNECTED";
	const isConnectedOrModalOpen = isConnected || value === "TRANSACTION_MODAL";

	useEffect(() => {
		console.log({
			value,
			context
		});
	}, [value, context]);
	return (
		<>
			<div>
				<div className="flex flex-col sm:flex-row-reverse gap-4">
					{isConnectedOrModalOpen && <Menu />}
					<div className="flex flex-col gap-4 grow">
						{isDisconnected && <Hero />}

						<dl className="grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center mx-auto max-w-4xl w-full">
							{isConnected && (
								<div className="flex flex-col bg-white/5 xs:p-8 py-2 px-4">
									<dd className="order-first text-lg font-semibold tracking-tight text-white">
										{context.balance} SOL
									</dd>
									<dt className="text-sm font-semibold leading-6 text-gray-300">
										balance
									</dt>
								</div>
							)}

							{isConnectedOrModalOpen && context.transactionSignature && (
								<div className="flex flex-col bg-white/5 xs:p-8 py-2 px-4">
									<dt className="text-sm font-semibold leading-6 text-gray-300">
										last transaction signature
									</dt>
									<dd className="order-first text-lg font-semibold tracking-tight text-white text-wrap break-words">
										<a
											href={`https://solscan.io/tx/${context.transactionSignature}?cluster=devnet`}
											target="_blank"
											rel="noopener noreferrer"
										>
											{context.transactionSignature}
										</a>
									</dd>
								</div>
							)}
							{!isDisconnected && !isModalOpen && (
								<div
									className={`flex flex-col ${updating ? "animate-pulse" : ""} bg-white/5 xs:p-8 py-2 px-4`}
								>
									<dt className="text-sm font-semibold leading-6 text-gray-300">
										connection status
									</dt>
									<dd className="order-first text-lg font-semibold tracking-tight text-white break-words hyphens-auto">
										{STATUS_DICTIONARY[value as SolanaWalletEvent["type"]]}
									</dd>
								</div>
							)}
						</dl>
					</div>
				</div>
			</div>

			<Modal open={isError} setOpen={() => send({ type: "RETRY" })}>
				<div>
					<div className="mx-auto flex h-8 w-8 xs:h-12 xs:w-12 items-center justify-center rounded-full bg-slate-300">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 512 512"
							aria-label="Reset network connection"
							className="h-4 w-4 xs:h-6 xs:w-6 fill-slate-800"
						>
							<title id="reset">Reset network connection</title>
							<path d="M125.7 160H176c17.7 0 32 14.3 32 32s-14.3 32-32 32H48c-17.7 0-32-14.3-32-32V64c0-17.7 14.3-32 32-32s32 14.3 32 32v51.2L97.6 97.6c87.5-87.5 229.3-87.5 316.8 0s87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3s-163.8-62.5-226.3 0L125.7 160z" />
						</svg>
					</div>
					<div className="mt-3 text-center sm:mt-5">
						<DialogTitle
							as="h3"
							className="text-sm xs:text-base font-semibold leading-6 text-slate-900"
						>
							Wallet Disconnected
						</DialogTitle>
						<div className="mt-2">
							<p className="text-xs xs:text-sm text-slate-500 text-start sm:text-center text-balance">
								We were unable to connect to your wallet. Please try again.
							</p>
						</div>
					</div>
				</div>
				<div className="mt-4 xs:mt-5 sm:mt-6">
					<button
						type="button"
						className="inline-flex w-full justify-center rounded-md bg-slate-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
						onClick={() => send({ type: "RETRY" })}
					>
						Back
					</button>
				</div>
			</Modal>

			<Modal open={isModalOpen} setOpen={() => send({ type: "RETRY" })}>
				<form onSubmit={handleSubmit}>
					<div>
						<div className="border-b border-slate-800/10 pb-4 xs:pb-12">
							<p className="mt-1 text-xs xs:text-sm leading-tight text-slate-600">
								Please enter the amount of SOL you want to send.
							</p>
							<div className="col-span-full">
								<label
									htmlFor="amount"
									className="block text-sm font-medium leading-6 text-slate-900 mt-4"
								>
									Amount:
								</label>
								<div className="relative mt-2 rounded-md shadow-sm">
									<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
										<span className="text-gray-500 sm:text-sm">
											<svg
												width="101"
												height="88"
												viewBox="0 0 101 88"
												fill="none"
												xmlns="http://www.w3.org/2000/svg"
												aria-label="Sol"
												className="h-3 w-3 fill-slate-900"
											>
												<title id="Sol">Sol</title>
												<path
													d="M100.48 69.3817L83.8068 86.8015C83.4444 87.1799 83.0058 87.4816 82.5185 87.6878C82.0312 87.894 81.5055 88.0003 80.9743 88H1.93563C1.55849 88 1.18957 87.8926 0.874202 87.6912C0.558829 87.4897 0.31074 87.2029 0.160416 86.8659C0.0100923 86.529 -0.0359181 86.1566 0.0280382 85.7945C0.0919944 85.4324 0.263131 85.0964 0.520422 84.8278L17.2061 67.408C17.5676 67.0306 18.0047 66.7295 18.4904 66.5234C18.9762 66.3172 19.5002 66.2104 20.0301 66.2095H99.0644C99.4415 66.2095 99.8104 66.3169 100.126 66.5183C100.441 66.7198 100.689 67.0067 100.84 67.3436C100.99 67.6806 101.036 68.0529 100.972 68.415C100.908 68.7771 100.737 69.1131 100.48 69.3817ZM83.8068 34.3032C83.4444 33.9248 83.0058 33.6231 82.5185 33.4169C82.0312 33.2108 81.5055 33.1045 80.9743 33.1048H1.93563C1.55849 33.1048 1.18957 33.2121 0.874202 33.4136C0.558829 33.6151 0.31074 33.9019 0.160416 34.2388C0.0100923 34.5758 -0.0359181 34.9482 0.0280382 35.3103C0.0919944 35.6723 0.263131 36.0083 0.520422 36.277L17.2061 53.6968C17.5676 54.0742 18.0047 54.3752 18.4904 54.5814C18.9762 54.7875 19.5002 54.8944 20.0301 54.8952H99.0644C99.4415 54.8952 99.8104 54.7879 100.126 54.5864C100.441 54.3849 100.689 54.0981 100.84 53.7612C100.99 53.4242 101.036 53.0518 100.972 52.6897C100.908 52.3277 100.737 51.9917 100.48 51.723L83.8068 34.3032ZM1.93563 21.7905H80.9743C81.5055 21.7907 82.0312 21.6845 82.5185 21.4783C83.0058 21.2721 83.4444 20.9704 83.8068 20.592L100.48 3.17219C100.737 2.90357 100.908 2.56758 100.972 2.2055C101.036 1.84342 100.99 1.47103 100.84 1.13408C100.689 0.79713 100.441 0.510296 100.126 0.308823C99.8104 0.107349 99.4415 1.24074e-05 99.0644 0L20.0301 0C19.5002 0.000878397 18.9762 0.107699 18.4904 0.313848C18.0047 0.519998 17.5676 0.821087 17.2061 1.19848L0.524723 18.6183C0.267681 18.8866 0.0966198 19.2223 0.0325185 19.5839C-0.0315829 19.9456 0.0140624 20.3177 0.163856 20.6545C0.31365 20.9913 0.561081 21.2781 0.875804 21.4799C1.19053 21.6817 1.55886 21.7896 1.93563 21.7905Z"
													fill="url(#paint0_linear_174_4403)"
												/>
												<defs>
													<linearGradient
														id="paint0_linear_174_4403"
														x1="8.52558"
														y1="90.0973"
														x2="88.9933"
														y2="-3.01622"
														gradientUnits="userSpaceOnUse"
													>
														<stop offset="0.08" stopColor="currentColor" />
														<stop offset="0.3" stopColor="currentColor" />
														<stop offset="0.5" stopColor="currentColor" />
														<stop offset="0.6" stopColor="currentColor" />
														<stop offset="0.72" stopColor="currentColor" />
														<stop offset="0.97" stopColor="currentColor" />
													</linearGradient>
												</defs>
											</svg>
										</span>
									</div>
									<input
										type="text"
										name="amount"
										id="amount"
										className="block w-full rounded-md border-0 py-1.5 pl-7 pr-12 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-slate-600 sm:text-sm sm:leading-6"
										placeholder="0.000"
										aria-describedby="amount-currency"
									/>
									<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
										<span
											className="text-slate-500 sm:text-sm"
											id="amount-currency"
										>
											SOL
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="xs:mt-6 mt-2 flex items-center justify-end gap-x-6">
						<button
							type="button"
							className="text-sm font-semibold leading-6 text-slate-800"
							onClick={() => send({ type: "CANCEL" })}
						>
							Cancel
						</button>
						<button
							type="submit"
							className="rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
						>
							Save
						</button>
					</div>
				</form>
			</Modal>
		</>
	);
};

export default WalletDetails;
