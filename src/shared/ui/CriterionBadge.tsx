import { Star, X } from "lucide-react";
import type { Criterion } from "@/entities/training/types";

const CriterionBadge = ({
  criterion,
  compact,
  onRemove,
}: {
  criterion: Criterion;
  compact?: boolean;
  onRemove: () => void;
}) => (
  <div
    className={`flex items-center justify-between rounded-lg bg-secondary/30 group/crit ${compact ? "px-3 py-1.5" : "px-3 py-2.5"}`}
  >
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex gap-0.5">
        {Array.from({ length: criterion.weight }).map((_, i) => (
          <Star
            key={i}
            className={`${compact ? "w-2 h-2" : "w-2.5 h-2.5"} fill-chart-4 text-chart-4`}
          />
        ))}
      </div>
      <div className="min-w-0">
        <p
          className={`font-medium truncate ${compact ? "text-[11px]" : "text-xs"}`}
        >
          {criterion.name}
        </p>
        {!compact && criterion.description && (
          <p className="text-[10px] text-muted-foreground truncate">
            {criterion.description}
          </p>
        )}
      </div>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <span
        className={`${compact ? "text-[10px]" : "text-[11px]"} text-muted-foreground font-mono`}
      >
        {criterion.scale}
      </span>
      <button
        onClick={onRemove}
        className="opacity-0 group-hover/crit:opacity-100 p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  </div>
);

export default CriterionBadge;
