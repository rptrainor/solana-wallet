import type { ComponentProps, FC } from "react";

const Button: FC<ComponentProps<"button">> = ({ children, ...restOfProps }) => {

  return (
    <button
      {...restOfProps}
      type="button"
      className="group/button relative inline-flex items-center justify-center overflow-hidden bg-yellow-500 p-2 w-8 h-8 rounded-full text-xs font-normal text-black transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-slate-600/30 border-black border-2"
    >

      <span className="text-lg font-bold">
        {children}
      </span>
      <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]">
        <div className="relative h-full w-8 bg-white/20" />
      </div>
    </button>
  )
}

export default Button;

