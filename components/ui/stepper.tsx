"use client";

import { Fragment } from "react";
import { CheckIcon } from "@/components/ui/icons";

type StepperProps = {
  steps: readonly string[];
  current: number;
  onSelect: (index: number) => void;
};

export function Stepper({ steps, current, onSelect }: StepperProps) {
  return (
    <div className="flex items-start" role="tablist" aria-label="Product form steps">
      {steps.map((label, index) => {
        const done = index < current;
        return (
          <Fragment key={label}>
            {index > 0 ? (
              <span
                aria-hidden
                className={`mt-2.5 h-[2px] flex-1 shrink transition-colors ${index <= current ? "bg-forest" : "bg-stone"}`}
              />
            ) : null}
            <button
              type="button"
              role="tab"
              aria-selected={index === current}
              onClick={() => onSelect(index)}
              className="flex shrink-0 flex-col items-center gap-1.5 px-1"
            >
              <span
                className={`flex size-5 items-center justify-center rounded-full transition-colors ${
                  done ? "bg-forest text-white" : "bg-stone text-ink"
                }`}
              >
                <CheckIcon className="size-2.5" />
              </span>
              <span className="whitespace-nowrap text-sm text-forest">{label}</span>
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}
