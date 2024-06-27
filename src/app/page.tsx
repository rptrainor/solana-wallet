import type React from "react";

import WalletDetails from "../components/WalletDetails";
// import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

const App: React.FC = () => {
	return (
		<div className="App">
			{/* <ToastContainer /> */}
			<h1>Solana Wallet Connector</h1>
			<WalletDetails />
		</div>
	);
};

export default App;
