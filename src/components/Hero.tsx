// import { ChevronRightIcon } from '@heroicons/react/20/solid'

const Hero = () => {
  return (
    <div className="relative isolate overflow-hidden bg-slate-800 rounded">
 
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">
          <h1 className="mt-10 text-4xl font-bold tracking-tight text-slate-200 sm:text-6xl">
            Your Solana wallet
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            Easily check your Solana wallet balance and send transactions with ease.
          </p>
          <div className="mt-10 flex items-center gap-x-6">
            <a
              href="/"
              className="rounded-md bg-yellow-500 px-3.5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            >
              Get started
            </a>
            <a href="/" className="text-sm font-semibold leading-6 text-white">
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
        {/* <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
          <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
            <img
              src="https://tailwindui.com/img/component-images/dark-project-app-screenshot.png"
              alt="App screenshot"
              width={2432}
              height={1442}
              className="w-[76rem] rounded-md bg-white/5 shadow-2xl ring-1 ring-white/10"
            />
          </div>
        </div> */}
      </div>
    </div>
  )
}

export default Hero;
