import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type CommonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

type ButtonAsLink = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantClasses = {
  primary:
    "border-[#FFD43B] bg-[#FFD43B] text-black shadow-[0_0_26px_rgba(255,212,59,0.15)] hover:bg-[#FFE169]",
  secondary:
    "border-[#3A3A3A] bg-[#080808]/80 text-[#F5F5F5] hover:border-[#178BFF]/70 hover:text-white",
  ghost:
    "border-transparent bg-transparent text-[#F5F5F5] hover:border-[#262626] hover:bg-[#101010]",
};

export function Button({
  children,
  variant = "secondary",
  className = "",
  ...props
}: ButtonProps) {
  const classes = [
    "inline-flex h-12 items-center justify-center gap-2 rounded-md border px-5 text-sm font-semibold transition duration-200",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#178BFF]",
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if ("href" in props && props.href) {
    const linkProps = props as AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
    return (
      <Link className={classes} {...linkProps}>
        {children}
      </Link>
    );
  }

  const buttonProps = props as ButtonHTMLAttributes<HTMLButtonElement>;

  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
