import Image from "next/image";
import { TrendUpIcon } from "@/components/ui/icons";

const tones = {
  butter: "bg-butter",
  lime: "bg-lime",
  aqua: "bg-aqua",
  lilac: "bg-lilac",
  snow: "bg-snow",
} as const;

type StatCardProps = {
  label: string;
  value: string;
  delta: string;
  hint: string;
  tone: keyof typeof tones;
  showArrow?: boolean;
};

export function StatCard({ label, value, delta, hint, tone, showArrow = true }: StatCardProps) {
  return (
    <div className={`flex flex-1 items-center justify-between rounded-lg p-4 ${tones[tone]}`}>
      <div className="flex w-full flex-col gap-8">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-ink">{label}</p>
          <Image src="/icons/stat.svg" alt="" width={20} height={20} className="size-5" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[48px] leading-none font-semibold tracking-[-0.04em] text-ink">{value}</p>
          <div className="flex items-center gap-1">
            <span className="inline-flex items-center gap-1 rounded bg-snow px-[7px] py-0.5 text-[10px] font-semibold text-ink">
              {showArrow ? <TrendUpIcon className="size-2 text-ink" /> : null}
              {delta}
            </span>
            <span className="text-[10px] text-ink">{hint}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
