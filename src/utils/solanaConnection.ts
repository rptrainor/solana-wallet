import { Connection } from "@solana/web3.js";

// Define the Solana devnet endpoint
const DEVNET_ENDPOINT = "https://api.devnet.solana.com";

export const getConnection = () => {
  return new Connection(DEVNET_ENDPOINT);
};
