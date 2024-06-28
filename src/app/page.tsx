"use client";

import type React from "react";
import { SolanaWalletProvider } from "~/context/SolanaWalletContext";
import WalletDetails from "~/components/WalletDetails";

const App: React.FC = () => {
	return (
		<SolanaWalletProvider>
			<WalletDetails />
		</SolanaWalletProvider>
	);
};

export default App;
