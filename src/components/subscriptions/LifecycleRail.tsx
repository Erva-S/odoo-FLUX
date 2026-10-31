"use client";

import React from "react";
import clsx from "clsx";
import { Check, ArrowRight } from "lucide-react";
import { NeoButton } from "@/components/ui/NeoButton";

export type SubscriptionStage = "draft" | "quotation" | "confirmed" | "active" | "closed";

interface StageConfig {
  key: SubscriptionStage;
  label: string;
  actionName?: string;
  nextStage?: SubscriptionStage;
}

const STAGES: StageConfig[] = [
  { key: "draft", label: "Draft", actionName: "Send Quotation", nextStage: "quotation" },
  { key: "quotation", label: "Quotation", actionName: "Confirm Order", nextStage: "confirmed" },
  { key: "confirmed", label: "Confirmed", actionName: "Activate Subscription", nextStage: "active" },
  { key: "active", label: "Active", actionName: "Close Subscription", nextStage: "closed" },
  { key: "closed", label: "Closed" },
];

interface LifecycleRailProps {
  currentStage: SubscriptionStage;
  stageDates?: Partial<Record<SubscriptionStage, string>>;
  onAdvanceStage?: (nextStage: SubscriptionStage) => void;
  canAdvance?: boolean;
}

export const LifecycleRail: React.FC<LifecycleRailProps> = ({
  currentStage,
  stageDates = {},
  onAdvanceStage,
  canAdvance = true,
}) => {
  const currentIndex = STAGES.findIndex((s) => s.key === currentStage);
  const currentConfig = STAGES[currentIndex] || STAGES[0];

  return (
    <div className="bg-neoCharcoal text-neoWhite border-2 border-black rounded-[14px] shadow-neo-lg p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b-2 border-neoDark mb-6">
          <span className="text-xs uppercase tracking-widest font-heading font-extrabold text-neoSage">
            Lifecycle Progress
          </span>
          <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-neoDark text-neoYellow border border-black font-bold">
            STAGE {currentIndex + 1} OF 5
          </span>
        </div>

        {/* Vertical Stepper */}
        <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-neoDark">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const isFuture = idx > currentIndex;
            const stageDate = stageDates[stage.key];

            return (
              <div key={stage.key} className="relative flex items-start gap-4 group">
                {/* Stage Indicator Node */}
                <div
                  className={clsx(
                    "absolute -left-6 top-0 w-6 h-6 rounded-full border-2 border-black flex items-center justify-center transition-all duration-300",
                    isCurrent && "bg-neoYellow text-black shadow-[2px_2px_0_0_#000] scale-110",
                    isCompleted && "bg-neoSage text-black",
                    isFuture && "bg-neoDark text-neutral-500"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    <span className="text-[10px] font-bold font-mono">{idx + 1}</span>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={clsx(
                        "font-heading font-extrabold text-base transition-colors",
                        isCurrent && "text-neoYellow text-lg",
                        isCompleted && "text-neoSage",
                        isFuture && "text-neutral-400"
                      )}
                    >
                      {stage.label}
                    </span>
                    {stageDate && (
                      <span className="text-xs font-mono text-neutral-400 tnum">
                        {stageDate}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {isCompleted
                      ? "Completed"
                      : isCurrent
                      ? "Current Stage"
                      : "Upcoming"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Single Allowed Action Push Button */}
      {currentConfig.nextStage && onAdvanceStage && (
        <div className="pt-8 border-t-2 border-neoDark mt-6">
          <p className="text-xs uppercase font-bold text-neutral-400 mb-2">
            Next Allowed Action
          </p>
          <NeoButton
            variant={currentConfig.nextStage === "closed" ? "destructive" : "primary"}
            className={clsx(
              "w-full justify-between",
              currentConfig.nextStage !== "closed" && "!bg-neoYellow !text-black !border-black"
            )}
            onClick={() => currentConfig.nextStage && onAdvanceStage(currentConfig.nextStage)}
            disabled={!canAdvance}
            icon={<ArrowRight className="w-4 h-4 ml-auto" />}
          >
            {currentConfig.actionName}
          </NeoButton>
        </div>
      )}
    </div>
  );
};

