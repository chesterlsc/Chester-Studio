type SectionHeaderProps = {
  title: string;
  copy?: string;
  align?: "center" | "left";
};

export function SectionHeader({ title, copy, align = "center" }: SectionHeaderProps) {
  return (
    <div
      className={[
        "mb-8 sm:mb-10",
        align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl",
      ].join(" ")}
    >
      <p className="section-kicker">
        <span />
        {title}
        <span />
      </p>
      {copy ? <p className="mt-3 text-sm leading-7 text-[#A3A3A3] sm:text-base">{copy}</p> : null}
    </div>
  );
}
