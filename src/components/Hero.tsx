import { useSolanaWallet } from "~/context/SolanaWalletContext";

const Hero = () => {
  const { send } = useSolanaWallet();

  return (
    <div className="relative isolate overflow-hidden bg-slate-800 rounded">

      <div className="mx-auto max-w-7xl xs:px-6 pb-12 xs:pt-10 lg:flex lg:px-8">
        <div className="mx-auto max-w-2xl gap-4 flex flex-col lg:mx-0 lg:max-w-xl lg:pt-8">
          <h1 className="xs:mt-10 text-4xl font-bold tracking-tight text-slate-200 sm:text-6xl text-balance">
            Send &#38; Receive SOL
          </h1>
          <p className="xs:mt-6 text-lg leading-tight text-slate-300">
            Easily check your Solana wallet balance and send transactions with ease.
          </p>
          <div className="mt-10 gap-y-4 items-start flex sm:flex-row flex-col sm:items-center gap-x-6">
            <button
              type="button"
              onClick={() => send({ type: "CONNECT" })}
              className="group/button relative inline-flex items-center justify-center overflow-hidden bg-yellow-500 py-1 px-2 rounded-full text-xs font-normal text-black transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-yellow-400/30 drop-shadow-2xl border-black border-2"
            >
              <span className="text-lg  font-bold">
                Connect wallet
              </span>
              <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]">
                <div className="relative h-full w-8 bg-white/20" />
              </div>
            </button>
            <a href="https://chromewebstore.google.com/detail/solflare-wallet/bhhhlbepdkbapadjdnnojkbgioiodbic" 
            className="group/button relative inline-flex items-center justify-center overflow-hidden bg-slate-800 py-1 px-2 rounded-full text-xs font-normal text-white transition-all duration-300 ease-in-out hover:scale-105"
            >
              <span className="text-lg font-bold">
              Get a wallet <span aria-hidden="true">→</span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero;
