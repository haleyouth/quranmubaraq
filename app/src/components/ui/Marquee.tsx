import { Star } from "lucide-react";

export function Marquee({ items }: { items: readonly string[] }) {
  // Duplicated once so the -50% translate produces a seamless loop
  const track = [...items, ...items];

  return (
    <div
      className="overflow-hidden border-y-4 border-ink bg-gold py-4"
      role="presentation"
      aria-hidden="true"
    >
      <div className="flex w-max animate-[marquee_30s_linear_infinite] gap-10 whitespace-nowrap md:gap-14">
        {track.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="font-display flex items-center gap-10 text-xl text-ink md:gap-14 md:text-2xl"
          >
            {item}
            <Star className="size-4 shrink-0 fill-ink" strokeWidth={0} />
          </span>
        ))}
      </div>
    </div>
  );
}
