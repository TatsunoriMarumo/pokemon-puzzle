import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  isActive?: boolean;
};

export function Button({ children, isActive = false, className = "", ...props }: Props) {
  return (
    <button
      type="button"
      className={`rounded-xl px-4 py-2 font-bold transition ${
        isActive
          ? "bg-red-500 text-white"
          : "bg-white text-slate-700 hover:bg-slate-200"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
