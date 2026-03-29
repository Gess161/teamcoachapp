import { PHASE_COLORS } from "@/entities/macrocycle/constants";
import type { MacroDoc } from "@/entities/macrocycle/types";

const MacroCycleBar = ({ macro }: { macro: MacroDoc }) => {
  const today = new Date().toISOString().split("T")[0];
  const totalMs =
    new Date(macro.endDate).getTime() - new Date(macro.startDate).getTime();

  const phases = [
    { label: "ЗФП", ...macro.phases.preparatoryGeneral },
    { label: "СФП", ...macro.phases.preparatorySpecial },
    { label: "Змаг.", ...macro.phases.competitive },
    { label: "Перех.", ...macro.phases.transitional },
  ];

  const todayMs =
    new Date(today).getTime() - new Date(macro.startDate).getTime();
  const todayPct = Math.max(0, Math.min(100, (todayMs / totalMs) * 100));
  const isInRange = today >= macro.startDate && today <= macro.endDate;

  return (
    <div className="space-y-1">
      <div className="relative flex h-2.5 rounded-full overflow-hidden">
        {phases.map((ph, i) => {
          const phMs =
            new Date(ph.endDate).getTime() - new Date(ph.startDate).getTime();
          const w = (phMs / totalMs) * 100;
          return (
            <div
              key={i}
              className={`${PHASE_COLORS[i]} opacity-70`}
              style={{ width: `${w}%` }}
              title={`${ph.label}: ${ph.startDate} – ${ph.endDate}`}
            />
          );
        })}
        {isInRange && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white/90 z-10"
            style={{ left: `${todayPct}%` }}
          />
        )}
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{macro.startDate.substring(0, 7)}</span>
        <span>{macro.endDate.substring(0, 7)}</span>
      </div>
    </div>
  );
};

export default MacroCycleBar;
