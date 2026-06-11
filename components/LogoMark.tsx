import Image from "next/image";

type LogoMarkProps = {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
};

const markSizes = {
  sm: "h-7 w-7",
  md: "h-10 w-10",
  lg: "h-16 w-16",
  xl: "h-32 w-32 sm:h-40 sm:w-40 lg:h-44 lg:w-44",
};

export function LogoMark({ size = "md", showText = false, className = "" }: LogoMarkProps) {
  if (showText) {
    return (
      <span className={["inline-flex items-center", className].filter(Boolean).join(" ")}>
        {/* Replace this cropped reference asset with the official transparent full logo when supplied. */}
        <Image
          src="/logos/chester-studio-full.png"
          alt="Chester Studio"
          width={190}
          height={44}
          priority
          unoptimized
          className="h-8 w-auto sm:h-9"
        />
      </span>
    );
  }

  return (
    <span className={["inline-flex items-center justify-center", className].filter(Boolean).join(" ")}>
      {/* Replace this cropped reference asset with the official transparent C mark when supplied. */}
      <Image
        src="/logos/chester-c-core.png"
        alt=""
        width={210}
        height={210}
        priority={size === "xl"}
        unoptimized
        className={["chester-logo-image object-contain", markSizes[size]].join(" ")}
      />
    </span>
  );
}
