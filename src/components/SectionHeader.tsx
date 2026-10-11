import { cn } from "@/lib/cn";
import { Reveal } from "./Reveal";

type Props = {
  id: string;
  title: string;
  intro?: string;
  className?: string;
  align?: "left" | "split";
};

/** Section heading. "split" puts the intro beside the title on wide screens. */
export function SectionHeader({ id, title, intro, className, align = "split" }: Props) {
  return (
    <Reveal
      className={cn(
        "mb-14 sm:mb-20",
        align === "split" && "grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-end lg:gap-16",
        className,
      )}
    >
      <h2
        id={id}
        className="max-w-[18ch] text-[clamp(2rem,4.6vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.035em]"
      >
        {title}
      </h2>
      {intro && (
        <p className={cn("max-w-[52ch] text-base leading-relaxed text-muted sm:text-lg", align === "left" && "mt-6")}>
          {intro}
        </p>
      )}
    </Reveal>
  );
}
