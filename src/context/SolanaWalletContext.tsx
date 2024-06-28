import type React from "react";
import { createContext, useContext } from "react";
import { useMachine } from "@xstate/react";
import solanaWalletMachine, {
  type SolanaWalletContext,
  type SolanaWalletEvent,
} from "../machines/solanaWalletMachine";

interface SolanaWalletProviderProps {
  children: React.ReactNode;
}

const SolanaWalletReactContext = createContext<
  | {
    context: SolanaWalletContext;
    value: string;
    send: (event: SolanaWalletEvent) => void;
  }
  | undefined
>(undefined);

const SolanaWalletProvider: React.FC<SolanaWalletProviderProps> = ({
  children,
}) => {
  const [state, send] = useMachine(solanaWalletMachine);

  return (
    <SolanaWalletReactContext.Provider value={{ context: state.context, value: state.value as string, send }}>
      {children}
    </SolanaWalletReactContext.Provider>
  );
};

const useSolanaWallet = () => {
  const context = useContext(SolanaWalletReactContext);
  if (context === undefined) {
    throw new Error(
      "useSolanaWallet must be used within a SolanaWalletProvider",
    );
  }
  return context;
};

export { SolanaWalletProvider, useSolanaWallet };
